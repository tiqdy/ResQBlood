import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useBloodRequests } from '../../hooks/useBloodRequests';
import { useMatches } from '../../hooks/useMatches';

import { Button } from '../../components/ui/Button';
import { RequestCard } from '../../components/requests/RequestCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { 
  FileText, 
  Users, 
  CheckCircle, 
  PlusCircle, 
  HeartHandshake,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { BloodRequest } from '../../types';

export default function RequesterDashboard() {
  const { profile } = useAuthStore();
  const { fetchMyRequests } = useBloodRequests();
  const { fetchMatchesByRequest } = useMatches();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [stats, setStats] = useState({
    activeRequests: 0,
    donorsMatched: 0,
    fulfilledRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetchMyRequests();
      if (res.success && res.data) {
        const myReqs = res.data;
        setRequests(myReqs.slice(0, 5));

        const activeCount = myReqs.filter(r => r.status === 'open' || r.status === 'in_progress').length;
        const fulfilledCount = myReqs.filter(r => r.status === 'fulfilled').length;

        let matchesCount = 0;
        const activeReqs = myReqs.filter(r => r.status === 'open' || r.status === 'in_progress');
        
        await Promise.all(
          activeReqs.map(async (req) => {
            const matchesRes = await fetchMatchesByRequest(req.id);
            if (matchesRes.success && matchesRes.data) {
              const accepted = matchesRes.data.filter(m => m.status === 'accepted').length;
              matchesCount += accepted;
            }
          })
        );

        setStats({
          activeRequests: activeCount,
          donorsMatched: matchesCount,
          fulfilledRequests: fulfilledCount,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load requester dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Requester';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Spinner size="lg" className="border-red-500" />
        <p className="text-gray-400 font-medium text-sm">Loading your dashboard...</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Active Requests',
      value: `${stats.activeRequests}`,
      icon: FileText,
      iconBg: 'bg-gradient-to-br from-red-100 to-rose-50',
      iconColor: 'text-red-600',
      borderColor: 'border-l-4 border-l-red-500',
    },
    {
      label: 'Donors Matched',
      value: `${stats.donorsMatched}`,
      icon: Users,
      iconBg: 'bg-gradient-to-br from-green-100 to-emerald-50',
      iconColor: 'text-green-600',
      borderColor: 'border-l-4 border-l-green-500',
    },
    {
      label: 'Fulfilled Requests',
      value: `${stats.fulfilledRequests}`,
      icon: CheckCircle,
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
            Manage your blood donation requests and track compatible volunteer matches.
          </p>
        </div>
        
        <Link to="/requester/create" className="shrink-0">
          <Button
            variant="primary"
            className="font-bold flex items-center gap-2 shadow-lg shadow-red-600/20 h-11 text-sm hover:-translate-y-0.5 transition-transform"
          >
            <PlusCircle className="h-4 w-4" />
            Create Blood Request
          </Button>
        </Link>
      </div>

      {/* Stats row */}
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

      {/* Your Recent Requests Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Your Recent Requests</h2>
          
          <Link 
            to="/requester/requests" 
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 group transition-colors"
          >
            View All Requests
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {requests.length === 0 ? (
          <EmptyState
            icon={HeartHandshake}
            title="No Blood Requests Posted"
            subtitle="Post your first blood request detailing blood type, hospital, and urgency to find donors."
            actionLabel="Create Blood Request"
            onAction={() => navigate('/requester/create')}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {requests.map((request) => (
              <div 
                key={request.id} 
                onClick={() => navigate(`/requester/requests/${request.id}`)}
                className="cursor-pointer group"
              >
                <RequestCard request={request} />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
