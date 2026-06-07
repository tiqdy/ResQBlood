import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useBloodRequests } from '../../hooks/useBloodRequests';
import { useMatches } from '../../hooks/useMatches';
import { RequestCard } from '../../components/requests/RequestCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Search, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import type { BloodRequest } from '../../types';

export default function BrowseRequests() {
  const { profile, donorDetails } = useAuthStore();
  const { fetchBrowseRequests } = useBloodRequests();
  const { volunteer, fetchMatchesByDonor } = useMatches();

  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('');

  // Volunteer operations state
  const [volunteerLoadingId, setVolunteerLoadingId] = useState<string | null>(null);

  const loadRequests = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      // 1. Fetch matches to exclude requests already volunteered for
      const matchesRes = await fetchMatchesByDonor();
      let matchedRequestIds: string[] = [];
      if (matchesRes.success && matchesRes.data) {
        matchedRequestIds = matchesRes.data.map(m => m.request_id);
      }

      // 2. Fetch all compatible requests
      const res = await fetchBrowseRequests(profile.blood_type || '');
      if (res.success && res.data) {
        // Exclude already volunteered
        const unvolunteered = res.data.filter(r => !matchedRequestIds.includes(r.id));
        setRequests(unvolunteered);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load blood requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // Default city filter to donor city
    if (profile?.city) {
      setCityFilter(profile.city);
    }
  }, [profile]);

  // Apply filters on requests collection
  useEffect(() => {
    let result = [...requests];

    // Filter by urgency
    if (urgencyFilter !== 'all') {
      result = result.filter(r => r.urgency === urgencyFilter);
    }

    // Filter by city
    if (cityFilter.trim() !== '') {
      result = result.filter(r => 
        r.city.toLowerCase().includes(cityFilter.toLowerCase().trim())
      );
    }

    setFilteredRequests(result);
  }, [requests, urgencyFilter, cityFilter]);

  const handleVolunteer = async (requestId: string) => {
    if (donorDetails && !donorDetails.is_available) {
      toast.error('Set availability to active first.');
      return;
    }

    setVolunteerLoadingId(requestId);
    const res = await volunteer(requestId);
    setVolunteerLoadingId(null);

    if (res.success) {
      toast.success('Successfully volunteered! Please confirm readiness on My Matches page.');
      // Refresh list to exclude this request
      loadRequests();
    } else {
      toast.error(res.error || 'Failed to volunteer.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Spinner size="lg" className="border-brand-600" />
        <p className="text-gray-500 font-medium text-sm">Loading blood requests...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Browse Blood Requests
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Showing active requests matching your blood type (<b>{profile?.blood_type}</b>).
        </p>
      </div>

      {/* Info Notice for Unavailable Donors */}
      {donorDetails && !donorDetails.is_available && (
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3 text-orange-800 text-xs sm:text-sm">
          <ShieldAlert className="h-5 w-5 shrink-0 text-orange-600" />
          <div>
            <b>Availability is currently set to inactive.</b> You must toggle your availability to active in your dashboard to volunteer for blood requests.
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <Card className="p-4 bg-white border border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            label="Filter by City"
            placeholder="Search by city name..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          />
        </div>
        
        <div className="w-full sm:w-48">
          <Select
            label="Urgency Level"
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
          >
            <option value="all">All Urgency</option>
            <option value="critical">Critical</option>
            <option value="urgent">Urgent</option>
            <option value="normal">Normal</option>
          </Select>
        </div>
      </Card>

      {/* Request Feed */}
      <div className="flex flex-col gap-4">
        {filteredRequests.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No Requests Found"
            subtitle="There are no compatible blood requests matching your filters at the moment."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                showVolunteerButton={true}
                onVolunteer={() => handleVolunteer(request.id)}
                isVolunteeringLoading={volunteerLoadingId === request.id}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
