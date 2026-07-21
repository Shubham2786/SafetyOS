import React from 'react';
import { Topbar } from './topbar';
import { LeftRail } from './left-rail';
import { ContextualPanel } from './contextual-panel';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#FCFCFD] dark:bg-[#0A0B0D]">
      <Topbar />
      <div className="flex-1 flex overflow-hidden">
        <LeftRail />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
        <ContextualPanel />
      </div>
    </div>
  );
};
