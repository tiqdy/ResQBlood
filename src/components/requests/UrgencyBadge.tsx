import { Badge } from '../ui/Badge';
import type { UrgencyLevel } from '../../types';
import { getUrgencyLabel } from '../../lib/utils';

interface UrgencyBadgeProps {
  urgency: UrgencyLevel;
  className?: string;
}

export function UrgencyBadge({ urgency, className }: UrgencyBadgeProps) {
  const colors: Record<UrgencyLevel, 'red' | 'orange' | 'blue'> = {
    critical: 'red',
    urgent: 'orange',
    normal: 'blue',
  };

  return (
    <Badge 
      color={colors[urgency]} 
      label={getUrgencyLabel(urgency)} 
      className={className} 
    />
  );
}
