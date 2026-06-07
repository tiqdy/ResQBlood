import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { Match, MatchStatus } from '../types';

export function useMatches() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, donorDetails } = useAuthStore();

  const volunteer = async (requestId: string) => {
    if (!user) return { success: false, error: 'Unauthenticated' };
    
    // Check if donor availability is active
    if (donorDetails && !donorDetails.is_available) {
      return { success: false, error: 'Set availability to active first.' };
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        request_id: requestId,
        donor_id: user.id,
        status: 'pending' as MatchStatus,
      };

      const { data, error: err } = await supabase
        .from('matches')
        .insert(payload)
        .select()
        .single();

      if (err) {
        if (err.message?.includes('unique') || err.message?.includes('duplicate')) {
          throw new Error("You've already volunteered for this request.");
        }
        throw err;
      }

      // Automatically update the request status to 'in_progress' when a donor volunteers.
      // This may fail silently due to RLS (only requester can update their own request),
      // so we swallow any error here — the match is still created successfully.
      try {
        const { data: requestData } = await supabase
          .from('blood_requests')
          .select('status')
          .eq('id', requestId)
          .single();

        if (requestData && requestData.status === 'open') {
          await supabase
            .from('blood_requests')
            .update({ status: 'in_progress' })
            .eq('id', requestId);
        }
      } catch (_e) {
        // Non-critical — ignore if donor can't update request status
      }

      return { success: true, data: data as Match };
    } catch (err: any) {
      setError(err.message || 'Failed to volunteer');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchesByDonor = useCallback(async () => {
    if (!user) return { success: false, error: 'Unauthenticated' };

    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('matches')
        .select('*, blood_requests(*), screenings(*)')
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false });

      if (err) throw err;
      return { success: true, data: data as Match[] };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchMatchesByRequest = useCallback(async (requestId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('matches')
        .select('*, profiles(*, donor_details(*)), screenings(*)')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (err) throw err;
      return { success: true, data: data as any[] };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMatchStatus = async (matchId: string, status: MatchStatus) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('matches')
        .update({
          status,
          responded_at: new Date().toISOString(),
        })
        .eq('id', matchId)
        .select()
        .single();

      if (err) throw err;
      return { success: true, data: data as Match };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const acceptMatch = async (matchId: string) => {
    return updateMatchStatus(matchId, 'accepted');
  };

  const declineMatch = async (matchId: string) => {
    return updateMatchStatus(matchId, 'declined');
  };

  const completeMatch = async (matchId: string) => {
    // Complete match triggers: status = completed
    // (In mock DB, completing a match automatically adds donation history & updates donor stats)
    // If real DB, we also insert donation history via hook client side:
    setLoading(true);
    setError(null);
    try {
      const { data: matchData, error: matchErr } = await supabase
        .from('matches')
        .select('*, blood_requests(*)')
        .eq('id', matchId)
        .single();

      if (matchErr) throw matchErr;

      // Update match status to completed
      const { data: completedMatch, error: err } = await supabase
        .from('matches')
        .update({
          status: 'completed',
          responded_at: new Date().toISOString(),
        })
        .eq('id', matchId)
        .select()
        .single();

      if (err) throw err;

      // Check if a donation history record already exists for this match
      const { data: existingHist } = await supabase
        .from('donation_history')
        .select('id')
        .eq('match_id', matchId)
        .maybeSingle();

      if (!existingHist) {
        // Insert donation history record
        const historyPayload = {
          donor_id: matchData.donor_id,
          match_id: matchId,
          hospital_name: matchData.blood_requests?.hospital_name || 'Unknown Hospital',
          donated_at: new Date().toISOString().split('T')[0],
          bags_donated: matchData.blood_requests?.bags_needed || 1,
          notes: 'ResQBlood Voluntary Donation Match Completed',
        };
        const { error: histErr } = await supabase
          .from('donation_history')
          .insert(historyPayload);
        if (histErr) console.warn('donation_history insert failed:', histErr.message);

        // Increment donor total_donations count
        const { data: donorDets } = await supabase
          .from('donor_details')
          .select('total_donations')
          .eq('id', matchData.donor_id)
          .single();

        if (donorDets) {
          const { error: updateErr } = await supabase
            .from('donor_details')
            .update({
              total_donations: (donorDets.total_donations || 0) + 1,
              last_donated_at: new Date().toISOString().split('T')[0],
            })
            .eq('id', matchData.donor_id);
          if (updateErr) console.warn('donor_details update failed:', updateErr.message);
        }
      }

      return { success: true, data: completedMatch as Match };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchDonationHistory = useCallback(async () => {
    if (!user) return { success: false, error: 'Unauthenticated' };
    
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('donation_history')
        .select('*')
        .eq('donor_id', user.id)
        .order('donated_at', { ascending: false });

      if (err) throw err;

      // Filter out duplicate records for the same match_id on client side
      const seen = new Set<string>();
      const uniqueData = (data || []).filter((h: any) => {
        if (h.match_id) {
          if (seen.has(h.match_id)) return false;
          seen.add(h.match_id);
        }
        return true;
      });

      return { success: true, data: uniqueData };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    volunteer,
    fetchMatchesByDonor,
    fetchMatchesByRequest,
    acceptMatch,
    declineMatch,
    completeMatch,
    fetchDonationHistory,
    loading,
    error,
  };
}
