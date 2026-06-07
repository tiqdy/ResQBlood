import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { useDonorDetails } from '../../hooks/useDonorDetails';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { Heart, Landmark, Building2, Droplet, CheckCircle2, ChevronRight, User, Activity } from 'lucide-react';
import type { UserRole, BloodType } from '../../types';
import resqLogo from '../../assets/resqblood-logo.png';
import donorDarah from '../../assets/donor-darah.png';
import { BLOOD_TYPES, BLOOD_TYPE_COLORS } from '../../constants/bloodTypes';
import { PROVINCES } from '../../constants/provinces';
import { CITIES_BY_PROVINCE, ALL_CITIES } from '../../constants/cities';
import { motion, AnimatePresence } from 'framer-motion';

const roleOptions = [
  {
    value: 'donor' as UserRole,
    label: 'Blood Donor',
    subtitle: 'Volunteer to save lives',
    icon: Heart,
    color: 'text-red-600',
    selectedBg: 'bg-red-50 border-red-400 ring-2 ring-red-400/20',
    iconBg: 'bg-red-100',
  },
  {
    value: 'requester' as UserRole,
    label: 'Recipient',
    subtitle: 'Request blood for a patient',
    icon: Landmark,
    color: 'text-orange-600',
    selectedBg: 'bg-orange-50 border-orange-400 ring-2 ring-orange-400/20',
    iconBg: 'bg-orange-100',
  },
  {
    value: 'pmi' as UserRole,
    label: 'PMI Staff',
    subtitle: 'Manage blood bank operations',
    icon: Building2,
    color: 'text-blue-600',
    selectedBg: 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/20',
    iconBg: 'bg-blue-100',
  },
];

export default function Register() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('donor');

  // Step 2 Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodType, setBloodType] = useState<BloodType | null>(null);
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');

  // Step 3 Fields (Only for Donor)
  const [age, setAge] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [lastDonatedAt, setLastDonatedAt] = useState('');

  const { signUp } = useAuth();
  const { updateProfile } = useProfile();
  const { updateDonorDetails } = useDonorDetails();
  const navigate = useNavigate();

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setStep(2);
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !province || !city) {
      toast.error('Please fill in all contact and location fields.');
      return;
    }
    if (phone.length < 10) {
      toast.error('Please enter a valid phone number (min 10 digits).');
      return;
    }
    if (role !== 'pmi' && !bloodType) {
      toast.error('Please select your blood type.');
      return;
    }

    if (role === 'donor') {
      setStep(3);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (role === 'donor') {
      if (!age || !weight) {
        toast.error('Age and weight are required.');
        return;
      }
      if (Number(age) < 17 || Number(age) > 65) {
        toast.error('Donor age must be between 17 and 65 years.');
        return;
      }
      if (Number(weight) < 45) {
        toast.error('Donor weight must be at least 45 kg.');
        return;
      }
    }

    setLoading(true);
    try {
      // 1. Auth Sign Up
      const res = await signUp({ email, password, role });
      if (!res.success) {
        toast.error(res.error || 'Failed to create user account.');
        setLoading(false);
        return;
      }

      // 2. Profile Details Update
      const profileRes = await updateProfile({
        full_name: fullName,
        phone,
        blood_type: role === 'pmi' ? null : bloodType,
        city,
        province,
        is_profile_complete: true,
      });

      if (!profileRes.success) {
        toast.error(profileRes.error || 'Failed to save profile details.');
        setLoading(false);
        return;
      }

      // 3. Donor details (only if role is donor)
      if (role === 'donor') {
        const donorRes = await updateDonorDetails({
          age: Number(age),
          weight: Number(weight),
          last_donated_at: lastDonatedAt || null,
          is_available: true,
        });

        if (!donorRes.success) {
          toast.error(donorRes.error || 'Failed to save donor specific details.');
          setLoading(false);
          return;
        }
      }

      toast.success('Account created successfully! Welcome to ResQBlood.');
      
      // Redirect based on role
      if (role === 'donor') {
        navigate('/donor', { replace: true });
      } else if (role === 'pmi') {
        navigate('/pmi', { replace: true });
      } else {
        navigate('/requester', { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {/* ── Left Panel: Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 via-red-700 to-red-900 relative overflow-hidden flex-col justify-between p-12 h-full">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 h-96 w-96 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 left-0 h-64 w-64 bg-white/5 rounded-full -translate-x-16 translate-y-16" />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-3.5 select-none">
          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-md p-1.5 shrink-0">
            <img src={resqLogo} alt="ResQBlood Logo" className="h-full w-full object-contain" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">ResQBlood</span>
        </Link>

        {/* Illustration */}
        <div className="relative flex items-center justify-center flex-1 py-8">
          <div className="relative w-full max-w-[420px] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20">
            <img 
              src={donorDarah} 
              alt="Blood Donation" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Benefits */}
        <div className="relative flex flex-col gap-3">
          <h2 className="text-white text-xl font-black mb-2">
            Join the community
          </h2>
          {[
            'Free to register — no hidden fees',
            'Matched by blood type & location',
            'PMI-verified donation process',
            'Track your donation impact',
          ].map(text => (
            <div key={text} className="flex items-center gap-2.5 text-white/90 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel: Registration Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50/50 h-full overflow-y-auto">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center justify-center gap-2.5 mb-10 select-none">
            <img src={resqLogo} alt="ResQBlood Logo" className="h-10 w-10 object-contain" />
            <span className="text-2xl font-black text-gray-900">
              ResQ<span className="text-red-600">Blood</span>
            </span>
          </Link>

          {/* Progress Tracker */}
          <div className="mb-8 flex items-center justify-between max-w-xs mx-auto">
            <div className="flex flex-col items-center">
              <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= 1 ? 'bg-red-600 text-white shadow-md shadow-red-600/10' : 'bg-gray-200 text-gray-400'
              }`}>
                1
              </span>
              <span className="text-[10px] font-bold text-gray-500 mt-1">Credentials</span>
            </div>
            <div className={`flex-1 h-0.5 mx-2 transition-colors ${step >= 2 ? 'bg-red-600' : 'bg-gray-200'}`} />
            <div className="flex flex-col items-center">
              <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= 2 ? 'bg-red-600 text-white shadow-md shadow-red-600/10' : 'bg-gray-200 text-gray-400'
              }`}>
                2
              </span>
              <span className="text-[10px] font-bold text-gray-500 mt-1">Profile Info</span>
            </div>
            {role === 'donor' && (
              <>
                <div className={`flex-1 h-0.5 mx-2 transition-colors ${step >= 3 ? 'bg-red-600' : 'bg-gray-200'}`} />
                <div className="flex flex-col items-center">
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= 3 ? 'bg-red-600 text-white shadow-md shadow-red-600/10' : 'bg-gray-200 text-gray-400'
                  }`}>
                    3
                  </span>
                  <span className="text-[10px] font-bold text-gray-500 mt-1">Eligibility</span>
                </div>
              </>
            )}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleStep1Next}
                className="flex flex-col gap-5"
              >
                <div className="mb-2">
                  <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full border border-red-100 mb-4">
                    <Droplet className="h-3 w-3 fill-red-500" />
                    Create your free account
                  </div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">Get Started</h1>
                  <p className="text-gray-500 text-sm mt-1.5">Join ResQBlood and start making a difference.</p>
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  id="register-email"
                />
                
                <Input
                  label="Password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  id="register-password"
                />

                {/* Role Selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 select-none">I am registering as:</label>
                  <div className="flex flex-col gap-2">
                    {roleOptions.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = role === opt.value;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => !loading && setRole(opt.value)}
                          className={`flex items-center gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all select-none ${
                            isSelected
                              ? opt.selectedBg
                              : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${opt.iconBg}`}>
                            <Icon className={`h-4.5 w-4.5 ${opt.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold leading-none ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                              {opt.label}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{opt.subtitle}</p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className={`h-5 w-5 shrink-0 ${opt.color}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2 h-12 font-bold text-base shadow-lg shadow-red-600/20 rounded-xl"
                  disabled={loading}
                >
                  Continue <ChevronRight className="h-4.5 w-4.5 ml-1 inline-block" />
                </Button>

                <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm">
                  <span className="text-gray-500">Already have an account? </span>
                  <Link to="/login" className="font-bold text-red-600 hover:text-red-700 select-none transition-colors">
                    Login Here
                  </Link>
                </div>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleStep2Next}
                className="flex flex-col gap-5"
              >
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-1 flex items-center gap-2">
                    <User className="h-5 w-5 text-red-600" />
                    Profile Details
                  </h2>
                  <p className="text-gray-500 text-sm">Provide your name, phone number, and location.</p>
                </div>

                <Input
                  label="Full Name"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  required
                />

                <Input
                  label="Phone Number"
                  placeholder="e.g. 081234567890"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  required
                />

                {/* Blood Type Grid (Donors & Requesters only, not PMI staff) */}
                {role !== 'pmi' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700 select-none">Blood Type</label>
                    <div className="grid grid-cols-4 gap-2">
                      {BLOOD_TYPES.map((bt) => {
                        const colors = BLOOD_TYPE_COLORS[bt];
                        const isSelected = bloodType === bt;
                        return (
                          <div
                            key={bt}
                            onClick={() => !loading && setBloodType(bt)}
                            className={`border rounded-xl p-2.5 flex items-center justify-center cursor-pointer transition-all font-black text-xs select-none active:scale-[0.98] ${
                              isSelected
                                ? `${colors.bg} ${colors.text} border-red-600 ring-2 ring-red-600/10 scale-[1.03]`
                                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {bt}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Province"
                    value={province}
                    onChange={(e) => {
                      setProvince(e.target.value);
                      setCity(''); // Reset selected city
                    }}
                    disabled={loading}
                    required
                  >
                    <option value="">Select Province</option>
                    {role === 'pmi' && <option value="National">National (All Provinces)</option>}
                    {PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="City / Regency"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={loading || !province}
                    required
                  >
                    <option value="">Select City</option>
                    {role === 'pmi' && province === 'National' && <option value="All">All Cities</option>}
                    {province && CITIES_BY_PROVINCE[province] ? (
                      CITIES_BY_PROVINCE[province].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))
                    ) : (
                      ALL_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))
                    )}
                  </Select>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="flex-1 font-bold h-12 border border-gray-200 text-gray-600 rounded-xl"
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 font-bold h-12 rounded-xl"
                    isLoading={loading}
                  >
                    {role === 'donor' ? 'Next Step' : 'Create Account'}
                  </Button>
                </div>
              </motion.form>
            )}

            {step === 3 && role === 'donor' && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleFinalSubmit}
                className="flex flex-col gap-5"
              >
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-1 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-red-600" />
                    Donor Screening
                  </h2>
                  <p className="text-gray-500 text-sm">Please verify your medical eligibility.</p>
                </div>

                <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 text-xs text-red-700 leading-relaxed mb-1">
                  <b>Eligibility Standard:</b> Donors must be between 17 and 65 years old and weigh at least 45 kg.
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Age (Years)"
                    placeholder="Min 17"
                    type="number"
                    min={17}
                    max={65}
                    value={age}
                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                    disabled={loading}
                    required
                  />

                  <Input
                    label="Weight (kg)"
                    placeholder="Min 45"
                    type="number"
                    min={45}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
                    disabled={loading}
                    required
                  />
                </div>

                <Input
                  label="Last Donated Date (Optional)"
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={lastDonatedAt}
                  onChange={(e) => setLastDonatedAt(e.target.value)}
                  disabled={loading}
                  placeholder="Leave empty if first-time donor"
                />

                <div className="flex gap-3 mt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(2)}
                    className="flex-1 font-bold h-12 border border-gray-200 text-gray-600 rounded-xl"
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 font-bold h-12 rounded-xl"
                    isLoading={loading}
                  >
                    Create Account
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
