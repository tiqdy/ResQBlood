import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useMatches } from '../../hooks/useMatches';
import { useBloodRequests } from '../../hooks/useBloodRequests';
import { useAuth } from '../../hooks/useAuth';
import { AvailabilityToggle } from '../../components/donors/AvailabilityToggle';

import { MatchCard } from '../../components/matches/MatchCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { 
  Heart, 
  Clock, 
  MapPin, 
  ArrowRight, 
  HeartHandshake,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Match } from '../../types';

export default function DonorDashboard() {
  const { profile, donorDetails, user } = useAuthStore();
  const { fetchMatchesByDonor, acceptMatch, declineMatch } = useMatches();
  const { fetchBrowseRequests } = useBloodRequests();
  const { fetchProfileAndDetails } = useAuth();

  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    pendingMatches: 0,
    requestsNearYou: 0,
  });
  const [loading, setLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'decline' | null>(null);

  const loadDashboardData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      if (user && !hasFetchedRef.current) {
        hasFetchedRef.current = true;
        await fetchProfileAndDetails(user.id);
      }

      const matchesRes = await fetchMatchesByDonor();
      let matchesList: Match[] = [];
      if (matchesRes.success && matchesRes.data) {
        matchesList = matchesRes.data;
        setRecentMatches(matchesList.slice(0, 5));
      }

      const requestsRes = await fetchBrowseRequests(profile.blood_type || '');
      let nearbyCount = 0;
      if (requestsRes.success && requestsRes.data) {
        nearbyCount = requestsRes.data.filter(
          r => r.city.toLowerCase() === profile.city.toLowerCase()
        ).length;
      }

      const latestDonorDetails = useAuthStore.getState().donorDetails;
      setStats({
        totalDonations: latestDonorDetails?.total_donations || 0,
        pendingMatches: matchesList.filter(m => m.status === 'pending').length,
        requestsNearYou: nearbyCount,
      });

    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [profile, donorDetails]);

  const handleAccept = async (matchId: string) => {
    setActionLoadingId(matchId);
    setActionType('accept');
    const res = await acceptMatch(matchId);
    setActionLoadingId(null);
    setActionType(null);
    if (res.success) {
      toast.success('You have confirmed readiness. Thank you!');
      loadDashboardData();
    } else {
      toast.error(res.error || 'Failed to accept match.');
    }
  };

  const handleDecline = async (matchId: string) => {
    setActionLoadingId(matchId);
    setActionType('decline');
    const res = await declineMatch(matchId);
    setActionLoadingId(null);
    setActionType(null);
    if (res.success) {
      toast.success('Match declined.');
      loadDashboardData();
    } else {
      toast.error(res.error || 'Failed to decline match.');
    }
  };

  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Donor';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
            <Spinner size="lg" className="border-red-500" />
          </div>
        </div>
        <p className="text-gray-400 font-medium text-sm">Loading your dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Donations',
      value: `${stats.totalDonations}`,
      suffix: stats.totalDonations === 1 ? 'time' : 'times',
      icon: Heart,
      iconBg: 'bg-gradient-to-br from-green-100 to-emerald-50',
      iconColor: 'text-green-600',
      borderColor: 'border-l-4 border-l-green-500',
    },
    {
      label: 'Pending Responses',
      value: `${stats.pendingMatches}`,
      suffix: 'awaiting',
      icon: Clock,
      iconBg: 'bg-gradient-to-br from-orange-100 to-amber-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-l-4 border-l-orange-500',
    },
    {
      label: 'Requests Near You',
      value: `${stats.requestsNearYou}`,
      suffix: 'open',
      icon: MapPin,
      iconBg: 'bg-gradient-to-br from-blue-100 to-sky-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-l-4 border-l-blue-500',
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Hello, {firstName}! 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back. Check blood requests and help save lives today.
          </p>
        </div>
        <Link
          to="/donor/requests"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-red-600/20 transition-all hover:-translate-y-0.5 active:scale-95 shrink-0"
        >
          <TrendingUp className="h-4 w-4" />
          Browse Requests
        </Link>
      </div>

      {/* Availability Toggle */}
      <AvailabilityToggle />

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map(({ label, value, suffix, icon: Icon, iconBg, iconColor, borderColor }) => (
          <div key={label} className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${borderColor} p-5 flex items-center gap-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}>
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
              <Icon className={`h-5.5 w-5.5 ${iconColor}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <h3 className="text-2xl font-black text-gray-900">{value}</h3>
                <span className="text-xs text-gray-400 font-medium">{suffix}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Match Requests Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Recent Match Requests</h2>
          
          <Link 
            to="/donor/matches" 
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 group transition-colors"
          >
            View All Matches
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {recentMatches.length === 0 ? (
          <EmptyState
            icon={HeartHandshake}
            title="No Matches Volunteered Yet"
            subtitle="Explore compatible blood requests in your area and volunteer to donate blood."
            actionLabel="Browse Blood Requests"
            onAction={() => window.location.assign('/donor/requests')}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {recentMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onAccept={() => handleAccept(match.id)}
                onDecline={() => handleDecline(match.id)}
                isAcceptLoading={actionLoadingId === match.id && actionType === 'accept'}
                isDeclineLoading={actionLoadingId === match.id && actionType === 'decline'}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
