import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { BloodRequest, BloodRequestFormData, RequestStatus } from '../types';

export function useBloodRequests() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const createBloodRequest = async (formData: BloodRequestFormData) => {
    if (!user) return { success: false, error: 'Unauthenticated' };

    setLoading(true);
    setError(null);
    try {
      const payload = {
        requester_id: user.id,
        patient_name: formData.patient_name,
        blood_type: formData.blood_type,
        bags_needed: formData.bags_needed,
        urgency: formData.urgency,
        hospital_name: formData.hospital_name,
        pmi_branch: formData.pmi_branch,
        city: formData.city,
        province: formData.province,
        notes: formData.notes || null,
        status: 'open' as RequestStatus,
        expires_at: formData.expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const { data, error: err } = await supabase
        .from('blood_requests')
        .insert(payload)
        .select()
        .single();

      if (err) throw err;

      return { success: true, data: data as BloodRequest };
    } catch (err: any) {
      setError(err.message || 'Failed to create blood request');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = useCallback(async () => {
    if (!user) return { success: false, error: 'Unauthenticated' };
    
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('blood_requests')
        .select('*, profiles(*)')
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

      if (err) throw err;
      return { success: true, data: data as BloodRequest[] };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchRequestById = useCallback(async (requestId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('blood_requests')
        .select('*, profiles(*)')
        .eq('id', requestId)
        .single();

      if (err) throw err;
      return { success: true, data: data as BloodRequest };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRequestStatus = async (requestId: string, status: RequestStatus) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('blood_requests')
        .update({ status })
        .eq('id', requestId)
        .select()
        .single();

      if (err) throw err;
      return { success: true, data: data as BloodRequest };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const fetchBrowseRequests = useCallback(async (bloodType: string) => {
    setLoading(true);
    setError(null);
    try {
      // Build query — if donor hasn't set blood type yet, show ALL open requests
      let query = supabase
        .from('blood_requests')
        .select('*, profiles(*)')
        .in('status', ['open', 'in_progress'])
        .order('created_at', { ascending: false });

      // Only filter by blood type if the donor has one set
      if (bloodType && bloodType.trim() !== '') {
        query = query.eq('blood_type', bloodType);
      }

      const { data: requests, error: err } = await query;

      if (err) throw err;

      // Filter out expired ones on client side
      // Sort by urgency weight: critical > urgent > normal
      const urgencyWeight: Record<string, number> = { critical: 3, urgent: 2, normal: 1 };
      const activeRequests = (requests || [])
        .filter((req: any) => {
          if (!req.expires_at) return true;
          return new Date(req.expires_at).getTime() > Date.now();
        })
        .sort((a: any, b: any) => {
          const wA = urgencyWeight[a.urgency] ?? 0;
          const wB = urgencyWeight[b.urgency] ?? 0;
          return wB - wA; // descending: critical first
        });

      return { success: true, data: activeRequests as BloodRequest[] };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createBloodRequest,
    fetchMyRequests,
    fetchRequestById,
    updateRequestStatus,
    fetchBrowseRequests,
    loading,
    error,
  };
}
