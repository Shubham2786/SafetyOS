'use client';

import React from 'react';
import {
  KPICard,
  Alert,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@safetyos/ui';
import { AlertOctagon, FileCheck2, Lock, TrendingUp, ShieldAlert, Plus, Zap } from 'lucide-react';

export default function CommandConsolePage() {
  const incidents = [
    {
      id: 'INC-2026-881',
      category: 'NEAR_MISS',
      severity: 'high',
      title: 'Unverified Gas Tester Entry near Tank Farm B',
      zone: 'Zone 4 - Tank Farm',
      time: '12 mins ago',
      status: 'UNDER_INVESTIGATION',
    },
    {
      id: 'INC-2026-880',
      category: 'FIRST_AID',
      severity: 'medium',
      title: 'Minor Hand Contusion during Pipe Flange Assembly',
      zone: 'Zone 2 - Unit 104',
      time: '45 mins ago',
      status: 'REPORTED',
    },
    {
      id: 'INC-2026-879',
      category: 'HAZARD',
      severity: 'low',
      title: 'Hydraulic Oil Leak on Excavator CAT-340',
      zone: 'Zone 1 - Main Yard',
      time: '2 hours ago',
      status: 'ACTION_REQUIRED',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#E4E7ED]">
            Plant Command Console
          </h1>
          <p className="text-sm text-[#4B5563] dark:text-[#8A93A1]">
            Real-time industrial safety telemetry, active permits, and compound risk intelligence.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" leftIcon={<Plus className="h-4 w-4" />}>
            Report Hazard
          </Button>
          <Button variant="halo" leftIcon={<Zap className="h-4 w-4" />}>
            Issue PTW
          </Button>
        </div>
      </div>

      {/* Critical Alert Bar (ISA-101) */}
      <Alert
        severity="critical"
        title="CRITICAL SAFETY ALERT: Gas Excursion Detected"
      >
        Zone 4 Tank Farm sensors registered 18.5% O2 levels. Automatic ventilation override sequence triggered. All field personnel must verify SCBA gear.
      </Alert>

      {/* Hero KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Permits (PTW)"
          value={42}
          unit="Permits"
          trend="up"
          changePercentage={8}
          subtitle="14 Hot Work active"
        />
        <KPICard
          title="Compound Risk Index"
          value="68.4"
          unit="/ 100"
          trend="up"
          changePercentage={12}
          status="warning"
          subtitle="Elevated in Zone 4"
        />
        <KPICard
          title="Active LOTO Isolations"
          value={18}
          unit="Isolated"
          trend="neutral"
          subtitle="Zero Energy verified"
        />
        <KPICard
          title="Open Incidents"
          value={3}
          unit="Active"
          trend="down"
          changePercentage={25}
          subtitle="1 Under Investigation"
        />
      </div>

      {/* Live Incidents & Hazards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Incidents & Hazards</CardTitle>
              <p className="text-xs text-[#6B7280]">Real-time stream from edge CV and worker reports</p>
            </div>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Incident ID</TableHead>
                  <TableHead>Title & Summary</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs font-medium text-[#06B6D4]">
                      {row.id}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{row.title}</div>
                      <div className="text-xs text-[#6B7280]">{row.category}</div>
                    </TableCell>
                    <TableCell className="text-xs">{row.zone}</TableCell>
                    <TableCell>
                      <Badge severity={row.severity as any} dot>
                        {row.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-[#6B7280]">{row.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Operations Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Safety Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start text-left" leftIcon={<FileCheck2 className="h-4 w-4 text-[#06B6D4]" />}>
              Issue Hot Work Permit
            </Button>
            <Button variant="outline" className="w-full justify-start text-left" leftIcon={<Lock className="h-4 w-4 text-[#F59E0B]" />}>
              Verify Group LOTO Lockbox
            </Button>
            <Button variant="outline" className="w-full justify-start text-left" leftIcon={<ShieldAlert className="h-4 w-4 text-[#EC4899]" />}>
              Trigger Zone Muster Alarm
            </Button>
            <Button variant="destructive" className="w-full justify-start text-left" leftIcon={<AlertOctagon className="h-4 w-4" />}>
              Declare Emergency SOS
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
