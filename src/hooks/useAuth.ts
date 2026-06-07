import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { RegisterFormData, Profile, DonorDetails, Match, DonationHistory } from '../types';

export function useAuth() {
  const [authError, setAuthError] = useState<string | null>(null);
  const { setUser, setProfile, setDonorDetails, setLoading, clear } = useAuthStore();

  const fetchProfileAndDetails = useCallback(async (userId: string) => {
    try {
      // Fetch Profile
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileErr) throw profileErr;

      if (profileData) {
        setProfile(profileData as Profile);
        
        // If they are a donor, fetch donor details too
        if (profileData.role === 'donor') {
          const { data: donorData, error: donorErr } = await supabase
            .from('donor_details')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          if (donorErr) throw donorErr;
          
          if (donorData) {
            // Self-healing database sync for donor counts
            try {
              // 1. Fetch donor's volunteered matches that are successful/completed
              const { data: matchesData } = await supabase
                .from('matches')
                .select('*, blood_requests(*)')
                .eq('donor_id', userId);

              const completedMatches = matchesData
                ? (matchesData as Match[]).filter((m: Match) =>
                    ['blood_ready', 'ready_for_collection', 'collected', 'completed'].includes(m.status)
                  )
                : [];

              // 2. Fetch existing donation history
              let { data: historyData } = await supabase
                .from('donation_history')
                .select('*')
                .eq('donor_id', userId);

              // Self-healing check for duplicate history rows for the same match_id
              if (historyData && historyData.length > 0) {
                const seenMatches = new Set<string>();
                const duplicatesToDelete: string[] = [];
                const uniqueHistory: DonationHistory[] = [];

                for (const h of historyData) {
                  if (h.match_id) {
                    if (seenMatches.has(h.match_id)) {
                      duplicatesToDelete.push(h.id);
                    } else {
                      seenMatches.add(h.match_id);
                      uniqueHistory.push(h);
                    }
                  } else {
                    uniqueHistory.push(h);
                  }
                }

                if (duplicatesToDelete.length > 0) {
                  await supabase
                    .from('donation_history')
                    .delete()
                    .in('id', duplicatesToDelete);
                  historyData = uniqueHistory;
                }
              }

              // 3. Find any matches that are completed/passed screening but lack history records (e.g. RLS blocked PMI or trigger failed)
              const missingMatches = completedMatches.filter(
                (m: Match) => !historyData || !historyData.some((h: DonationHistory) => h.match_id === m.id)
              );

              if (missingMatches.length > 0) {
                for (const m of missingMatches) {
                  await supabase.from('donation_history').insert({
                    donor_id: userId,
                    match_id: m.id,
                    hospital_name: m.blood_requests?.hospital_name || 'PMI Branch Referral',
                    donated_at: m.responded_at ? m.responded_at.split('T')[0] : new Date().toISOString().split('T')[0],
                    bags_donated: 1,
                    notes: 'ResQBlood Voluntary Donation Match',
                  });
                }
                // Re-fetch donation history
                const { data: updatedHistory } = await supabase
                  .from('donation_history')
                  .select('*')
                  .eq('donor_id', userId);
                historyData = updatedHistory;
              }

              // 4. Calculate count and latest donation date
              const calculatedCount = historyData ? historyData.length : 0;
              const sortedHistory = historyData
                ? [...historyData].sort((a, b) => new Date(b.donated_at).getTime() - new Date(a.donated_at).getTime())
                : [];
              const calculatedLastDate = sortedHistory.length > 0 ? sortedHistory[0].donated_at : null;

              // 5. Update donor_details if database is out of sync
              if (donorData.total_donations !== calculatedCount || donorData.last_donated_at !== calculatedLastDate) {
                const { data: updatedDonorData } = await supabase
                  .from('donor_details')
                  .update({
                    total_donations: calculatedCount,
                    last_donated_at: calculatedLastDate,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', userId)
                  .select()
                  .maybeSingle();

                if (updatedDonorData) {
                  setDonorDetails(updatedDonorData as DonorDetails);
                } else {
                  setDonorDetails({
                    ...donorData,
                    total_donations: calculatedCount,
                    last_donated_at: calculatedLastDate,
                  } as DonorDetails);
                }
              } else {
                setDonorDetails(donorData as DonorDetails);
              }
            } catch (syncErr) {
              console.warn('Donor details self-healing sync failed:', syncErr);
              setDonorDetails(donorData as DonorDetails);
            }
          }
        }
      }
      return profileData;
    } catch (err: any) {
      console.error('Error fetching auth data:', err.message);
      return null;
    }
  }, [setProfile, setDonorDetails]);

  const signUp = async (data: RegisterFormData) => {
    setAuthError(null);
    setLoading(true);
    try {
      const { data: authData, error: signUpErr } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            role: data.role,
            full_name: '', // Will be filled in onboarding
          },
        },
      });

      if (signUpErr) throw signUpErr;

      if (authData.user) {
        setUser({ id: authData.user.id, email: authData.user.email! });
        await fetchProfileAndDetails(authData.user.id);
      }
      return { success: true, user: authData.user };
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthError(null);
    setLoading(true);
    try {
      const { data: authData, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInErr) throw signInErr;

      if (authData.user) {
        setUser({ id: authData.user.id, email: authData.user.email! });
        const profile = await fetchProfileAndDetails(authData.user.id);
        return { success: true, user: authData.user, profile };
      }
      return { success: false, error: 'User session not initialized' };
    } catch (err: any) {
      setAuthError(err.message || 'Invalid credentials');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      clear();
    }
  };

  const initSession = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
        await fetchProfileAndDetails(session.user.id);
      } else {
        clear();
      }
    } catch (err) {
      console.error('Error initializing session:', err);
      clear();
    } finally {
      setLoading(false);
    }
  }, [setUser, fetchProfileAndDetails, clear, setLoading]);

  return {
    signUp,
    signIn,
    signOut,
    initSession,
    fetchProfileAndDetails,
    authError,
  };
}
