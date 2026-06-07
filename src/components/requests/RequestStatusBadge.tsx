import { Badge } from '../ui/Badge';
import type { RequestStatus } from '../../types';
import { getStatusLabel } from '../../lib/utils';

interface RequestStatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

export function RequestStatusBadge({ status, className }: RequestStatusBadgeProps) {
  const colors: Record<RequestStatus, 'green' | 'yellow' | 'blue' | 'gray'> = {
    open: 'green',
    in_progress: 'yellow',
    fulfilled: 'blue',
    cancelled: 'gray',
  };

  return (
    <Badge 
      color={colors[status]} 
      label={getStatusLabel(status)} 
      className={className} 
    />
  );
}
