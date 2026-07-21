import React from 'react';
import { cn } from '../../lib/utils';
import { SeverityLevel } from '@safetyos/shared-types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  severity?: SeverityLevel | 'default' | 'halo' | 'success';
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, severity = 'default', dot = false, children, ...props }, ref) => {
    const severityStyles: Record<string, string> = {
      default: 'bg-[#EEF0F3] text-[#374151] dark:bg-[#181B21] dark:text-[#8A93A1]',
      info: 'bg-[#E0F2FE] text-[#0369A1] border border-[#38BDF8]/30 dark:bg-[#082F49] dark:text-[#7DD3FC]',
      low: 'bg-[#E0F2FE] text-[#0369A1] border border-[#38BDF8]/30 dark:bg-[#082F49] dark:text-[#7DD3FC]',
      medium: 'bg-[#FEF3C7] text-[#B45309] border border-[#FBBF24]/30 dark:bg-[#451A03] dark:text-[#FDE68A]',
      success: 'bg-[#DCFCE7] text-[#15803D] border border-[#4ADE80]/30 dark:bg-[#052E16] dark:text-[#86EFAC]',
      warning: 'bg-[#FEF3C7] text-[#B45309] border border-[#FBBF24]/30 dark:bg-[#451A03] dark:text-[#FDE68A]',
      high: 'bg-[#FEE2E2] text-[#B91C1C] border border-[#F87171]/30 dark:bg-[#450A0A] dark:text-[#FCA5A5]',
      critical: 'bg-[#FEE2E2] text-[#B91C1C] font-semibold border border-[#F87171] dark:bg-[#7F1D1D] dark:text-[#FECACA] animate-pulse',
      catastrophic: 'bg-[#7F1D1D] text-white font-bold border-2 border-[#FF0000] dark:bg-[#450A0A] dark:text-[#FF8080] animate-bounce',
      halo: 'bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/40 dark:bg-[#06B6D4]/20 dark:text-[#00F0FF]',
    };

    const dotColors: Record<string, string> = {
      default: 'bg-[#6B7280]',
      info: 'bg-[#0284C7]',
      low: 'bg-[#0284C7]',
      medium: 'bg-[#D97706]',
      success: 'bg-[#16A34A]',
      warning: 'bg-[#D97706]',
      high: 'bg-[#DC2626]',
      critical: 'bg-[#DC2626]',
      catastrophic: 'bg-[#FF0000]',
      halo: 'bg-[#06B6D4]',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide uppercase',
          severityStyles[severity],
          className
        )}
        {...props}
      >
        {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[severity])} />}
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';
