import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'halo';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06B6D4] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer';

    const variants = {
      primary: 'bg-[#111827] text-white hover:bg-[#1F2937] dark:bg-[#E4E7ED] dark:text-[#050609] dark:hover:bg-[#FCFCFD]',
      secondary: 'bg-[#EEF0F3] text-[#111827] hover:bg-[#DDE1E7] dark:bg-[#181B21] dark:text-[#E4E7ED] dark:hover:bg-[#22262E]',
      outline: 'border border-[#C4CAD3] bg-transparent text-[#111827] hover:bg-[#F6F7F9] dark:border-[#2F343D] dark:text-[#E4E7ED] dark:hover:bg-[#181B21]',
      ghost: 'bg-transparent text-[#374151] hover:bg-[#EEF0F3] dark:text-[#8A93A1] dark:hover:bg-[#181B21]',
      destructive: 'bg-[#DC2626] text-white hover:bg-[#B91C1C] dark:bg-[#991B1B] dark:hover:bg-[#7F1D1D]',
      halo: 'bg-[#06B6D4] text-white hover:bg-[#0891B2] shadow-[0_0_15px_rgba(6,182,212,0.4)]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
      icon: 'h-10 w-10 p-0 justify-center',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
