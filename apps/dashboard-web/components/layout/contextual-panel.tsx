'use client';

import React, { useState } from 'react';
import { HaloOrb, Card, CardHeader, CardTitle, CardContent, Button } from '@safetyos/ui';
import { OrbState, Citation } from '@safetyos/shared-types';
import { Sparkles, X, ChevronRight, ExternalLink } from 'lucide-react';

export const ContextualPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [orbState, setOrbState] = useState<OrbState>('IDLE');

  if (!isOpen) return null;

  const mockCitations: Citation[] = [
    {
      id: 'cit-1',
      title: 'ISO 45001 High-Risk Area Protocol §4.2',
      sourceType: 'REGULATION',
      confidenceScore: 0.96,
      snippet: 'Confined space entry requires dual-authorizer lockout verification prior to permit activation.',
    },
    {
      id: 'cit-2',
      title: 'SOP-PLANT-042 LOTO Sequence',
      sourceType: 'SOP',
      confidenceScore: 0.92,
      snippet: 'Valves V-102 and V-104 must be tagged out and zero energy verified.',
    },
  ];

  return (
    <aside className="w-80 bg-white dark:bg-[#101216] border-l border-[#DDE1E7] dark:border-[#22262E] flex flex-col justify-between p-4 shrink-0 z-20 overflow-y-auto">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#EEF0F3] dark:border-[#181B21]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#111827] dark:text-[#E4E7ED]">
            <Sparkles className="h-4 w-4 text-[#06B6D4]" />
            <span>SafetyOS Copilot</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded hover:bg-[#EEF0F3] dark:hover:bg-[#181B21] text-[#6B7280]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Halo Orb AI Surface */}
        <div className="flex flex-col items-center py-6 bg-[#F6F7F9] dark:bg-[#0A0B0D] rounded-xl border border-[#EEF0F3] dark:border-[#181B21] mb-5">
          <HaloOrb state={orbState} size="lg" />
          <p className="mt-3 text-xs font-mono uppercase tracking-wider text-[#06B6D4]">
            STATE: {orbState}
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setOrbState('THINKING')}
              className="text-[10px] px-2 py-0.5 rounded bg-[#EEF0F3] dark:bg-[#181B21] text-[#4B5563]"
            >
              Think
            </button>
            <button
              onClick={() => setOrbState('STREAMING')}
              className="text-[10px] px-2 py-0.5 rounded bg-[#EEF0F3] dark:bg-[#181B21] text-[#4B5563]"
            >
              Stream
            </button>
            <button
              onClick={() => setOrbState('IDLE')}
              className="text-[10px] px-2 py-0.5 rounded bg-[#EEF0F3] dark:bg-[#181B21] text-[#4B5563]"
            >
              Idle
            </button>
          </div>
        </div>

        {/* Reasoning Trace Timeline */}
        <div className="mb-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-3">
            Agent Reasoning Trace
          </h4>
          <div className="space-y-3 relative border-l-2 border-[#DDE1E7] dark:border-[#22262E] ml-2 pl-3">
            <div className="relative">
              <span className="absolute -left-[17px] top-1 h-2 w-2 rounded-full bg-[#06B6D4]" />
              <p className="text-xs font-medium text-[#111827] dark:text-[#E4E7ED]">Observed Anomaly</p>
              <p className="text-[11px] text-[#6B7280]">CV-027 frame detected unverified gas tester entry in Zone 4.</p>
            </div>
            <div className="relative">
              <span className="absolute -left-[17px] top-1 h-2 w-2 rounded-full bg-[#3B82F6]" />
              <p className="text-xs font-medium text-[#111827] dark:text-[#E4E7ED]">Retrieved SOP Knowledge</p>
              <p className="text-[11px] text-[#6B7280]">Matched PTW-9041 active permit constraints.</p>
            </div>
            <div className="relative">
              <span className="absolute -left-[17px] top-1 h-2 w-2 rounded-full bg-[#10B981]" />
              <p className="text-xs font-medium text-[#111827] dark:text-[#E4E7ED]">Recommendation Formulated</p>
              <p className="text-[11px] text-[#6B7280]">Recommend immediate supervisor gas verification audit.</p>
            </div>
          </div>
        </div>

        {/* Citations & Evidence */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2">
            Grounding Citations
          </h4>
          <div className="space-y-2">
            {mockCitations.map((c) => (
              <div
                key={c.id}
                className="p-2.5 rounded-lg bg-[#F6F7F9] dark:bg-[#181B21] border border-[#EEF0F3] dark:border-[#2F343D] text-xs"
              >
                <div className="flex items-center justify-between font-medium text-[#06B6D4] mb-1">
                  <span className="truncate">{c.title}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </div>
                <p className="text-[11px] text-[#4B5563] dark:text-[#8A93A1] line-clamp-2">{c.snippet}</p>
                <div className="mt-1 text-[10px] text-[#6B7280]">Confidence: {(c.confidenceScore * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input Prompt Footer */}
      <div className="pt-3 border-t border-[#EEF0F3] dark:border-[#181B21]">
        <input
          type="text"
          placeholder="Ask SafetyOS AI..."
          className="w-full px-3 py-2 text-xs rounded-md bg-[#F6F7F9] dark:bg-[#181B21] border border-[#DDE1E7] dark:border-[#22262E] focus:outline-none focus:ring-1 focus:ring-[#06B6D4]"
        />
      </div>
    </aside>
  );
};
