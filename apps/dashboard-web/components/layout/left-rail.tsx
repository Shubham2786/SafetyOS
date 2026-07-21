'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileCheck2,
  AlertOctagon,
  Box,
  TrendingUp,
  Bot,
  Settings,
  Lock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@safetyos/ui';

export const LeftRail: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Command Console', icon: LayoutDashboard },
    { href: '/permits', label: 'Permit to Work', icon: FileCheck2 },
    { href: '/incidents', label: 'Incidents & Hazards', icon: AlertOctagon },
    { href: '/loto', label: 'LOTO Management', icon: Lock },
    { href: '/digital-twin', label: 'Digital Twin', icon: Box },
    { href: '/risk-intelligence', label: 'Risk Intelligence', icon: TrendingUp },
    { href: '/ai-copilot', label: 'AI Workspace', icon: Bot },
    { href: '/settings', label: 'Platform Settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'bg-white dark:bg-[#101216] border-r border-[#DDE1E7] dark:border-[#22262E] flex flex-col justify-between transition-all duration-300 relative z-20 shrink-0 select-none',
        isCollapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#06B6D4]/10 text-[#06B6D4] dark:bg-[#06B6D4]/20 dark:text-[#00F0FF]'
                  : 'text-[#4B5563] dark:text-[#8A93A1] hover:bg-[#F6F7F9] dark:hover:bg-[#181B21] hover:text-[#111827] dark:hover:text-[#E4E7ED]'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-[#EEF0F3] dark:border-[#181B21] flex justify-end">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-[#EEF0F3] dark:hover:bg-[#181B21] text-[#6B7280] dark:text-[#8A93A1]"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
};
