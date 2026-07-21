import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'sunken' | 'featured' | 'interactive';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-[#DDE1E7] shadow-sm dark:bg-[#101216] dark:border-[#22262E]',
      sunken: 'bg-[#F6F7F9] border border-[#EEF0F3] dark:bg-[#0A0B0D] dark:border-[#181B21]',
      featured: 'bg-white border-2 border-[#06B6D4] shadow-md dark:bg-[#101216] dark:border-[#06B6D4]',
      interactive: 'bg-white border border-[#DDE1E7] shadow-sm hover:border-[#9AA3AF] hover:shadow-md transition-all cursor-pointer dark:bg-[#101216] dark:border-[#22262E] dark:hover:border-[#2F343D]',
    };

    return (
      <div
        ref={ref}
        className={cn('rounded-lg p-5', variants[variant], className)}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 mb-4', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold text-[#111827] dark:text-[#E4E7ED] tracking-tight', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-[#4B5563] dark:text-[#8A93A1]', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center pt-4 mt-4 border-t border-[#EEF0F3] dark:border-[#181B21]', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';
