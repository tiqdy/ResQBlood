import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBloodRequests } from '../../hooks/useBloodRequests';
import { useMatches } from '../../hooks/useMatches';
import { RequestCard } from '../../components/requests/RequestCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Card } from '../../components/ui/Card';
import { FileText, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import type { BloodRequest } from '../../types';
import { cn } from '../../lib/utils';

type FilterType = 'all' | 'open' | 'in_progress' | 'fulfilled' | 'cancelled';

export default function MyRequests() {
  const { fetchMyRequests } = useBloodRequests();
  const { fetchMatchesByRequest } = useMatches();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BloodRequest[]>([]);
  const [matchCounts, setMatchCounts] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await fetchMyRequests();
      if (res.success && res.data) {
        const myReqs = res.data;
        setRequests(myReqs);

        // Fetch matches counts for each request to show on request cards
        const counts: Record<string, number> = {};
        await Promise.all(
          myReqs.map(async (req) => {
            const matchesRes = await fetchMatchesByRequest(req.id);
            if (matchesRes.success && matchesRes.data) {
              // Count only ready/accepted matches or any volunteered donor
              counts[req.id] = matchesRes.data.length;
            }
          })
        );
        setMatchCounts(counts);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your blood requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Filter requests based on tab selection
  useEffect(() => {
    let result = [...requests];
    if (activeTab !== 'all') {
      result = result.filter(r => r.status === activeTab);
    }
    setFilteredRequests(result);
  }, [requests, activeTab]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Spinner size="lg" className="border-brand-600" />
        <p className="text-gray-500 font-medium text-sm">Loading your blood requests...</p>
      </div>
    );
  }

  const tabLabels: Record<FilterType, string> = {
    all: 'All Requests',
    open: 'Open',
    in_progress: 'In Progress',
    fulfilled: 'Fulfilled',
    cancelled: 'Cancelled',
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          My Requests
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review status lifecycle and volunteered donor matches for posted requests.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex flex-wrap gap-4 sm:gap-6" aria-label="Tabs">
          {(['all', 'open', 'in_progress', 'fulfilled', 'cancelled'] as FilterType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'py-4 px-1 border-b-2 font-bold text-sm select-none transition-all',
                activeTab === tab
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
              )}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </nav>
      </div>

      {/* Requests Feed */}
      <div className="flex flex-col gap-4">
        {filteredRequests.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Requests Found"
            subtitle={`You do not have any requests in the "${tabLabels[activeTab]}" category.`}
            actionLabel={activeTab === 'all' ? "Create Blood Request" : undefined}
            onAction={activeTab === 'all' ? () => navigate('/requester/create') : undefined}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {filteredRequests.map((request) => {
              const matchedCount = matchCounts[request.id] || 0;
              return (
                <div 
                  key={request.id}
                  onClick={() => navigate(`/requester/requests/${request.id}`)}
                  className="cursor-pointer group block"
                >
                  <Card className="p-0 border-gray-100 hover:border-brand-100/50 shadow-sm relative overflow-hidden transition-all duration-200">
                    <RequestCard request={request} />
                    
                    {/* Foot Tag for Volunteer Matches */}
                    <div className="bg-gray-50/50 border-t border-gray-100/80 px-6 py-2.5 flex items-center justify-between text-xs text-gray-500 group-hover:bg-brand-50/10">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        Matched: <b>{matchedCount} Donor{matchedCount !== 1 && 's'} volunteered</b>
                      </span>
                      <span className="text-brand-600 font-bold group-hover:underline flex items-center gap-0.5">
                        Manage Details &rarr;
                      </span>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
