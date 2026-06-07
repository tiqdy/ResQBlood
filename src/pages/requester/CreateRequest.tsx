import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBloodRequests } from '../../hooks/useBloodRequests';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { BLOOD_TYPES, BLOOD_TYPE_COLORS } from '../../constants/bloodTypes';
import { PROVINCES } from '../../constants/provinces';
import { PMI_BRANCHES, ALL_PMI_BRANCHES } from '../../constants/pmiBranches';
import { CITIES_BY_PROVINCE, ALL_CITIES } from '../../constants/cities';
import type { BloodType, UrgencyLevel } from '../../types';
import { ShieldAlert, AlertTriangle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateRequest() {
  const { createBloodRequest, loading } = useBloodRequests();
  const navigate = useNavigate();

  // Form states
  const [patientName, setPatientName] = useState('');
  const [bloodType, setBloodType] = useState<BloodType | null>(null);
  const [bagsNeeded, setBagsNeeded] = useState<number>(1);
  const [urgency, setUrgency] = useState<UrgencyLevel>('normal');
  const [hospitalName, setHospitalName] = useState('');
  const [pmiBranch, setPmiBranch] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [notes, setNotes] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !bloodType || !bagsNeeded || !urgency || !hospitalName || !pmiBranch || !city || !province) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (bagsNeeded < 1 || bagsNeeded > 10) {
      toast.error('Bags needed must be between 1 and 10.');
      return;
    }

    const res = await createBloodRequest({
      patient_name: patientName,
      blood_type: bloodType,
      bags_needed: bagsNeeded,
      urgency,
      hospital_name: hospitalName,
      pmi_branch: pmiBranch,
      city,
      province,
      notes: notes || undefined,
      expires_at: expiresAt || undefined,
    });

    if (res.success && res.data) {
      toast.success('Blood request posted successfully! Scanning for donors...');
      navigate(`/requester/requests/${res.data.id}`);
    } else {
      toast.error(res.error || 'Failed to post blood request.');
    }
  };

  const urgencyOptions = [
    { value: 'critical', label: 'Critical', icon: ShieldAlert, color: 'text-red-600 border-red-200 bg-red-50/20 ring-red-600' },
    { value: 'urgent', label: 'Urgent', icon: AlertTriangle, color: 'text-orange-600 border-orange-200 bg-orange-50/20 ring-orange-600' },
    { value: 'normal', label: 'Normal', icon: AlertCircle, color: 'text-blue-600 border-blue-200 bg-blue-50/20 ring-blue-600' },
  ];

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Create Blood Request
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Post detailed blood requirements to locate voluntary compatible donors near you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        {/* Patient Details */}
        <Card header="Patient & Requirement details">
          <div className="flex flex-col gap-5">
            <Input
              label="Patient Name"
              placeholder="e.g. Jane Doe"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              disabled={loading}
              required
            />

            {/* Blood Type Grid */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 select-none">Blood Type</label>
              <div className="grid grid-cols-4 gap-2.5">
                {BLOOD_TYPES.map((bt) => {
                  const colors = BLOOD_TYPE_COLORS[bt];
                  const isSelected = bloodType === bt;
                  return (
                    <div
                      key={bt}
                      onClick={() => !loading && setBloodType(bt)}
                      className={`border rounded-xl p-3 flex items-center justify-center cursor-pointer transition-all font-black text-sm select-none active:scale-[0.98] ${
                        isSelected
                          ? `${colors.bg} ${colors.text} border-brand-600 ring-2 ring-brand-600/10 scale-[1.03]`
                          : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {bt}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Bags Needed"
                type="number"
                min={1}
                max={10}
                value={bagsNeeded}
                onChange={(e) => setBagsNeeded(Number(e.target.value))}
                disabled={loading}
                required
              />
              
              <Input
                label="Request Expiration Date (Optional)"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                disabled={loading}
                placeholder="Defaults to 7 days"
              />
            </div>

            {/* Urgency Level Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 select-none">Urgency Level</label>
              <div className="grid grid-cols-3 gap-3">
                {urgencyOptions.map((opt) => {
                  const isSelected = urgency === opt.value;
                  const Icon = opt.icon;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => !loading && setUrgency(opt.value as UrgencyLevel)}
                      className={`border rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98] ${
                        isSelected
                          ? `border-current ring-2 ring-offset-2 ${opt.color}`
                          : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mb-1.5" />
                      <span className="text-xs font-bold">{opt.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </Card>

        {/* Location Details */}
        <Card header="Hospital & PMI Location details">
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Target Hospital Name"
                placeholder="e.g. Cipto Mangunkusumo Hospital"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                disabled={loading}
                required
              />

              <Select
                label="Nearest PMI Branch"
                value={pmiBranch}
                onChange={(e) => setPmiBranch(e.target.value)}
                disabled={loading}
                required
              >
                <option value="">Select PMI Branch</option>
                {province && PMI_BRANCHES[province] ? (
                  PMI_BRANCHES[province].map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))
                ) : (
                  ALL_PMI_BRANCHES.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))
                )}
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={loading}
                required
              >
                <option value="">Select City</option>
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

              <Select
                label="Province"
                value={province}
                onChange={(e) => {
                  setProvince(e.target.value);
                  setPmiBranch(''); // Clear selected branch when province changes
                  setCity(''); // Clear city selection
                }}
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
            
            <Textarea
              label="Additional Notes (Optional)"
              placeholder="Provide operation details, contact instructions or timing targets..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
            />
          </div>
        </Card>

        {/* Action Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full font-bold h-12 shadow-lg shadow-brand-600/10"
          isLoading={loading}
        >
          Post Mobilization Request
        </Button>

      </form>

    </div>
  );
}
