'use client';

import React, { useState } from 'react';
import { HaloOrb, Button, Badge } from '@safetyos/ui';
import { OrbState, CopilotMessage } from '@safetyos/shared-types';
import { Sparkles, ShieldAlert, Send, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';

export default function AICopilotPage() {
  const [orbState, setOrbState] = useState<OrbState>('STREAMING');
  const [isKillSwitchActive, setIsKillSwitchActive] = useState(false);

  const messages: CopilotMessage[] = [
    {
      id: 'msg-1',
      threadId: 'th-99',
      sender: 'USER',
      content: 'Analyze compound risk factors in Zone 4 Tank Farm following the recent nitrogen purge anomaly.',
      timestamp: '10:14 AM',
    },
    {
      id: 'msg-2',
      threadId: 'th-99',
      sender: 'ASSISTANT',
      content: 'Based on real-time telemetry and Neo4j Knowledge Graph analysis, Zone 4 risk index rose from 42 to 88.4 following a gas sensor reading (18.5% O2). Recommend immediate isolation of nitrogen feeder valve V-104 and worker evacuation.',
      timestamp: '10:14 AM',
      orbState: 'STREAMING',
      confidence: 'HIGH',
      humanInLoopActionRequired: true,
      citations: [
        {
          id: 'cit-101',
          title: 'SOP-PLANT-042 Emergency Isolation Protocol',
          sourceType: 'SOP',
          confidenceScore: 0.98,
          snippet: 'If oxygen drops below 19.5%, immediately halt hot work and purge lines.',
        },
      ],
    },
  ];

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0A0B0D] text-[#E4E7ED]">
      {/* Top Header */}
      <header className="h-14 border-b border-[#22262E] px-6 flex items-center justify-between bg-[#101216]">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-[#06B6D4]" />
          <span className="font-bold text-lg tracking-tight">SafetyOS Agentic Copilot Workspace</span>
          <Badge severity="halo">EU AI ACT ARTICLE 14 COMPLIANT</Badge>
        </div>

        {/* AI Kill Switch Button (AG-020) */}
        <Button
          variant={isKillSwitchActive ? 'destructive' : 'outline'}
          leftIcon={<ShieldAlert className="h-4 w-4 text-red-500" />}
          onClick={() => {
            setIsKillSwitchActive(!isKillSwitchActive);
            setOrbState(isKillSwitchActive ? 'IDLE' : 'KILLED');
          }}
        >
          {isKillSwitchActive ? 'AI CIRCUIT BREAKER ENGAGED' : 'AI KILL-SWITCH (AG-020)'}
        </Button>
      </header>

      {/* Main Grid: Left Messages, Right Hero Orb & Reasoning Panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
        {/* Messages & Chat Surface */}
        <div className="lg:col-span-2 flex flex-col justify-between p-6 border-r border-[#22262E] overflow-y-auto">
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ASSISTANT' && (
                  <div className="shrink-0">
                    <HaloOrb state={orbState} size="sm" />
                  </div>
                )}
                <div
                  className={`max-w-xl p-4 rounded-xl text-sm ${
                    msg.sender === 'USER'
                      ? 'bg-[#06B6D4]/20 border border-[#06B6D4]/40 text-[#E4E7ED]'
                      : 'bg-[#101216] border border-[#22262E]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-[#8A93A1] mb-2">
                    <span className="font-semibold">{msg.sender}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="leading-relaxed">{msg.content}</p>

                  {/* Grounding Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#22262E]">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#06B6D4] mb-2">
                        Grounding Evidence & Citations
                      </p>
                      {msg.citations.map((c) => (
                        <div key={c.id} className="p-2 rounded bg-[#181B21] border border-[#2F343D] text-xs">
                          <div className="flex items-center justify-between font-medium text-[#00F0FF]">
                            <span>{c.title}</span>
                            <ExternalLink className="h-3 w-3" />
                          </div>
                          <p className="text-xs text-[#8A93A1] mt-1">{c.snippet}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Human In Loop Decision Card (AG-019) */}
                  {msg.humanInLoopActionRequired && (
                    <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs">
                      <p className="font-bold text-amber-400 mb-1">
                        HUMAN-IN-THE-LOOP APPROVAL REQUIRED (AG-019)
                      </p>
                      <p className="text-[#8A93A1] mb-3">
                        Do you authorize automatic LOTO isolation signal for Valve V-104?
                      </p>
                      <div className="flex gap-2">
                        <Button variant="halo" size="sm" leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                          Approve Action
                        </Button>
                        <Button variant="outline" size="sm" leftIcon={<XCircle className="h-3.5 w-3.5" />}>
                          Reject / Escalate
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Prompt Input Box */}
          <div className="mt-6 pt-4 border-t border-[#22262E] flex gap-3">
            <input
              type="text"
              placeholder="Ask AI Copilot to analyze SOPs, risk factors, or execute safety tools..."
              className="flex-1 px-4 py-3 rounded-lg bg-[#101216] border border-[#22262E] focus:outline-none focus:ring-1 focus:ring-[#06B6D4] text-sm"
            />
            <Button variant="halo" leftIcon={<Send className="h-4 w-4" />}>
              Send
            </Button>
          </div>
        </div>

        {/* Right Hero Orb Surface & State Monitor */}
        <div className="p-6 bg-[#101216] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8A93A1] mb-6">
              AI Orb Engine State
            </h3>

            <div className="flex flex-col items-center py-8">
              <HaloOrb state={orbState} size="hero" />
              <p className="mt-6 text-sm font-mono uppercase tracking-widest text-[#00F0FF]">
                STATE: {orbState}
              </p>
            </div>

            {/* Manual State Switcher */}
            <div className="space-y-2 mt-4">
              <p className="text-xs text-[#8A93A1]">Orb State Controls:</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['IDLE', 'LISTENING', 'THINKING', 'STREAMING', 'CONFIDENT', 'UNCERTAIN', 'ERROR', 'KILLED'] as const).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setOrbState(st)}
                      className={`p-1.5 rounded border text-[10px] font-mono ${
                        orbState === st
                          ? 'border-[#06B6D4] bg-[#06B6D4]/20 text-[#00F0FF]'
                          : 'border-[#22262E] bg-[#181B21] text-[#8A93A1]'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
