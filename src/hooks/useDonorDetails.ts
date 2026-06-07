import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { DonorDetails } from '../types';

export function useDonorDetails() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setDonorDetails } = useAuthStore();

  const updateDonorDetails = async (updates: Partial<DonorDetails>) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      setError('No authenticated user found');
      return { success: false, error: 'Unauthenticated' };
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        id: currentUser.id,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // upsert = insert if not exists, update if exists (by primary key)
      const { data, error: err } = await supabase
        .from('donor_details')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (err) throw err;

      if (data) {
        setDonorDetails(data as DonorDetails);
      } else {
        // Re-fetch to be sure
        const { data: fetchRes } = await supabase
          .from('donor_details')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle();
        if (fetchRes) setDonorDetails(fetchRes as DonorDetails);
      }
      return { success: true, data };
    } catch (err: any) {
      setError(err.message || 'Failed to update donor details');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = async (isAvailable: boolean) => {
    return updateDonorDetails({ is_available: isAvailable });
  };

  return {
    updateDonorDetails,
    updateAvailability,
    loading,
    error,
  };
}
