import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/Card';
import { 
  Activity, 
  CheckCircle, 
  MapPin, 
  ArrowRight, 
  HeartHandshake,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Match } from '../../types';

export default function PmiDashboard() {
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingScreenings: 0,
    totalScreenings: 0,
    successfulDonations: 0,
  });
  const [activeScreeningMatches, setActiveScreeningMatches] = useState<Match[]>([]);

  const loadDashboardData = async () => {
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
      
      const branchMatches = allMatches.filter(m => {
        if (!profile.province || profile.province.toLowerCase() === 'all' || profile.province.toLowerCase() === 'national') {
          return true;
        }
        return m.blood_requests?.province &&
          m.blood_requests.province.toLowerCase() === profile.province.toLowerCase();
      });

      const pendingList = branchMatches.filter(m => m.status === 'accepted' || m.status === 'pending');
      const passedListCount = branchMatches.filter(m => 
        m.status === 'completed' || m.status === 'collected' || m.status === 'blood_ready' || m.status === 'ready_for_collection'
      ).length;

      setActiveScreeningMatches(pendingList.slice(0, 5));

      setStats({
        pendingScreenings: pendingList.length,
        totalScreenings: branchMatches.length,
        successfulDonations: passedListCount,
      });

    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load PMI dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.is_profile_complete) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [profile]);

  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'PMI Admin';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Spinner size="lg" className="border-red-500" />
        <p className="text-gray-400 font-medium text-sm">Loading PMI dashboard data...</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Pending Screenings',
      value: `${stats.pendingScreenings}`,
      icon: Activity,
      iconBg: 'bg-gradient-to-br from-amber-100 to-yellow-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-l-4 border-l-amber-500',
    },
    {
      label: 'Total Handled',
      value: `${stats.totalScreenings}`,
      icon: Users,
      iconBg: 'bg-gradient-to-br from-blue-100 to-sky-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-l-4 border-l-blue-500',
    },
    {
      label: 'Verified Donations',
      value: `${stats.successfulDonations}`,
      icon: CheckCircle,
      iconBg: 'bg-gradient-to-br from-green-100 to-emerald-50',
      iconColor: 'text-green-600',
      borderColor: 'border-l-4 border-l-green-500',
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Hello, {firstName}! 🏢
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            PMI Branch:{' '}
            <span className="font-bold text-red-600">{profile?.city || 'Local Branch'}, {profile?.province}</span>
            {' '}— Manage donor screening and authorize blood ready status.
          </p>
        </div>
        <Link
          to="/pmi/screenings"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-red-600/20 transition-all hover:-translate-y-0.5 active:scale-95 shrink-0"
        >
          <Activity className="h-4 w-4" />
          View Screenings
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, iconBg, iconColor, borderColor }) => (
          <div key={label} className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${borderColor} p-5 flex items-center gap-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}>
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
              <Icon className={`h-5.5 w-5.5 ${iconColor}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5">{value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Donors Table */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-red-500" />
            Recent Pending Donors
          </h2>
          <Link 
            to="/pmi/screenings" 
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 group transition-colors"
          >
            View All Screenings
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {activeScreeningMatches.length === 0 ? (
          <EmptyState
            icon={HeartHandshake}
            title="No pending donors"
            subtitle="There are no donors currently scheduled for screening at your branch."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {activeScreeningMatches.map((match) => (
              <Card key={match.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:-translate-y-0.5 transition-transform">
                <div>
                  <div className="flex gap-2 items-center mb-1.5">
                    <span className="text-xs px-2.5 py-1 bg-red-100 text-red-700 font-bold rounded-full">
                      Blood {match.blood_requests?.blood_type}
                    </span>
                    <span className="text-xs text-gray-400">
                      Patient: {match.blood_requests?.patient_name}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-gray-900">
                    Donor: {match.profiles?.full_name || 'Anonymous Donor'}
                  </h4>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    Hospital: {match.blood_requests?.hospital_name}
                  </p>
                </div>
                <Link to={`/pmi/screenings?matchId=${match.id}`}>
                  <button className="h-10 px-5 font-bold bg-red-600 hover:bg-red-700 text-white text-xs rounded-xl transition-all shadow-md shadow-red-600/15 active:scale-95">
                    Perform Screening
                  </button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
