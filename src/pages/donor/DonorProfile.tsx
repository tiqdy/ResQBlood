import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useProfile } from '../../hooks/useProfile';
import { useDonorDetails } from '../../hooks/useDonorDetails';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PROVINCES } from '../../constants/provinces';
import { 
  isEligibleToDonate, 
  daysSinceLastDonation,
  formatDate 
} from '../../lib/utils';
import { HelpCircle, User, Activity, Award, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DonorProfile() {
  const { profile, donorDetails, user } = useAuthStore();
  const { updateProfile, loading: profileLoading } = useProfile();
  const { updateDonorDetails, loading: donorLoading } = useDonorDetails();
  const { fetchProfileAndDetails } = useAuth();

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');

  // Donor specific states
  const [age, setAge] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');

  useEffect(() => {
    if (user) {
      fetchProfileAndDetails(user.id);
    }
  }, [user, fetchProfileAndDetails]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setCity(profile.city || '');
      setProvince(profile.province || '');
    }
    if (donorDetails) {
      setAge(donorDetails.age || '');
      setWeight(donorDetails.weight || '');
    }
  }, [profile, donorDetails]);

  if (!profile) return null;

  const isDonor = profile.role === 'donor';

  const eligible = isDonor && donorDetails ? isEligibleToDonate(donorDetails.last_donated_at) : false;
  const daysDiff = isDonor && donorDetails ? daysSinceLastDonation(donorDetails.last_donated_at) : null;
  const daysLeft = daysDiff !== null ? Math.max(0, 90 - daysDiff) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !city || !province) {
      toast.error('Please fill in all general profile fields.');
      return;
    }

    if (isDonor) {
      if (!age || !weight) {
        toast.error('Please fill in age and weight screening fields.');
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

    // 1. Save general profile
    const pRes = await updateProfile({
      full_name: fullName,
      phone,
      city,
      province,
    });

    if (!pRes.success) {
      toast.error(pRes.error || 'Failed to update profile.');
      return;
    }

    // 2. Save donor details if donor
    if (isDonor) {
      const dRes = await updateDonorDetails({
        age: Number(age),
        weight: Number(weight),
      });

      if (!dRes.success) {
        toast.error(dRes.error || 'Failed to update donor details.');
        return;
      }
    }

    toast.success('Profile changes saved successfully!');
  };

  const loading = profileLoading || donorLoading;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          My Profile
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your personal credentials, contact, and medical setups.
        </p>
      </div>

      {/* Conditional Eligibility Banner (Donors only) */}
      {isDonor && donorDetails && (
        <div>
          {donorDetails.last_donated_at === null ? (
            <Card className="bg-blue-50 border-blue-100 flex items-center gap-3 p-4">
              <Award className="h-5 w-5 text-blue-600 shrink-0" />
              <div className="text-xs sm:text-sm text-blue-900 font-medium">
                <b>First-time Donor:</b> You have no recorded donations. Complete blood matches to earn records!
              </div>
            </Card>
          ) : eligible ? (
            <Card className="bg-green-50/50 border-green-100 flex items-center gap-3 p-4">
              <Award className="h-5 w-5 text-green-600 shrink-0" />
              <div className="text-xs sm:text-sm text-green-900 font-medium">
                <b>You are eligible to donate!</b> Your last recorded donation was on {formatDate(donorDetails.last_donated_at)}.
              </div>
            </Card>
          ) : (
            <Card className="bg-orange-50 border-orange-100 flex items-center gap-3 p-4">
              <ShieldAlert className="h-5 w-5 text-orange-600 shrink-0" />
              <div className="text-xs sm:text-sm text-orange-900 font-medium">
                <b>Not eligible to donate yet.</b> You will be eligible in <b>{daysLeft} days</b> (last donation: {formatDate(donorDetails.last_donated_at)}).
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Editing Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        {/* General Details Card */}
        <Card header={
          <span className="flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-gray-500" />
            General Information
          </span>
        }>
          <div className="flex flex-col gap-5">
            
            {/* Locked Blood Type Field */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-gray-800">Blood Type</span>
                <span className="text-xs text-gray-400">Locked after setup for medical accuracy.</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge color="red" label={profile.blood_type || 'N/A'} className="text-sm font-black px-3.5 py-1" />
                <div 
                  className="p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer rounded-lg hover:bg-gray-200/50 transition-colors"
                  title="Contact support to update blood type if set incorrectly."
                >
                  <HelpCircle className="h-4 w-4" />
                </div>
              </div>
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
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="City"
                placeholder="e.g. Bandung"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={loading}
                required
              />

              <Select
                label="Province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                disabled={loading}
                required
              >
                <option value="">Select Province</option>
                {PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </Select>
            </div>

          </div>
        </Card>

        {/* Screening Details Card (Donors only) */}
        {isDonor && (
          <Card header={
            <span className="flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-gray-500" />
              Screening Statistics
            </span>
          }>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Age (Years)"
                placeholder="Must be 17-65"
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
                placeholder="Must be min 45"
                type="number"
                min={45}
                value={weight}
                onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
                disabled={loading}
                required
              />
            </div>
          </Card>
        )}

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          className="w-full font-bold h-12"
          isLoading={loading}
        >
          Save Changes
        </Button>

      </form>

    </div>
  );
}
