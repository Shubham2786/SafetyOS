'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@safetyos/ui';
import { Layers, Cpu } from 'lucide-react';

export default function DigitalTwinPage() {
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [activeLayer, setActiveLayer] = useState<'RISK' | 'WORKERS' | 'CAMERAS'>('RISK');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#E4E7ED]">
            Digital Twin & Geospatial Telemetry
          </h1>
          <p className="text-sm text-[#4B5563] dark:text-[#8A93A1]">
            Real-time 2D/3D plant visualization, risk heatmaps, edge camera overlays, and live worker tracking.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#F6F7F9] dark:bg-[#181B21] p-1 rounded-lg border border-[#DDE1E7] dark:border-[#22262E]">
          <button
            onClick={() => setViewMode('2D')}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === '2D' ? 'bg-[#06B6D4] text-white shadow-sm' : 'text-[#6B7280]'
            }`}
          >
            2D Map View
          </button>
          <button
            onClick={() => setViewMode('3D')}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === '3D' ? 'bg-[#06B6D4] text-white shadow-sm' : 'text-[#6B7280]'
            }`}
          >
            3D Spatial View
          </button>
        </div>
      </div>

      {/* Main Digital Twin Surface Viewport */}
      <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-[#DDE1E7] dark:border-[#22262E] bg-[#0A0B0D] flex flex-col justify-between p-4 shadow-2xl">
        {/* Layer Controls Bar */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2 bg-[#101216]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#22262E]">
            <Layers className="h-4 w-4 text-[#06B6D4]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8A93A1]">Overlays:</span>
            {(['RISK', 'WORKERS', 'CAMERAS'] as const).map((layer) => (
              <button
                key={layer}
                onClick={() => setActiveLayer(layer)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  activeLayer === layer
                    ? 'bg-[#06B6D4]/20 text-[#00F0FF] border border-[#06B6D4]/40 font-medium'
                    : 'text-[#8A93A1] hover:text-white'
                }`}
              >
                {layer}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Badge severity="success" dot>
              LIVE TELEMETRY: 60 FPS
            </Badge>
          </div>
        </div>

        {/* 2D/3D Visualizer Mock Surface */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
          <div className="relative w-full h-full bg-[radial-gradient(#06B6D4_1px,transparent_1px)] [background-size:24px_24px] flex items-center justify-center">
            <div className="w-96 h-96 rounded-full border-2 border-dashed border-[#06B6D4]/40 animate-spin-slow flex items-center justify-center">
              <Cpu className="h-16 w-16 text-[#06B6D4]/60" />
            </div>
          </div>
        </div>

        {/* Floating Plant Zones Overlay */}
        <div className="z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
          <div className="p-3 rounded-lg bg-[#101216]/90 backdrop-blur-md border border-[#22262E] text-xs">
            <p className="font-bold text-[#E4E7ED]">Zone 1 - Main Yard</p>
            <p className="text-[11px] text-[#8A93A1] mt-0.5">Risk Score: 12 (Nominal)</p>
            <Badge severity="success" className="mt-2 text-[10px]">Normal</Badge>
          </div>
          <div className="p-3 rounded-lg bg-[#101216]/90 backdrop-blur-md border border-[#22262E] text-xs">
            <p className="font-bold text-[#E4E7ED]">Zone 2 - Unit 104</p>
            <p className="text-[11px] text-[#8A93A1] mt-0.5">Risk Score: 45 (Moderate)</p>
            <Badge severity="warning" className="mt-2 text-[10px]">Elevated</Badge>
          </div>
          <div className="p-3 rounded-lg bg-[#101216]/90 backdrop-blur-md border-2 border-[#DC2626] text-xs">
            <p className="font-bold text-white">Zone 4 - Tank Farm</p>
            <p className="text-[11px] text-red-300 mt-0.5">Risk Score: 88.4 (High)</p>
            <Badge severity="critical" className="mt-2 text-[10px]">Gas Alert</Badge>
          </div>
          <div className="p-3 rounded-lg bg-[#101216]/90 backdrop-blur-md border border-[#22262E] text-xs">
            <p className="font-bold text-[#E4E7ED]">Zone 5 - Substation</p>
            <p className="text-[11px] text-[#8A93A1] mt-0.5">Risk Score: 05 (Nominal)</p>
            <Badge severity="success" className="mt-2 text-[10px]">Normal</Badge>
          </div>
        </div>

        {/* Viewport Footer Information */}
        <div className="z-10 flex items-center justify-between text-xs text-[#8A93A1] bg-[#101216]/80 backdrop-blur-md px-4 py-2 rounded-lg border border-[#22262E]">
          <span>Active Edge Cameras: 12 Connected</span>
          <span>Workers In Zone 4: 8 Active (2 SCBA verified)</span>
          <span>Coordinates: 18°55'12" N, 72°50'34" E</span>
        </div>
      </div>
    </div>
  );
}
