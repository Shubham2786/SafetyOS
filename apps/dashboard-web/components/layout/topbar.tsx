import React from 'react';
import { Shield, Bell, Search, User, ChevronDown } from 'lucide-react';
import { Badge } from '@safetyos/ui';

export const Topbar: React.FC = () => {
  return (
    <header className="h-14 bg-white dark:bg-[#101216] border-b border-[#DDE1E7] dark:border-[#22262E] px-4 flex items-center justify-between shrink-0 select-none z-30">
      {/* Brand & Site Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-[#06B6D4] flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]">
            <Shield className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-[#111827] dark:text-[#E4E7ED]">
            Safety<span className="text-[#06B6D4]">OS</span>
          </span>
        </div>

        <div className="h-4 w-px bg-[#DDE1E7] dark:bg-[#22262E] mx-1" />

        <button className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-[#F6F7F9] dark:bg-[#181B21] text-[#374151] dark:text-[#8A93A1] border border-[#EEF0F3] dark:border-[#2F343D]">
          <span>Plant Site Alpha (Zone 4)</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>

        <Badge severity="success" dot className="hidden sm:inline-flex">
          SYSTEM NOMINAL
        </Badge>
      </div>

      {/* Quick Search & Actions */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#8A93A1] bg-[#F6F7F9] dark:bg-[#181B21] border border-[#DDE1E7] dark:border-[#22262E] px-3 py-1.5 rounded-md w-48 sm:w-64">
          <Search className="h-3.5 w-3.5" />
          <span>Search permits, assets, AI (⌘K)</span>
        </button>

        <button className="relative p-2 rounded-md hover:bg-[#EEF0F3] dark:hover:bg-[#181B21] text-[#4B5563] dark:text-[#8A93A1]">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#DC2626]" />
        </button>

        <div className="h-4 w-px bg-[#DDE1E7] dark:bg-[#22262E]" />

        {/* Active Persona Chip */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center justify-center text-[#06B6D4] font-medium text-xs">
            SS
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-medium text-[#111827] dark:text-[#E4E7ED] leading-none">Sanjay M.</p>
            <p className="text-[10px] text-[#6B7280] leading-tight">Shift Supervisor</p>
          </div>
        </div>
      </div>
    </header>
  );
};
