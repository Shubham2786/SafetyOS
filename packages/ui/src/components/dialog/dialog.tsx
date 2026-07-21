import React from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Content Modal */}
      <div
        className={cn(
          'relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-[#101216] dark:border dark:border-[#22262E] transition-all',
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] text-[#6B7280] dark:text-[#8A93A1]"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {title && (
          <h2 className="text-xl font-semibold text-[#111827] dark:text-[#E4E7ED] mb-1">
            {title}
          </h2>
        )}

        {description && (
          <p className="text-sm text-[#4B5563] dark:text-[#8A93A1] mb-4">{description}</p>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
};
