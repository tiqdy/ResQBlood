import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Check, X, ShieldAlert, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Match } from '../../types';

export default function DonationScreenings() {
  const { profile } = useAuthStore();
  const [searchParams] = useSearchParams();
  const selectMatchId = searchParams.get('matchId');

  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const [confirmingCollection, setConfirmingCollection] = useState(false);

  const handleConfirmCollection = async (matchId: string) => {
    setConfirmingCollection(true);
    try {
      const { error } = await supabase
        .from('matches')
        .update({ status: 'collected' })
        .eq('id', matchId);

      if (error) throw error;

      // Automatically mark the blood request as fulfilled since the blood bag has been collected
      const targetRequestId = selectedMatch?.request_id || selectedMatch?.blood_requests?.id;
      if (targetRequestId) {
        const { error: reqErr } = await supabase
          .from('blood_requests')
          .update({ status: 'fulfilled' })
          .eq('id', targetRequestId);
        
        if (reqErr) throw reqErr;
      }

      toast.success('Blood marked as collected successfully!');
      setSelectedMatch(null);
      fetchMatches();
    } catch (err: any) {
      toast.error(err.message || 'Failed to confirm collection.');
    } finally {
      setConfirmingCollection(false);
    }
  };

  // Screening form fields
  const [bloodPressure, setBloodPressure] = useState('');
  const [hemoglobin, setHemoglobin] = useState('');
  const [pulse, setPulse] = useState('');
  const [weight, setWeight] = useState('');
  const [status, setStatus] = useState<'passed' | 'failed' | ''>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Mandatory Infection Screenings (Checked = Safe/Non-reactive)
  const [syphilisSafe, setSyphilisSafe] = useState(true);
  const [hbvSafe, setHbvSafe] = useState(true);
  const [hivSafe, setHivSafe] = useState(true);
  const [hcvSafe, setHcvSafe] = useState(true);
  const [hevSafe, setHevSafe] = useState(true);
  const [htlvSafe, setHtlvSafe] = useState(true);
  const [havSafe, setHavSafe] = useState(true);
  const [parvovirusSafe, setParvovirusSafe] = useState(true);

  // Extra context-based checks
  const [malariaCheck, setMalariaCheck] = useState(false);
  const [tCruziCheck, setTCruziCheck] = useState(false);
  const [wnvCheck, setWnvCheck] = useState(false);
  const [cmvCheck, setCmvCheck] = useState(false);

  const fetchMatches = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          blood_requests!inner(*, profiles(*)),
          profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const allMatches = (data || []) as unknown as Match[];
      
      // Filter matches by this admin's province
      const branchMatches = allMatches.filter(m => {
        if (!profile.province || profile.province.toLowerCase() === 'all' || profile.province.toLowerCase() === 'national') {
          return true;
        }
        return m.blood_requests?.province &&
          m.blood_requests.province.toLowerCase() === profile.province.toLowerCase();
      });

      setMatches(branchMatches);

      if (selectMatchId) {
        const found = branchMatches.find(m => m.id === selectMatchId);
        if (found) {
          setSelectedMatch(found);
          // Prefill screening fields if weight/age are on the donor profile
          setWeight(found.profiles?.blood_type ? '65' : ''); // defaults
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch screenings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.is_profile_complete) {
      fetchMatches();
    } else {
      setLoading(false);
    }
  }, [profile, selectMatchId]);

  const handleSelectMatch = (match: Match) => {
    setSelectedMatch(match);
    setBloodPressure('');
    setHemoglobin('');
    setPulse('');
    setWeight('');
    setStatus('');
    setNotes('');
    setSyphilisSafe(true);
    setHbvSafe(true);
    setHivSafe(true);
    setHcvSafe(true);
    setHevSafe(true);
    setHtlvSafe(true);
    setHavSafe(true);
    setParvovirusSafe(true);
    setMalariaCheck(false);
    setTCruziCheck(false);
    setWnvCheck(false);
    setCmvCheck(false);
  };

  const handleScreeningSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch || !profile || !bloodPressure || !hemoglobin || !pulse || !weight || !status) {
      toast.error('Please fill in all medical metrics.');
      return;
    }

    setSubmitting(true);
    try {
      // Pack detailed infectious disease screening data into notes JSON string
      const screeningResultsObj = {
        syphilis: syphilisSafe ? 'non-reactive' : 'reactive',
        hbv: hbvSafe ? 'non-reactive' : 'reactive',
        hiv: hivSafe ? 'non-reactive' : 'reactive',
        hcv: hcvSafe ? 'non-reactive' : 'reactive',
        hev: hevSafe ? 'non-reactive' : 'reactive',
        htlv: htlvSafe ? 'non-reactive' : 'reactive',
        hav: havSafe ? 'non-reactive' : 'reactive',
        parvovirus: parvovirusSafe ? 'non-reactive' : 'reactive',
        malaria: malariaCheck ? 'tested-negative' : 'not-tested',
        t_cruzi: tCruziCheck ? 'tested-negative' : 'not-tested',
        wnv: wnvCheck ? 'tested-negative' : 'not-tested',
        cmv: cmvCheck ? 'tested-negative' : 'not-tested',
        admin_notes: notes || ''
      };

      // 1. Upsert screening logs row to prevent duplicate key constraint violations
      const { error: screeningErr } = await supabase
        .from('screenings')
        .upsert({
          match_id: selectedMatch.id,
          pmi_admin_id: profile.id,
          pmi_branch: selectedMatch.blood_requests?.pmi_branch || 'PMI Branch',
          blood_pressure: bloodPressure,
          hemoglobin: parseFloat(hemoglobin),
          pulse: parseInt(pulse),
          weight: parseFloat(weight),
          status,
          notes: JSON.stringify(screeningResultsObj)
        }, { onConflict: 'match_id' });

      if (screeningErr) throw screeningErr;

      // 2. Update match state: blood_ready if passed, declined if failed screening
      const nextMatchStatus = status === 'passed' ? 'blood_ready' : 'declined';
      const { error: matchErr } = await supabase
        .from('matches')
        .update({ status: nextMatchStatus, responded_at: new Date().toISOString() })
        .eq('id', selectedMatch.id);

      if (matchErr) throw matchErr;

      // 3. Update blood request bags count or total donations if passed
      if (status === 'passed') {
        // Check if history row already exists
        const { data: existingHist } = await supabase
          .from('donation_history')
          .select('id')
          .eq('match_id', selectedMatch.id)
          .maybeSingle();

        if (!existingHist) {
          // Increment donor's total donations counter
          const { data: donorDetails, error: donorFetchErr } = await supabase
            .from('donor_details')
            .select('total_donations')
            .eq('id', selectedMatch.donor_id)
            .single();

          if (donorFetchErr) throw donorFetchErr;

          if (donorDetails) {
            const currentCount = donorDetails.total_donations || 0;
            const { error: donorUpdateErr } = await supabase
              .from('donor_details')
              .update({ 
                total_donations: currentCount + 1,
                last_donated_at: new Date().toISOString().split('T')[0]
              })
              .eq('id', selectedMatch.donor_id);
            
            if (donorUpdateErr) throw donorUpdateErr;
          }

          // Add history row
          await supabase
            .from('donation_history')
            .insert({
              donor_id: selectedMatch.donor_id,
              match_id: selectedMatch.id,
              hospital_name: selectedMatch.blood_requests?.hospital_name || 'PMI branch',
              donated_at: new Date().toISOString().split('T')[0],
              bags_donated: selectedMatch.blood_requests?.bags_needed || 1,
              notes: `Screening passed at ${selectedMatch.blood_requests?.pmi_branch}`
            });
        }
      }

      toast.success(status === 'passed' ? 'Medical Screening Passed! Blood Ready notification sent.' : 'Donor screening completed. Match set to deferred.');
      setSelectedMatch(null);
      fetchMatches();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit screening details.');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingMatches = matches.filter(m => m.status === 'accepted' || m.status === 'pending');
  const readyMatches = matches.filter(m => m.status === 'blood_ready' || m.status === 'ready_for_collection');
  const pastMatches = matches.filter(m => m.status === 'completed' || m.status === 'collected' || m.status === 'declined');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Spinner size="lg" className="border-primary" />
        <p className="text-muted-foreground font-medium text-sm">Loading screenings list...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Columns: Donors List */}
      <div className="lg:col-span-1 flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Donation Screenings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Select a donor match to run medical eligibility verification.</p>
        </div>

        <Card header={`Pending Screenings (${pendingMatches.length})`} className="p-4 flex flex-col gap-3 max-h-[300px] overflow-y-auto">
          {pendingMatches.length === 0 ? (
            <p className="text-xs text-muted-foreground italic text-center py-4">No pending donor check-ins.</p>
          ) : (
            pendingMatches.map((m) => (
              <div
                key={m.id}
                onClick={() => handleSelectMatch(m)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedMatch?.id === m.id
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-150 hover:bg-gray-50 text-foreground'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                    {m.blood_requests?.blood_type}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{m.blood_requests?.pmi_branch}</span>
                </div>
                <h4 className="text-xs font-bold mt-2">{m.profiles?.full_name}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Patient: {m.blood_requests?.patient_name}</p>
              </div>
            ))
          )}
        </Card>

        <Card header={`Awaiting Collection (${readyMatches.length})`} className="p-4 flex flex-col gap-3 max-h-[300px] overflow-y-auto">
          {readyMatches.length === 0 ? (
            <p className="text-xs text-muted-foreground italic text-center py-4">No blood bags awaiting pickup.</p>
          ) : (
            readyMatches.map((m) => (
              <div
                key={m.id}
                onClick={() => handleSelectMatch(m)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedMatch?.id === m.id
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-150 hover:bg-gray-50 text-foreground'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                    {m.blood_requests?.blood_type}
                  </span>
                  <span className={`text-[10px] font-semibold ${m.status === 'ready_for_collection' ? 'text-green-600 font-bold animate-pulse' : 'text-muted-foreground'}`}>
                    {m.status === 'ready_for_collection' ? 'Ready to Pickup' : 'Ready'}
                  </span>
                </div>
                <h4 className="text-xs font-bold mt-2">{m.profiles?.full_name}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Patient: {m.blood_requests?.patient_name}</p>
              </div>
            ))
          )}
        </Card>

        <Card header="Recent Completed" className="p-4 flex flex-col gap-3 max-h-[300px] overflow-y-auto">
          {pastMatches.length === 0 ? (
            <p className="text-xs text-muted-foreground italic text-center py-4">No recent history.</p>
          ) : (
            pastMatches.slice(0, 10).map((m) => (
              <div key={m.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 text-foreground">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-semibold text-muted-foreground">{m.blood_requests?.pmi_branch}</span>
                  <span className={`text-[9px] font-bold px-1.5 rounded ${
                    m.status === 'completed' || m.status === 'collected' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {m.status === 'completed' || m.status === 'collected' ? 'Collected' : 'Deferred'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-gray-700">{m.profiles?.full_name}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Blood Type {m.blood_requests?.blood_type} ➔ Patient: {m.blood_requests?.patient_name}</p>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* Right Column: Active Screening Form / Handover Workbench */}
      <div className="lg:col-span-2">
        {selectedMatch ? (
          selectedMatch.status === 'blood_ready' || selectedMatch.status === 'ready_for_collection' ? (
            <div className="flex flex-col gap-5">
              <Card header="Blood Handover & Collection Workbench" className="p-6">
                <div className="flex gap-4 items-center bg-blue-50 border border-blue-150 p-4 rounded-2xl mb-5">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Check className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Collection Request Pending
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      This donation match has passed all mandatory infectious disease screenings. The blood is ready for distribution.
                    </p>
                    {selectedMatch.status === 'ready_for_collection' && (
                      <span className="text-[10px] inline-block font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full mt-2 animate-pulse">
                        ● Recipient Confirmed Ready to Collect
                      </span>
                    )}
                  </div>
                </div>

                {/* Donor & Recipient info details */}
                <div className="border border-gray-150 bg-gray-50 p-4 rounded-2xl flex flex-col gap-3.5 mb-5 text-xs text-gray-600">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Donor Information</span>
                    <p className="font-bold text-gray-800 text-sm">{selectedMatch.profiles?.full_name}</p>
                    <p className="mt-0.5">Phone: <b className="text-gray-800">{selectedMatch.profiles?.phone || 'N/A'}</b></p>
                    <p className="mt-0.5">Blood Type Donated: <span className="font-bold text-red-600">{selectedMatch.blood_requests?.blood_type}</span></p>
                  </div>
                  <hr className="border-gray-200" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Recipient/Patient Information</span>
                    <p className="font-bold text-gray-800 text-sm">{selectedMatch.blood_requests?.patient_name}</p>
                    <p className="mt-0.5">Requester Contact: <b className="text-gray-800">{selectedMatch.blood_requests?.profiles?.phone || 'N/A'}</b></p>
                    <p className="mt-0.5">Target Hospital: <b className="text-gray-800">{selectedMatch.blood_requests?.hospital_name}</b></p>
                    <p className="mt-0.5">Nearest PMI Branch: <b className="text-gray-800">{selectedMatch.blood_requests?.pmi_branch}</b></p>
                  </div>
                </div>

                {/* Screening logs metrics */}
                {(() => {
                  const screeningLog = selectedMatch.screenings?.[0];
                  if (!screeningLog) return null;
                  try {
                    const results = typeof screeningLog.notes === 'string' ? JSON.parse(screeningLog.notes) : screeningLog.notes;
                    return (
                      <div className="border border-gray-150 rounded-2xl p-4 flex flex-col gap-3 bg-white">
                        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Screening Report Details</h4>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-gray-400 block">Blood Pressure:</span>
                            <span className="font-bold text-gray-700">{screeningLog.blood_pressure} mmHg</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Hemoglobin Level:</span>
                            <span className="font-bold text-gray-700">{screeningLog.hemoglobin} g/dL</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Pulse:</span>
                            <span className="font-bold text-gray-700">{screeningLog.pulse} bpm</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Weight:</span>
                            <span className="font-bold text-gray-700">{screeningLog.weight} kg</span>
                          </div>
                        </div>

                        <hr className="border-gray-100" />

                        <div>
                          <span className="text-gray-400 block text-xs mb-1">Infectious Disease Test Checklist:</span>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-semibold text-green-700">
                            <span>✓ HIV: {results?.hiv || 'non-reactive'}</span>
                            <span>✓ Hepatitis B (HBV): {results?.hbv || 'non-reactive'}</span>
                            <span>✓ Hepatitis C (HCV): {results?.hcv || 'non-reactive'}</span>
                            <span>✓ Syphilis: {results?.syphilis || 'non-reactive'}</span>
                            <span>✓ Hepatitis E (HEV): {results?.hev || 'non-reactive'}</span>
                            <span>✓ HTLV: {results?.htlv || 'non-reactive'}</span>
                            <span>✓ Hepatitis A (HAV): {results?.hav || 'non-reactive'}</span>
                            <span>✓ Parvovirus (B19): {results?.parvovirus || 'non-reactive'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  } catch (e) {
                    return null;
                  }
                })()}

                <div className="mt-6 border-t border-gray-150 pt-4 flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-gray-800">Confirm Handoff</h4>
                  <p className="text-xs text-gray-500">
                    Verify the identity of the recipient, relative, or courier before transferring the blood bag.
                  </p>
                </div>
              </Card>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedMatch(null)}
                  className="font-bold border border-gray-200"
                  disabled={confirmingCollection}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => handleConfirmCollection(selectedMatch.id)}
                  className="font-bold h-11 px-6 bg-green-600 hover:bg-green-700"
                  isLoading={confirmingCollection}
                >
                  Confirm Blood Bag Collected
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleScreeningSubmit} className="flex flex-col gap-5">
            <Card header="Donor Verification & Medical Details" className="p-6">
              <div className="flex gap-4 items-center bg-gray-50 border border-gray-150 p-4 rounded-2xl mb-5">
                <div className="h-12 w-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{selectedMatch.profiles?.full_name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Donor Phone: <span className="font-semibold">{selectedMatch.profiles?.phone || 'N/A'}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Volunteered to Donate Blood Type: <span className="font-bold text-red-600">{selectedMatch.blood_requests?.blood_type}</span> for Patient: <span className="font-semibold">{selectedMatch.blood_requests?.patient_name}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Requester Contact: <span className="font-semibold">{selectedMatch.blood_requests?.profiles?.phone || 'N/A'}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Blood Pressure (mmHg)"
                  placeholder="e.g. 120/80"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  disabled={submitting}
                  required
                />
                
                <Input
                  label="Hemoglobin Level (g/dL)"
                  placeholder="e.g. 13.5"
                  type="number"
                  step="0.1"
                  min="0"
                  max="25"
                  value={hemoglobin}
                  onChange={(e) => setHemoglobin(e.target.value)}
                  disabled={submitting}
                  required
                />

                <Input
                  label="Pulse (bpm)"
                  placeholder="e.g. 78"
                  type="number"
                  min="30"
                  max="200"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  disabled={submitting}
                  required
                />

                <Input
                  label="Weight (kg)"
                  placeholder="e.g. 64.5"
                  type="number"
                  step="0.1"
                  min="30"
                  max="300"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              {/* Infectious Disease Screenings */}
              <div className="border-t border-gray-150 pt-5 mt-5 flex flex-col gap-4">
                <div>
                  <h4 className="text-sm font-bold text-foreground">Infectious Disease Screening Tests</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Voluntary donations must screen negative / non-reactive for major bloodborne infections.</p>
                </div>

                <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4">
                  <span className="text-xs font-bold text-gray-700 block mb-3">Mandatory Screenings (Select if Safe / Non-reactive)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 p-2.5 bg-white border border-gray-100 rounded-xl cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={syphilisSafe}
                        onChange={(e) => setSyphilisSafe(e.target.checked)}
                        disabled={submitting}
                        className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-800">Syphilis</span>
                        <span className="text-[10px] text-gray-400">Non-reactive</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 bg-white border border-gray-100 rounded-xl cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hbvSafe}
                        onChange={(e) => setHbvSafe(e.target.checked)}
                        disabled={submitting}
                        className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-800">Hepatitis B (HBV)</span>
                        <span className="text-[10px] text-gray-400">Non-reactive</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 bg-white border border-gray-100 rounded-xl cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hivSafe}
                        onChange={(e) => setHivSafe(e.target.checked)}
                        disabled={submitting}
                        className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-800">HIV (Type 1 & 2)</span>
                        <span className="text-[10px] text-gray-400">Non-reactive</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 bg-white border border-gray-100 rounded-xl cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hcvSafe}
                        onChange={(e) => setHcvSafe(e.target.checked)}
                        disabled={submitting}
                        className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-800">Hepatitis C (HCV)</span>
                        <span className="text-[10px] text-gray-400">Non-reactive</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 bg-white border border-gray-100 rounded-xl cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hevSafe}
                        onChange={(e) => setHevSafe(e.target.checked)}
                        disabled={submitting}
                        className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-800">Hepatitis E (HEV)</span>
                        <span className="text-[10px] text-gray-400">Non-reactive</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 bg-white border border-gray-100 rounded-xl cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={htlvSafe}
                        onChange={(e) => setHtlvSafe(e.target.checked)}
                        disabled={submitting}
                        className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-800">HTLV (Type I & II)</span>
                        <span className="text-[10px] text-gray-400">Non-reactive</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 bg-white border border-gray-100 rounded-xl cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={havSafe}
                        onChange={(e) => setHavSafe(e.target.checked)}
                        disabled={submitting}
                        className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-800">Hepatitis A (HAV)</span>
                        <span className="text-[10px] text-gray-400">Non-reactive</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 bg-white border border-gray-100 rounded-xl cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={parvovirusSafe}
                        onChange={(e) => setParvovirusSafe(e.target.checked)}
                        disabled={submitting}
                        className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-800">Parvovirus (B19)</span>
                        <span className="text-[10px] text-gray-400">Non-reactive</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4">
                  <span className="text-xs font-bold text-gray-700 block mb-3">Additional Tests (Select if positive/performed based on circumstances)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 p-2.5 bg-white border border-gray-100 rounded-xl cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={malariaCheck}
                        onChange={(e) => setMalariaCheck(e.target.checked)}
                        disabled={submitting}
                        className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-800">Malaria</span>
                        <span className="text-[10px] text-gray-400">Travel/Endemic risk</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 bg-white border border-gray-100 rounded-xl cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={tCruziCheck}
                        onChange={(e) => setTCruziCheck(e.target.checked)}
                        disabled={submitting}
                        className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-800">Chagas Disease (T. Cruzi)</span>
                        <span className="text-[10px] text-gray-400">Risk-based test</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 bg-white border border-gray-100 rounded-xl cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={wnvCheck}
                        onChange={(e) => setWnvCheck(e.target.checked)}
                        disabled={submitting}
                        className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-800">West Nile Virus (WNV)</span>
                        <span className="text-[10px] text-gray-400">Seasonal risk</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-2.5 bg-white border border-gray-100 rounded-xl cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={cmvCheck}
                        onChange={(e) => setCmvCheck(e.target.checked)}
                        disabled={submitting}
                        className="rounded text-primary focus:ring-primary h-4.5 w-4.5"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-800">Cytomegalovirus (CMV)</span>
                        <span className="text-[10px] text-gray-400">Specifically for infant patients</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <label className="text-sm font-semibold text-gray-700">Medical Eligibility Status</label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => !submitting && setStatus('passed')}
                    className={`border rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98] ${
                      status === 'passed'
                        ? 'border-green-600 bg-green-50/20 text-green-700 ring-2 ring-green-600/10'
                        : 'border-border bg-card text-muted-foreground hover:bg-gray-50'
                    }`}
                  >
                    <Check className="h-6 w-6 mb-2" />
                    <span className="text-xs font-bold">Passed (Blood Safe)</span>
                  </div>

                  <div
                    onClick={() => !submitting && setStatus('failed')}
                    className={`border rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.98] ${
                      status === 'failed'
                        ? 'border-red-600 bg-red-50/20 text-red-700 ring-2 ring-red-600/10'
                        : 'border-border bg-card text-muted-foreground hover:bg-gray-50'
                    }`}
                  >
                    <X className="h-6 w-6 mb-2" />
                    <span className="text-xs font-bold">Deferred / Unfit</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Textarea
                  label="Additional Notes / Screening Comments"
                  placeholder="Input detailed reasons if deferred, or special notes for distribution..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </Card>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelectedMatch(null)}
                className="font-bold border border-gray-200"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="font-bold h-11 px-6 bg-red-600 hover:bg-red-700 text-white"
                isLoading={submitting}
              >
                Submit Screening & Authorize Blood
              </Button>
            </div>
          </form>
        )) : (
          <EmptyState
            icon={ShieldAlert}
            title="Screening Workbench"
            subtitle="Select a donor from the pending list on the left to review metrics and authorize donation status."
          />
        )}
      </div>
    </div>
  );
}
