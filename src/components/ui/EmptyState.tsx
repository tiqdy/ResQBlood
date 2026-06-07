import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 py-16 bg-white border border-dashed border-gray-200 rounded-2xl">
      <div className="relative mb-5">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-2xl bg-red-100 blur-md opacity-60 scale-110" />
        <div className="relative h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200/60 text-red-500 shadow-sm">
          <Icon className="h-7 w-7" />
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-400 max-w-sm mb-6 text-sm leading-relaxed">{subtitle}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="md" className="shadow-md shadow-red-100">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
