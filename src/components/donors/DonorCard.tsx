import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { Profile, DonorDetails, MatchStatus, Screening } from '../../types';
import { 
  isEligibleToDonate, 
  daysSinceLastDonation,
  formatDate 
} from '../../lib/utils';
import { MapPin, Phone, Award, ShieldAlert, CheckSquare, FileText, CheckCircle2 } from 'lucide-react';

interface DonorCardProps {
  profile: Profile;
  donorDetails: DonorDetails;
  matchStatus?: MatchStatus;
  screening?: Screening;
  onReadyForCollection?: () => void;
  isCompletingLoading?: boolean;
}

export function DonorCard({
  profile,
  donorDetails,
  matchStatus,
  screening,
  onReadyForCollection,
  isCompletingLoading = false
}: DonorCardProps) {

  const eligible = isEligibleToDonate(donorDetails.last_donated_at);
  const daysDiff = daysSinceLastDonation(donorDetails.last_donated_at);
  const daysLeft = daysDiff !== null ? Math.max(0, 90 - daysDiff) : 0;

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
    pending: 'Pending',
    accepted: 'Ready to Help',
    declined: 'Declined',
    blood_ready: 'Blood Ready for Collection',
    ready_for_collection: 'Awaiting Collection / Pickup',
    collected: 'Blood Collected',
    completed: 'Completed',
  };

  return (
    <Card className="hover:translate-y-[-2px] transition-transform duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        
        {/* Donor Main Profile Details */}
        <div className="flex items-start gap-4">
          {/* Avatar Placeholder / Blood Type Tag */}
          <div className="h-12 w-12 shrink-0 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 font-extrabold text-lg">
            {profile.blood_type || '?'}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                {profile.full_name}
              </h3>
              
              {/* Match status badge */}
              {matchStatus && (
                <Badge 
                  color={matchStatusColors[matchStatus]} 
                  label={matchStatusLabels[matchStatus]} 
                  className="scale-90"
                />
              )}
            </div>

            {/* Sub-info */}
            <div className="flex flex-col gap-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                {profile.city}, {profile.province}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                {profile.phone ? `${profile.phone.slice(0, 4)}-xxxx-xxxx` : 'No Phone Number'}
              </span>
            </div>

            {/* Eligibility Info Bar */}
            <div className="mt-2.5">
              {donorDetails.last_donated_at === null ? (
                <Badge color="blue" className="gap-1 font-semibold">
                  <Award className="h-3 w-3" />
                  First-time Donor
                </Badge>
              ) : eligible ? (
                <Badge color="green" className="gap-1 font-semibold">
                  <Award className="h-3 w-3" />
                  Eligible (Last: {formatDate(donorDetails.last_donated_at)})
                </Badge>
              ) : (
                <Badge color="orange" className="gap-1 font-semibold">
                  <ShieldAlert className="h-3 w-3" />
                  Not Eligible (Eligible in {daysLeft} days)
                </Badge>
              )}
              
              <span className="text-[11px] text-gray-400 ml-2">
                Total Donations: <b>{donorDetails.total_donations || 0}x</b>
              </span>
            </div>

            {/* Screening Details block (Rendered only when blood has been screened & cleared) */}
            {screening && (matchStatus === 'blood_ready' || matchStatus === 'ready_for_collection' || matchStatus === 'collected' || matchStatus === 'completed') && (() => {
              try {
                const results = typeof screening.notes === 'string' ? JSON.parse(screening.notes) : screening.notes;
                
                return (
                  <div className="mt-3 bg-gray-50 border border-gray-150 rounded-2xl p-3 text-xs text-gray-600 max-w-lg">
                    <span className="font-bold text-gray-800 flex items-center gap-1 mb-2">
                      <FileText className="h-4 w-4 text-brand-600" />
                      PMI Official Screening Report
                    </span>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-medium">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        <span>HIV: {results.hiv || 'non-reactive'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        <span>Hepatitis B (HBV): {results.hbv || 'non-reactive'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        <span>Hepatitis C (HCV): {results.hcv || 'non-reactive'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        <span>Syphilis: {results.syphilis || 'non-reactive'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        <span>Hepatitis E (HEV): {results.hev || 'non-reactive'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        <span>HTLV: {results.htlv || 'non-reactive'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        <span>Hepatitis A (HAV): {results.hav || 'non-reactive'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        <span>Parvovirus (B19): {results.parvovirus || 'non-reactive'}</span>
                      </div>
                    </div>

                    {/* Additional test logs */}
                    {(results.malaria === 'tested-negative' || results.t_cruzi === 'tested-negative' || results.wnv === 'tested-negative' || results.cmv === 'tested-negative') && (
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Additional Context Tests Conducted</span>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-brand-700">
                          {results.malaria === 'tested-negative' && <span>• Malaria (Negative)</span>}
                          {results.t_cruzi === 'tested-negative' && <span>• T-Cruzi (Negative)</span>}
                          {results.wnv === 'tested-negative' && <span>• WNV (Negative)</span>}
                          {results.cmv === 'tested-negative' && <span>• CMV (Negative)</span>}
                        </div>
                      </div>
                    )}
                    
                    {results.admin_notes && (
                      <p className="mt-2 text-[11px] text-gray-400 italic font-normal border-t border-gray-200 pt-1.5">
                        PMI Notes: &ldquo;{results.admin_notes}&rdquo;
                      </p>
                    )}
                  </div>
                );
              } catch (e) {
                return null;
              }
            })()}
          </div>
        </div>

        {/* Action button (Recipient notifies PMI they are ready for collection) */}
        {matchStatus === 'blood_ready' && onReadyForCollection && (
          <div className="flex items-end justify-end self-end sm:self-center shrink-0">
            <Button
              variant="secondary"
              onClick={onReadyForCollection}
              isLoading={isCompletingLoading}
              className="font-bold h-9 text-xs gap-1.5"
            >
              <CheckSquare className="h-4 w-4" />
              Ready for Collection
            </Button>
          </div>
        )}

      </div>
    </Card>
  );
}
