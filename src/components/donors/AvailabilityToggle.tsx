
import { useAuthStore } from '../../store/authStore';
import { useDonorDetails } from '../../hooks/useDonorDetails';
import { Spinner } from '../ui/Spinner';
import { cn } from '../../lib/utils';
import { CheckCircle2, XCircle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export function AvailabilityToggle() {
  const { donorDetails } = useAuthStore();
  const { updateAvailability, loading } = useDonorDetails();

  if (!donorDetails) return null;

  const isAvailable = donorDetails.is_available;

  const handleToggle = async () => {
    const nextVal = !isAvailable;
    const res = await updateAvailability(nextVal);
    if (res.success) {
      toast.success(
        nextVal 
          ? '✅ You are now available to donate blood!' 
          : '⏸️ Availability set to inactive.'
      );
    } else {
      toast.error(res.error || 'Failed to update availability status');
    }
  };

  return (
    <div 
      className={cn(
        "rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300",
        isAvailable 
          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm shadow-green-100" 
          : "bg-gray-50 border-gray-200"
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "h-11 w-11 shrink-0 rounded-xl flex items-center justify-center border transition-all duration-300",
          isAvailable 
            ? "bg-green-100 border-green-200 text-green-600 shadow-sm" 
            : "bg-gray-100 border-gray-200 text-gray-400"
        )}>
          {isAvailable 
            ? <CheckCircle2 className="h-5 w-5" /> 
            : <XCircle className="h-5 w-5" />
          }
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className={cn(
              "font-bold text-base leading-none transition-colors",
              isAvailable ? "text-green-800" : "text-gray-600"
            )}>
              {isAvailable ? 'Availability: Active' : 'Availability: Inactive'}
            </h4>
            {isAvailable && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 animate-pulse">
                <Zap className="h-2.5 w-2.5 fill-green-600" />
                LIVE
              </span>
            )}
          </div>
          <p className={cn(
            "text-xs mt-1.5 max-w-md leading-relaxed",
            isAvailable ? "text-green-700/70" : "text-gray-400"
          )}>
            {isAvailable 
              ? 'Your profile is visible to requesters looking for compatible donors.' 
              : 'Your profile is temporarily hidden from matching searches. Toggle to go active.'
            }
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {loading && <Spinner size="sm" className={isAvailable ? 'border-green-600' : 'border-gray-400'} />}
        
        {/* Toggle Switch */}
        <button
          onClick={handleToggle}
          disabled={loading}
          aria-label={isAvailable ? "Set inactive" : "Set active"}
          className={cn(
            "relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            isAvailable 
              ? "bg-green-500 focus-visible:ring-green-500 shadow-sm shadow-green-300" 
              : "bg-gray-300 focus-visible:ring-gray-400",
            loading && "opacity-50 pointer-events-none"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out",
              isAvailable ? "translate-x-6" : "translate-x-0"
            )}
          />
        </button>
      </div>
    </div>
  );
}
