import React from 'react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../card/card';

export interface KPICardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  changePercentage?: number;
  subtitle?: string;
  status?: 'normal' | 'warning' | 'critical';
}

export const KPICard = React.forwardRef<HTMLDivElement, KPICardProps>(
  (
    {
      className,
      title,
      value,
      unit,
      trend,
      changePercentage,
      subtitle,
      status = 'normal',
      ...props
    },
    ref
  ) => {
    const statusBorder = {
      normal: 'border-[#DDE1E7] dark:border-[#22262E]',
      warning: 'border-2 border-[#FBBF24] dark:border-[#D97706]',
      critical: 'border-2 border-[#F87171] dark:border-[#DC2626]',
    };

    return (
      <Card ref={ref} className={cn(statusBorder[status], className)} {...props}>
        <CardHeader className="mb-2">
          <CardTitle className="text-xs uppercase tracking-wider text-[#4B5563] dark:text-[#8A93A1]">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-[#111827] dark:text-[#E4E7ED] font-mono tabular-nums">
              {value}
            </span>
            {unit && <span className="text-sm font-medium text-[#6B7280]">{unit}</span>}
          </div>
          {(trend || changePercentage !== undefined || subtitle) && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              {trend === 'up' && (
                <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {changePercentage !== undefined && `+${changePercentage}%`}
                </span>
              )}
              {trend === 'down' && (
                <span className="flex items-center gap-0.5 text-rose-600 font-medium">
                  <TrendingDown className="h-3.5 w-3.5" />
                  {changePercentage !== undefined && `${changePercentage}%`}
                </span>
              )}
              {trend === 'neutral' && (
                <span className="flex items-center gap-0.5 text-gray-500 font-medium">
                  <Minus className="h-3.5 w-3.5" />
                  0%
                </span>
              )}
              {subtitle && (
                <span className="text-[#6B7280] dark:text-[#565E6B]">{subtitle}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);
KPICard.displayName = 'KPICard';
