import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { UrgencyBadge } from './UrgencyBadge';
import { RequestStatusBadge } from './RequestStatusBadge';
import type { BloodRequest } from '../../types';
import { BLOOD_TYPE_COLORS } from '../../constants/bloodTypes';
import { formatDate } from '../../lib/utils';
import { MapPin, Calendar, Heart, User } from 'lucide-react';

interface RequestCardProps {
  request: BloodRequest;
  onVolunteer?: () => void;
  showVolunteerButton?: boolean;
  isVolunteeringLoading?: boolean;
}

export function RequestCard({ 
  request, 
  onVolunteer, 
  showVolunteerButton = false,
  isVolunteeringLoading = false 
}: RequestCardProps) {
  
  const colors = BLOOD_TYPE_COLORS[request.blood_type] || { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };

  return (
    <Card className="hover:translate-y-[-2px] transition-transform duration-200">
      <div className="flex flex-col md:flex-row gap-5 justify-between">
        
        {/* Left Side: Blood Type Circle & Principal Info */}
        <div className="flex gap-4 items-start">
          {/* Blood Type Circle Tag */}
          <div className={`h-16 w-16 shrink-0 rounded-2xl border flex flex-col items-center justify-center ${colors.bg} ${colors.text} ${colors.border}`}>
            <span className="text-2xl font-black tracking-tighter leading-none">{request.blood_type}</span>
            <span className="text-[9px] uppercase font-bold tracking-wider opacity-80 mt-1">Blood</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap gap-2 items-center">
              <UrgencyBadge urgency={request.urgency} />
              <RequestStatusBadge status={request.status} />
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(request.created_at)}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              {request.patient_name}
            </h3>
            
            <p className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-600" />
              Hospital: {request.hospital_name}
            </p>

            <p className="text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-100 px-2 py-1 rounded-md inline-block max-w-max mt-0.5">
              PMI Donation Branch: {request.pmi_branch}
            </p>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                {request.city}, {request.province}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 text-brand-600" />
                {request.bags_needed} Bags Needed
              </span>
            </div>
            
            {request.notes && (
              <p className="text-xs text-gray-400 italic bg-gray-50 p-2.5 rounded-lg border border-gray-100/50 mt-1.5 max-w-xl">
                &ldquo;{request.notes}&rdquo;
              </p>
            )}

            {request.profiles && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                <User className="h-3.5 w-3.5" />
                <span>Requester: {request.profiles.full_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Action Button */}
        {showVolunteerButton && onVolunteer && (
          <div className="flex items-end justify-end md:self-center shrink-0">
            <Button
              variant="primary"
              onClick={onVolunteer}
              isLoading={isVolunteeringLoading}
              className="w-full md:w-auto font-bold h-10 px-5 shadow-sm active:scale-95 text-sm"
              disabled={request.status !== 'open' && request.status !== 'in_progress'}
            >
              Volunteer to Donate at PMI
            </Button>
          </div>
        )}

      </div>
    </Card>
  );
}
