'use client';

import React from 'react';
import {
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@safetyos/ui';
import { Lock, CheckCircle2, Key } from 'lucide-react';

export default function LOTOPage() {
  const isolationPoints = [
    {
      id: 'iso-1',
      seq: 1,
      device: 'Main Steam Supply Breaker V-101',
      type: 'MECHANICAL',
      tag: 'TAG-8801',
      padlock: 'PAD-401',
      applied: true,
      verified: true,
    },
    {
      id: 'iso-2',
      seq: 2,
      device: 'High Pressure Feed Pump P-402 Electrical Switch',
      type: 'ELECTRICAL',
      tag: 'TAG-8802',
      padlock: 'PAD-402',
      applied: true,
      verified: true,
    },
    {
      id: 'iso-3',
      seq: 3,
      device: 'Nitrogen Purge Inlet Bleed Valve V-104',
      type: 'PNEUMATIC',
      tag: 'TAG-8803',
      padlock: 'PAD-403',
      applied: true,
      verified: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#E4E7ED]">
            Lockout / Tagout (LOTO) Control Panel
          </h1>
          <p className="text-sm text-[#4B5563] dark:text-[#8A93A1]">
            Zero-energy state verification, isolation point checklists, and group lockbox management.
          </p>
        </div>
        <Button variant="halo" leftIcon={<Key className="h-4 w-4" />}>
          Verify Group Lockbox
        </Button>
      </div>

      {/* Zero Energy Status Card */}
      <Card className="border-l-4 border-l-[#F59E0B] p-5">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B] shrink-0">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-[#111827] dark:text-[#E4E7ED]">
                Active Procedure: LOTO-2026-042 (Unit 104 Boiler Feeder)
              </h3>
              <Badge severity="warning" dot>
                ISOLATION IN PROGRESS
              </Badge>
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              2 of 3 isolation points verified zero energy state. Final pneumatic bleed valve inspection required.
            </p>
          </div>
        </div>
      </Card>

      {/* Isolation Point Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Isolation Points Sequence Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seq #</TableHead>
                <TableHead>Equipment & Device Description</TableHead>
                <TableHead>Energy Type</TableHead>
                <TableHead>Tag #</TableHead>
                <TableHead>Padlock ID</TableHead>
                <TableHead>Tag Status</TableHead>
                <TableHead>Zero Energy Verification</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isolationPoints.map((pt) => (
                <TableRow key={pt.id}>
                  <TableCell className="font-mono text-xs font-bold text-center">
                    {pt.seq}
                  </TableCell>
                  <TableCell className="font-medium text-sm text-[#111827] dark:text-[#E4E7ED]">
                    {pt.device}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#EEF0F3] dark:bg-[#181B21] text-[#374151]">
                      {pt.type}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-[#06B6D4]">
                    {pt.tag}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{pt.padlock}</TableCell>
                  <TableCell>
                    {pt.applied ? (
                      <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> APPLIED
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">PENDING</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {pt.verified ? (
                      <Badge severity="success">VERIFIED</Badge>
                    ) : (
                      <Badge severity="warning">PENDING TEST</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      {pt.verified ? 'Re-inspect' : 'Verify State'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
