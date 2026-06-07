export type UserRole      = 'donor' | 'requester' | 'pmi';
export type BloodType     = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type UrgencyLevel  = 'critical' | 'urgent' | 'normal';
export type RequestStatus = 'open' | 'in_progress' | 'fulfilled' | 'cancelled';
export type MatchStatus   = 'pending' | 'accepted' | 'declined' | 'blood_ready' | 'ready_for_collection' | 'collected' | 'completed';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  phone: string;
  blood_type: BloodType | null;
  city: string;
  province: string;
  avatar_url: string | null;
  is_profile_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface DonorDetails {
  id: string;
  is_available: boolean;
  last_donated_at: string | null;
  weight: number | null;
  age: number | null;
  total_donations: number;
  created_at: string;
  updated_at: string;
}

export interface BloodRequest {
  id: string;
  requester_id: string;
  patient_name: string;
  blood_type: BloodType;
  bags_needed: number;
  urgency: UrgencyLevel;
  hospital_name: string;
  pmi_branch: string;
  city: string;
  province: string;
  notes: string | null;
  status: RequestStatus;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;         // joined requester profile
}

export interface Match {
  id: string;
  request_id: string;
  donor_id: string;
  status: MatchStatus;
  responded_at: string | null;
  created_at: string;
  blood_requests?: BloodRequest;
  profiles?: Profile;           // joined donor profile
  screenings?: Screening[];
}

export interface DonationHistory {
  id: string;
  donor_id: string;
  match_id: string | null;
  hospital_name: string | null;
  donated_at: string;
  bags_donated: number;
  notes: string | null;
  created_at: string;
}

export interface Screening {
  id: string;
  match_id: string;
  pmi_admin_id: string;
  pmi_branch: string;
  blood_pressure: string;
  hemoglobin: number;
  pulse: number;
  weight: number;
  status: 'passed' | 'failed';
  notes: string | null;
  created_at: string;
}

// Form data shapes (used with React Hook Form + Zod)
export interface RegisterFormData {
  email: string;
  password: string;
  role: UserRole;
}

export interface ProfileSetupFormData {
  full_name: string;
  phone: string;
  blood_type: BloodType;
  city: string;
  province: string;
  age?: number;            // donor only
  weight?: number;         // donor only
  last_donated_at?: string; // donor only
}

export interface BloodRequestFormData {
  patient_name: string;
  blood_type: BloodType;
  bags_needed: number;
  urgency: UrgencyLevel;
  hospital_name: string;
  pmi_branch: string;
  city: string;
  province: string;
  notes?: string;
  expires_at?: string;
}
