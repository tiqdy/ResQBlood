import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { Profile } from '../types';

export function useProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setProfile } = useAuthStore();

  const updateProfile = async (updates: Partial<Profile>) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      setError('No authenticated user found');
      return { success: false, error: 'Unauthenticated' };
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: updateErr } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      if (data) {
        setProfile(data as Profile);
      }
      return { success: true, data };
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    updateProfile,
    loading,
    error,
  };
}
