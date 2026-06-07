import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { UrgencyBadge } from '../requests/UrgencyBadge';
import type { Match, MatchStatus } from '../../types';
import { formatDate } from '../../lib/utils';
import { MapPin, Calendar, Heart, Check, X } from 'lucide-react';
import { BLOOD_TYPE_COLORS } from '../../constants/bloodTypes';

interface MatchCardProps {
  match: Match;
  onAccept?: () => void;
  onDecline?: () => void;
  isAcceptLoading?: boolean;
  isDeclineLoading?: boolean;
}

export function MatchCard({
  match,
  onAccept,
  onDecline,
  isAcceptLoading = false,
  isDeclineLoading = false,
}: MatchCardProps) {
  const request = match.blood_requests;
  if (!request) return null;

  const colors = BLOOD_TYPE_COLORS[request.blood_type] || { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };

  // Colors for match status
  const matchStatusColors: Record<MatchStatus, 'yellow' | 'green' | 'red' | 'blue'> = {
    pending: 'yellow',
    accepted: 'green',
    declined: 'red',
    blood_ready: 'blue',
    ready_for_collection: 'blue',
    collected: 'green',
    completed: 'blue',
  };

  const matchStatusLabels: Record<MatchStatus, string> = {
    pending: 'Pending Confirmation',
    accepted: 'Ready to Help',
    declined: 'Declined',
    blood_ready: 'Blood Ready for Collection',
    ready_for_collection: 'Awaiting Collection / Pickup',
    collected: 'Blood Collected by Recipient',
    completed: 'Completed',
  };

  return (
    <Card className="hover:translate-y-[-2px] transition-transform duration-200">
      <div className="flex flex-col md:flex-row gap-5 justify-between">
        
        {/* Left Section: Blood info and request metadata */}
        <div className="flex gap-4 items-start">
          {/* Blood Type Display */}
          <div className={`h-14 w-14 shrink-0 rounded-2xl border flex flex-col items-center justify-center ${colors.bg} ${colors.text} ${colors.border}`}>
            <span className="text-xl font-black tracking-tight leading-none">{request.blood_type}</span>
            <span className="text-[8px] uppercase font-bold tracking-wider mt-0.5 opacity-80">Blood</span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap gap-2 items-center">
              <UrgencyBadge urgency={request.urgency} />
              <Badge 
                color={matchStatusColors[match.status]} 
                label={matchStatusLabels[match.status]} 
              />
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Matched: {formatDate(match.created_at)}
              </span>
            </div>

            <h4 className="text-base font-bold text-gray-900 leading-tight mt-0.5">
              Hospital: {request.hospital_name}
            </h4>
            <p className="text-xs text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-md inline-block max-w-max my-0.5">
              PMI Donation Branch: {request.pmi_branch}
            </p>
            <p className="text-xs text-gray-500 font-medium">
              Patient: {request.patient_name}
            </p>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {request.city}, {request.province}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 text-brand-600 fill-brand-50" />
                Bags Needed: {request.bags_needed} Bags
              </span>
            </div>
            
            {request.notes && (
              <p className="text-xs text-gray-400 bg-gray-50 p-2 rounded-lg border border-gray-100/50 mt-1">
                Notes: &ldquo;{request.notes}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Right Section: Pending action controls */}
        {match.status === 'pending' && (onAccept || onDecline) && (
          <div className="flex items-end md:items-center justify-end gap-2 shrink-0 self-stretch sm:self-center">
            {onDecline && (
              <Button
                variant="ghost"
                onClick={onDecline}
                isLoading={isDeclineLoading}
                className="h-10 px-4 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold border border-transparent hover:border-red-100"
                disabled={isAcceptLoading}
              >
                <X className="h-4 w-4 mr-1.5" />
                Cancel volunteering
              </Button>
            )}
            
            {onAccept && (
              <Button
                variant="primary"
                onClick={onAccept}
                isLoading={isAcceptLoading}
                className="h-10 px-4 font-bold bg-green-600 hover:bg-green-700 text-sm focus-visible:ring-green-600"
                disabled={isDeclineLoading}
              >
                <Check className="h-4 w-4 mr-1.5" />
                Confirm Mobilization
              </Button>
            )}
          </div>
        )}

      </div>
    </Card>
  );
}
