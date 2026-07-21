import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { OrbState } from '@safetyos/shared-types';

export interface HaloOrbProps extends React.HTMLAttributes<HTMLDivElement> {
  state?: OrbState;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

export const HaloOrb: React.FC<HaloOrbProps> = ({
  className,
  state = 'IDLE',
  size = 'md',
  ...props
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    hero: 'w-40 h-40',
  };

  const orbVariants = {
    IDLE: {
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
    LISTENING: {
      scale: [1, 1.15, 1],
      opacity: [0.9, 1, 0.9],
      transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
    },
    THINKING: {
      rotate: 360,
      scale: [1, 1.08, 1],
      transition: { rotate: { duration: 4, repeat: Infinity, ease: 'linear' }, scale: { duration: 1.5, repeat: Infinity } },
    },
    STREAMING: {
      scale: [1, 1.1, 0.98, 1.05, 1],
      transition: { duration: 0.8, repeat: Infinity },
    },
    EXECUTING_TOOL: {
      rotate: [0, 180, 360],
      scale: [1, 1.12, 1],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
    CONFIDENT: {
      scale: 1.05,
      boxShadow: '0 0 30px rgba(6, 182, 212, 0.8)',
    },
    UNCERTAIN: {
      x: [-2, 2, -2, 2, 0],
      transition: { duration: 0.5, repeat: Infinity },
    },
    ERROR: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.6, repeat: Infinity },
    },
    KILLED: {
      scale: 0.9,
      opacity: 0.3,
      filter: 'grayscale(100%)',
    },
  };

  const colorStyles: Record<OrbState, string> = {
    IDLE: 'from-[#06B6D4] to-[#083344] shadow-[0_0_20px_rgba(6,182,212,0.5)]',
    LISTENING: 'from-[#00F0FF] to-[#06B6D4] shadow-[0_0_25px_rgba(0,240,255,0.7)]',
    THINKING: 'from-[#06B6D4] via-[#3B82F6] to-[#083344] shadow-[0_0_30px_rgba(59,130,246,0.6)]',
    STREAMING: 'from-[#00F0FF] via-[#06B6D4] to-[#3B82F6] shadow-[0_0_35px_rgba(0,240,255,0.8)]',
    EXECUTING_TOOL: 'from-[#8B5CF6] via-[#06B6D4] to-[#083344] shadow-[0_0_25px_rgba(139,92,246,0.6)]',
    CONFIDENT: 'from-[#10B981] to-[#06B6D4] shadow-[0_0_30px_rgba(16,185,129,0.7)]',
    UNCERTAIN: 'from-[#F59E0B] to-[#D97706] shadow-[0_0_25px_rgba(245,158,11,0.6)]',
    ERROR: 'from-[#EF4444] to-[#7F1D1D] shadow-[0_0_30px_rgba(239,68,68,0.8)]',
    KILLED: 'from-[#4B5563] to-[#1F2937] shadow-none',
  };

  return (
    <div className={cn('relative flex items-center justify-center', sizeMap[size], className)} {...props}>
      <motion.div
        variants={orbVariants}
        animate={state}
        className={cn(
          'w-full h-full rounded-full bg-gradient-to-br transition-all duration-300',
          colorStyles[state]
        )}
      />
      {state === 'THINKING' && (
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#00F0FF] animate-spin" />
      )}
    </div>
  );
};
