import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useBloodRequests } from '../../hooks/useBloodRequests';
import { useMatches } from '../../hooks/useMatches';
import { RequestCard } from '../../components/requests/RequestCard';
import { DonorCard } from '../../components/donors/DonorCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { HeartHandshake, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { BloodRequest, Match } from '../../types';

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchRequestById, updateRequestStatus } = useBloodRequests();
  const { fetchMatchesByRequest } = useMatches();

  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal control states
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Donation complete/ready loading state
  const [updatingMatchId, setUpdatingMatchId] = useState<string | null>(null);

  const loadData = async () => {
    if (!id) return;
    try {
      // Fetch request details
      const reqRes = await fetchRequestById(id);
      if (reqRes.success && reqRes.data) {
        setRequest(reqRes.data);
      } else {
        toast.error('Failed to load request details.');
        navigate('/requester');
        return;
      }

      // Fetch volunteered matches
      const matchesRes = await fetchMatchesByRequest(id);
      if (matchesRes.success && matchesRes.data) {
        setMatches(matchesRes.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred loading request information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleUpdateStatus = async (status: 'fulfilled' | 'cancelled') => {
    if (!id) return;
    setActionLoading(true);
    const res = await updateRequestStatus(id, status);
    setActionLoading(false);
    setIsFulfillModalOpen(false);
    setIsCancelModalOpen(false);

    if (res.success) {
      toast.success(`Request successfully marked as ${status}.`);
      loadData();
    } else {
      toast.error(res.error || 'Failed to update request status.');
    }
  };

  const handleMarkReadyForCollection = async (matchId: string) => {
    setUpdatingMatchId(matchId);
    // Directly update match status in database to 'ready_for_collection'
    const { error: matchErr } = await supabase
      .from('matches')
      .update({ status: 'ready_for_collection' })
      .eq('id', matchId);
    
    setUpdatingMatchId(null);

    if (!matchErr) {
      toast.success("Notified PMI that you are ready for collection!");
      loadData();
    } else {
      toast.error(matchErr.message || 'Failed to update donation status.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Spinner size="lg" className="border-brand-600" />
        <p className="text-gray-500 font-medium text-sm">Loading request details...</p>
      </div>
    );
  }

  if (!request) return null;

  const hasCollectedMatch = matches.some(m => m.status === 'collected' || m.status === 'completed');
  const isActive = (request.status === 'open' || request.status === 'in_progress') && !hasCollectedMatch;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      
      {/* Back button and title */}
      <div className="flex items-center gap-3">
        <Link 
          to="/requester/requests" 
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Request Details
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            ID: {request.id}
          </p>
        </div>
      </div>

      {/* Main Request Information Card */}
      <RequestCard request={request} />

      {/* Status Action Buttons (only visible if request is active) */}
      {isActive && (
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="ghost"
            onClick={() => setIsCancelModalOpen(true)}
            className="font-bold text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-100 bg-white"
          >
            <XCircle className="h-4.5 w-4.5 mr-2" />
            Cancel Request
          </Button>
          
          <Button
            variant="primary"
            onClick={() => setIsFulfillModalOpen(true)}
            className="font-bold bg-green-600 hover:bg-green-700 focus-visible:ring-green-600 shadow-md shadow-green-600/5"
          >
            <CheckCircle className="h-4.5 w-4.5 mr-2" />
            Mark as Fulfilled
          </Button>
        </div>
      )}

      {/* Matched Donors Section */}
      <div className="flex flex-col gap-4 mt-2">
        <h2 className="text-lg font-bold text-gray-900">Volunteered Donors</h2>
        
        {matches.length === 0 ? (
          <EmptyState
            icon={HeartHandshake}
            title="No Donors Volunteered Yet"
            subtitle="Your request is active and visible to compatible donors. As soon as someone volunteers, they will appear here."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {matches.map((match) => (
              <DonorCard
                key={match.id}
                profile={match.profiles!}
                donorDetails={
                  Array.isArray((match.profiles as any)?.donor_details)
                    ? (match.profiles as any)?.donor_details[0]
                    : ((match.profiles as any)?.donor_details || ({} as any))
                }
                matchStatus={match.status}
                screening={match.screenings?.[0]}
                onReadyForCollection={
                  match.status === 'blood_ready' 
                    ? () => handleMarkReadyForCollection(match.id) 
                    : undefined
                }
                isCompletingLoading={updatingMatchId === match.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* 1. Mark as Fulfilled Confirmation Modal */}
      <Modal
        isOpen={isFulfillModalOpen}
        onClose={() => setIsFulfillModalOpen(false)}
        title="Mark Request as Fulfilled?"
      >
        <div className="flex flex-col gap-4 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900">Confirm Request Fulfillment</h4>
            <p className="text-xs text-gray-500 mt-1.5 leading-normal">
              Have you successfully received the required blood bags for this patient? 
              Marking this request as fulfilled will close it and hide it from future donor search lists.
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            <Button
              variant="ghost"
              onClick={() => setIsFulfillModalOpen(false)}
              className="flex-1 font-bold border border-gray-200"
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => handleUpdateStatus('fulfilled')}
              className="flex-1 font-bold bg-green-600 hover:bg-green-700"
              isLoading={actionLoading}
            >
              Yes, Fulfilled
            </Button>
          </div>
        </div>
      </Modal>

      {/* 2. Cancel Request Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Blood Request?"
      >
        <div className="flex flex-col gap-4 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900">Confirm Request Cancellation</h4>
            <p className="text-xs text-gray-500 mt-1.5 leading-normal">
              Are you sure you want to cancel this request? 
              This will remove the request from the matching queue and notify any volunteered donors.
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            <Button
              variant="ghost"
              onClick={() => setIsCancelModalOpen(false)}
              className="flex-1 font-bold border border-gray-200"
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleUpdateStatus('cancelled')}
              className="flex-1 font-bold"
              isLoading={actionLoading}
            >
              Yes, Cancel Request
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
