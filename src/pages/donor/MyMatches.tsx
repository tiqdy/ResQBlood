import { useState, useEffect } from 'react';
import { useMatches } from '../../hooks/useMatches';
import { MatchCard } from '../../components/matches/MatchCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { HeartHandshake } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Match } from '../../types';
import { cn } from '../../lib/utils';

type TabType = 'pending' | 'accepted' | 'history';

export default function MyMatches() {
  const { fetchMatchesByDonor, acceptMatch, declineMatch } = useMatches();

  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [loading, setLoading] = useState(true);

  // Volunteer operations state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'decline' | null>(null);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const res = await fetchMatchesByDonor();
      if (res.success && res.data) {
        setMatches(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load volunteered matches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  // Filter based on active tab
  useEffect(() => {
    let result: Match[] = [];
    if (activeTab === 'pending') {
      result = matches.filter(m => m.status === 'pending');
    } else if (activeTab === 'accepted') {
      result = matches.filter(m => m.status === 'accepted' || m.status === 'blood_ready' || m.status === 'ready_for_collection');
    } else if (activeTab === 'history') {
      result = matches.filter(m => m.status === 'collected' || m.status === 'completed' || m.status === 'declined');
    }
    setFilteredMatches(result);
  }, [matches, activeTab]);

  const handleAccept = async (matchId: string) => {
    setActionLoadingId(matchId);
    setActionType('accept');
    const res = await acceptMatch(matchId);
    setActionLoadingId(null);
    setActionType(null);

    if (res.success) {
      toast.success('Successfully confirmed readiness! Thank you.');
      loadMatches();
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
      loadMatches();
    } else {
      toast.error(res.error || 'Failed to decline match.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Spinner size="lg" className="border-brand-600" />
        <p className="text-gray-500 font-medium text-sm">Loading your matches...</p>
      </div>
    );
  }

  // Text descriptions per tab
  const emptyStateConfig = {
    pending: {
      title: 'No Pending Matches',
      subtitle: 'You do not have any pending match requests. Go to Browse Requests to find match opportunities.'
    },
    accepted: {
      title: 'No Accepted Matches',
      subtitle: 'You haven\'t accepted any matches yet. Accept pending matches to coordinate with requesters.'
    },
    history: {
      title: 'No History Record',
      subtitle: 'You do not have any completed or declined match records yet.'
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          My Matches
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your volunteered blood donations and track coordinate states.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6" aria-label="Tabs">
          {(['pending', 'accepted', 'history'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'py-4 px-1 border-b-2 font-bold text-sm select-none capitalize transition-all',
                activeTab === tab
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
              )}
            >
              {tab === 'history' ? 'History' : tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Matches List */}
      <div className="flex flex-col gap-4">
        {filteredMatches.length === 0 ? (
          <EmptyState
            icon={HeartHandshake}
            title={emptyStateConfig[activeTab].title}
            subtitle={emptyStateConfig[activeTab].subtitle}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onAccept={activeTab === 'pending' ? () => handleAccept(match.id) : undefined}
                onDecline={activeTab === 'pending' ? () => handleDecline(match.id) : undefined}
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
