import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useMatches } from '../../hooks/useMatches';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { formatDate } from '../../lib/utils';
import { Award, Calendar, Landmark, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import type { DonationHistory as HistoryType } from '../../types';

export default function DonationHistory() {
  const { user } = useAuthStore();
  const { fetchDonationHistory } = useMatches();
  const { fetchProfileAndDetails } = useAuth();

  const [history, setHistory] = useState<HistoryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        if (user) {
          await fetchProfileAndDetails(user.id);
        }
        const res = await fetchDonationHistory();
        if (res.success && res.data) {
          setHistory(res.data);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load donation history.');
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const donorDetails = useAuthStore((state) => state.donorDetails);
  const totalDonations = donorDetails?.total_donations || 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Spinner size="lg" className="border-brand-600" />
        <p className="text-gray-500 font-medium text-sm">Loading your donation history...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header Info */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Donation History
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review your contribution timeline and impact track.
        </p>
      </div>

      {/* Thank You Box */}
      <Card className="bg-brand-50 border-brand-100 flex flex-col sm:flex-row items-center gap-5 p-6 shadow-sm">
        <div className="h-16 w-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-brand-600/10">
          <Award className="h-8 w-8" />
        </div>
        
        <div className="text-center sm:text-left">
          <h3 className="text-xl font-bold text-gray-900">
            You've donated {totalDonations} time{totalDonations !== 1 && 's'}. Thank you!
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-xl leading-relaxed">
            Your generous blood donations make a direct difference in saving patient lives. 
            Keep up the amazing service!
          </p>
        </div>
      </Card>

      {/* History Timeline */}
      <div className="flex flex-col gap-4">
        {history.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No Donations Recorded Yet"
            subtitle="You haven't completed any blood donations through ResQBlood yet. Be ready to volunteer when compatible requests appear."
          />
        ) : (
          <div className="relative border-l border-gray-200 ml-4 flex flex-col gap-6 py-4">
            {history.map((record) => (
              <div key={record.id} className="relative pl-8">
                {/* Timeline node icon */}
                <span className="absolute left-0 top-1.5 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 ring-4 ring-gray-50 text-brand-600">
                  <Heart className="h-3 w-3 fill-brand-600" />
                </span>

                <Card className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row justify-between gap-3">
                    
                    <div className="flex flex-col gap-1.5">
                      <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <Landmark className="h-4 w-4 text-gray-400" />
                        {record.hospital_name || 'Hospital Referral'}
                      </h4>

                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Donated Date: {formatDate(record.donated_at)}
                      </span>
                      
                      {record.notes && (
                        <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg mt-1 border border-gray-100/50">
                          {record.notes}
                        </p>
                      )}
                    </div>

                    {/* Bags badge removed per request */}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
