import React from 'react';
import { cn } from '../../lib/utils';
import { AlertTriangle, AlertCircle, Info, XOctagon } from 'lucide-react';
import { SeverityLevel } from '@safetyos/shared-types';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  severity?: SeverityLevel;
  title?: string;
  onDismiss?: () => void;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, severity = 'info', title, children, onDismiss, ...props }, ref) => {
    const icons = {
      info: <Info className="h-5 w-5 text-[#0284C7] shrink-0" />,
      low: <Info className="h-5 w-5 text-[#0284C7] shrink-0" />,
      medium: <AlertTriangle className="h-5 w-5 text-[#D97706] shrink-0" />,
      high: <AlertCircle className="h-5 w-5 text-[#DC2626] shrink-0" />,
      critical: <AlertCircle className="h-5 w-5 text-[#DC2626] animate-pulse shrink-0" />,
      catastrophic: <XOctagon className="h-5 w-5 text-[#FF0000] animate-bounce shrink-0" />,
    };

    const containerStyles = {
      info: 'bg-[#E0F2FE] border-[#38BDF8] text-[#0369A1] dark:bg-[#082F49]/40 dark:border-[#0284C7]',
      low: 'bg-[#E0F2FE] border-[#38BDF8] text-[#0369A1] dark:bg-[#082F49]/40 dark:border-[#0284C7]',
      medium: 'bg-[#FEF3C7] border-[#FBBF24] text-[#B45309] dark:bg-[#451A03]/40 dark:border-[#D97706]',
      high: 'bg-[#FEE2E2] border-[#F87171] text-[#B91C1C] dark:bg-[#450A0A]/40 dark:border-[#DC2626]',
      critical: 'bg-[#FEE2E2] border-2 border-[#DC2626] text-[#B91C1C] dark:bg-[#7F1D1D]/40 dark:border-[#EF4444]',
      catastrophic: 'bg-[#7F1D1D] border-4 border-[#FF0000] text-white dark:bg-[#450A0A] dark:border-[#FF0000]',
    };

    const isHighPriority = severity === 'critical' || severity === 'catastrophic';

    return (
      <div
        ref={ref}
        role={isHighPriority ? 'alert' : 'status'}
        aria-live={isHighPriority ? 'assertive' : 'polite'}
        className={cn(
          'flex items-start gap-3 p-4 rounded-md border shadow-sm',
          containerStyles[severity],
          className
        )}
        {...props}
      >
        {icons[severity]}
        <div className="flex-1 text-sm">
          {title && <h4 className="font-semibold text-base mb-1">{title}</h4>}
          <div>{children}</div>
        </div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';
