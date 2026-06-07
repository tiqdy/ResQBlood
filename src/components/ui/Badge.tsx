import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: 'brand' | 'green' | 'orange' | 'blue' | 'red' | 'gray' | 'yellow' | 'purple' | 'rose' | 'amber' | 'indigo' | 'sky';
  label?: string;
}

export function Badge({ color = 'gray', label, children, className, ...props }: BadgeProps) {
  const colors = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    rose: 'bg-rose-100 text-rose-700 border-rose-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    sky: 'bg-sky-100 text-sky-700 border-sky-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        colors[color],
        className
      )}
      {...props}
    >
      {label || children}
    </span>
  );
}
