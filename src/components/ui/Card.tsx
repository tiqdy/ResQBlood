import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export function Card({ children, header, footer, noPadding = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-gray-200',
        className
      )}
      {...props}
    >
      {header && (
        <div className="border-b border-gray-100 px-6 py-4 bg-gray-50/60 font-semibold text-gray-800 text-sm flex items-center">
          {header}
        </div>
      )}
      <div className={cn(noPadding ? 'p-0' : 'p-6')}>{children}</div>
      {footer && (
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/40">
          {footer}
        </div>
      )}
    </div>
  );
}
