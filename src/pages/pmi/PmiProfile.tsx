import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useProfile } from '../../hooks/useProfile';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { PROVINCES } from '../../constants/provinces';
import { CITIES_BY_PROVINCE, ALL_CITIES } from '../../constants/cities';
import { Building2, User, MapPin, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PmiProfile() {
  const { profile } = useAuthStore();
  const { updateProfile, loading } = useProfile();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [province, setProvince] = useState(profile?.province || '');
  const [city, setCity] = useState(profile?.city || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !city || !province) {
      toast.error('Please fill in all details.');
      return;
    }

    const res = await updateProfile({
      full_name: fullName,
      phone,
      city,
      province,
      is_profile_complete: true,
    });

    if (res.success) {
      toast.success('PMI Profile updated successfully.');
    } else {
      toast.error(res.error || 'Failed to update profile.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          PMI Branch Details
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your officer information and PMI branch location details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Section 1: Officer Info */}
        <Card
          header={
            <span className="flex items-center gap-2 text-gray-700">
              <User className="h-4 w-4 text-red-500" />
              Officer Information
            </span>
          }
        >
          <div className="flex flex-col gap-5">
            <Input
              label="Full Name / Officer Name"
              placeholder="e.g. Ahmad Fauzi"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              required
            />
            <Input
              label="Branch Phone Number"
              placeholder="e.g. 081234567890"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </Card>

        {/* Section 2: Branch Location — Province first, then City */}
        <Card
          header={
            <span className="flex items-center gap-2 text-gray-700">
              <MapPin className="h-4 w-4 text-red-500" />
              Branch Location
            </span>
          }
        >
          <div className="flex flex-col gap-5">
            {/* Province must come first — city list depends on it */}
            <Select
              label="Province"
              value={province}
              onChange={(e) => {
                setProvince(e.target.value);
                setCity(''); // Reset city when province changes
              }}
              disabled={loading}
              required
            >
              <option value="">Select Province first</option>
              <option value="National">National (All Provinces)</option>
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
              <option value="">
                {province ? 'Select City' : 'Select Province first'}
              </option>
              {province === 'National' && <option value="All">All Cities</option>}
              {province && CITIES_BY_PROVINCE[province]
                ? CITIES_BY_PROVINCE[province].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))
                : ALL_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
            </Select>

            {/* Location preview */}
            {province && city && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
                <Building2 className="h-4 w-4 shrink-0" />
                <span>
                  PMI Branch:{' '}
                  <strong>
                    {city}, {province}
                  </strong>
                </span>
                <ChevronRight className="h-4 w-4 ml-auto shrink-0 opacity-50" />
              </div>
            )}
          </div>
        </Card>

        {/* Save Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full font-bold h-12 shadow-md shadow-red-600/15 rounded-xl"
          isLoading={loading}
        >
          Save Changes
        </Button>
      </form>
    </div>
  );
}
