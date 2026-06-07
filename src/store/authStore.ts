import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile, DonorDetails } from '../types';

interface AuthState {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  donorDetails: DonorDetails | null;
  isLoading: boolean;
  setUser: (user: { id: string; email: string } | null) => void;
  setProfile: (profile: Profile | null) => void;
  setDonorDetails: (donorDetails: DonorDetails | null) => void;
  setLoading: (isLoading: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      donorDetails: null,
      isLoading: true,
      
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setDonorDetails: (donorDetails) => set({ donorDetails }),
      setLoading: (isLoading) => set({ isLoading }),
      
      clear: () => set({ user: null, profile: null, donorDetails: null, isLoading: false }),
    }),
    {
      name: 'ResQBlood-auth',
      partialize: (state) => ({ user: state.user }), // Persist only user, not profiles or loading state
    }
  )
);
