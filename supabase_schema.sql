-- Supabase Database Schema for ResQBlood
-- Execute this SQL script in the Supabase SQL Editor to set up your tables, triggers, and RLS policies.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('donor', 'requester');
CREATE TYPE blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE urgency_level AS ENUM ('critical', 'urgent', 'normal');
CREATE TYPE request_status AS ENUM ('open', 'in_progress', 'fulfilled', 'cancelled');
CREATE TYPE match_status AS ENUM ('pending', 'accepted', 'declined', 'completed');

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           TEXT NOT NULL DEFAULT '',
  role                user_role NOT NULL,
  phone               TEXT DEFAULT '',
  blood_type          blood_type,
  city                TEXT DEFAULT '',
  province            TEXT DEFAULT '',
  avatar_url          TEXT,
  is_profile_complete BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Donor-specific details (only rows for donor role)
CREATE TABLE public.donor_details (
  id               UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_available     BOOLEAN DEFAULT TRUE,
  last_donated_at  DATE,
  weight           NUMERIC(5,2),
  age              INTEGER,
  total_donations  INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Blood requests
CREATE TABLE public.blood_requests (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_name   TEXT NOT NULL,
  blood_type     blood_type NOT NULL,
  bags_needed    INTEGER NOT NULL DEFAULT 1,
  urgency        urgency_level NOT NULL DEFAULT 'normal',
  hospital_name  TEXT NOT NULL,
  pmi_branch     TEXT NOT NULL,
  city           TEXT NOT NULL,
  province       TEXT NOT NULL,
  notes          TEXT,
  status         request_status DEFAULT 'open',
  expires_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Donor ↔ Request matches
CREATE TABLE public.matches (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id      UUID NOT NULL REFERENCES public.blood_requests(id) ON DELETE CASCADE,
  donor_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status          match_status DEFAULT 'pending',
  responded_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_id, donor_id)
);

-- Completed donation records
CREATE TABLE public.donation_history (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_id       UUID REFERENCES public.matches(id),
  hospital_name  TEXT,
  donated_at     DATE NOT NULL DEFAULT NOW(),
  bags_donated   INTEGER DEFAULT 1,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at      BEFORE UPDATE ON public.profiles      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER donor_details_updated_at BEFORE UPDATE ON public.donor_details  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER blood_requests_updated_at BEFORE UPDATE ON public.blood_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile row on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'role')::user_role,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Row Level Security (RLS) Configuration
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_details   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_history ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- DONOR DETAILS
CREATE POLICY "Authenticated users view donor details"
  ON public.donor_details FOR SELECT TO authenticated USING (true);
CREATE POLICY "Donors manage own details"
  ON public.donor_details FOR ALL TO authenticated USING (auth.uid() = id);

-- BLOOD REQUESTS
CREATE POLICY "Authenticated users view all requests"
  ON public.blood_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Requesters manage own requests"
  ON public.blood_requests FOR ALL TO authenticated USING (auth.uid() = requester_id);

-- MATCHES
CREATE POLICY "Donors see own matches"
  ON public.matches FOR SELECT TO authenticated USING (auth.uid() = donor_id);
CREATE POLICY "Requesters see matches for their requests"
  ON public.matches FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.blood_requests r WHERE r.id = request_id AND r.requester_id = auth.uid()));
CREATE POLICY "Donors insert matches"
  ON public.matches FOR INSERT TO authenticated WITH CHECK (auth.uid() = donor_id);
CREATE POLICY "Donors update own match status"
  ON public.matches FOR UPDATE TO authenticated USING (auth.uid() = donor_id);
CREATE POLICY "Requesters update match to completed"
  ON public.matches FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.blood_requests r WHERE r.id = request_id AND r.requester_id = auth.uid()));

-- DONATION HISTORY
CREATE POLICY "Donors see own history"
  ON public.donation_history FOR SELECT TO authenticated USING (auth.uid() = donor_id);
CREATE POLICY "Donors insert own history"
  ON public.donation_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = donor_id);
