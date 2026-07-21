'use client';

import React, { useState } from 'react';
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
  Dialog,
} from '@safetyos/ui';
import { PermitToWork, PermitStatus } from '@safetyos/shared-types';
import { Plus, Search, Filter } from 'lucide-react';

export default function PermitsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  const mockPermits: PermitToWork[] = [
    {
      id: 'ptw-1',
      tenantId: 'tenant-1',
      siteId: 'site-alpha',
      permitNumber: 'PTW-2026-9041',
      type: 'HOT_WORK',
      status: 'ACTIVE',
      title: 'High-Temperature Pipe Flange Welding',
      description: 'Cutting and arc welding on high-pressure steam supply line in Zone 4.',
      zoneId: 'Zone 4 - Tank Farm',
      applicantId: 'usr-101',
      validFrom: '2026-07-22T08:00:00Z',
      validUntil: '2026-07-22T16:00:00Z',
      riskAssessmentId: 'ra-881',
      requiredPPE: ['Welding Helmet', 'Fire-Resistant Gloves', 'Safety Boots'],
      isolationRequired: true,
      lotoId: 'loto-104',
      gasTestingRequired: true,
      signatures: [],
      createdAt: '2026-07-22T07:30:00Z',
      updatedAt: '2026-07-22T08:00:00Z',
      createdBy: 'usr-101',
      updatedBy: 'usr-101',
    },
    {
      id: 'ptw-2',
      tenantId: 'tenant-1',
      siteId: 'site-alpha',
      permitNumber: 'PTW-2026-9042',
      type: 'CONFINED_SPACE',
      status: 'PENDING_APPROVAL',
      title: 'Vessel V-102 Internal Hydro-Jet Cleaning',
      description: 'Internal inspection and jet washing of chemical storage tank V-102.',
      zoneId: 'Zone 2 - Unit 104',
      applicantId: 'usr-102',
      validFrom: '2026-07-22T10:00:00Z',
      validUntil: '2026-07-22T18:00:00Z',
      riskAssessmentId: 'ra-882',
      requiredPPE: ['SCBA Harness', 'Chemical Suit', 'Gas Monitor'],
      isolationRequired: true,
      lotoId: 'loto-105',
      gasTestingRequired: true,
      signatures: [],
      createdAt: '2026-07-22T08:15:00Z',
      updatedAt: '2026-07-22T08:15:00Z',
      createdBy: 'usr-102',
      updatedBy: 'usr-102',
    },
    {
      id: 'ptw-3',
      tenantId: 'tenant-1',
      siteId: 'site-alpha',
      permitNumber: 'PTW-2026-9043',
      type: 'ELECTRICAL_ISOLATION',
      status: 'SUSPENDED',
      title: 'Substation B Transformer Feeder Maintenance',
      description: 'Primary feeder circuit breaker replacement and LOTO tagout.',
      zoneId: 'Zone 1 - Main Substation',
      applicantId: 'usr-103',
      validFrom: '2026-07-22T06:00:00Z',
      validUntil: '2026-07-22T14:00:00Z',
      riskAssessmentId: 'ra-883',
      requiredPPE: ['Arc Flash Suit Class 4', 'Insulated Gloves'],
      isolationRequired: true,
      gasTestingRequired: false,
      signatures: [],
      createdAt: '2026-07-22T05:30:00Z',
      updatedAt: '2026-07-22T09:00:00Z',
      createdBy: 'usr-103',
      updatedBy: 'usr-103',
    },
  ];

  const filteredPermits = filterType === 'ALL'
    ? mockPermits
    : mockPermits.filter(p => p.type === filterType);

  const statusSeverity = (status: PermitStatus) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PENDING_APPROVAL': return 'warning';
      case 'SUSPENDED': return 'high';
      case 'EXPIRED': return 'critical';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#E4E7ED]">
            Permit to Work (PTW) System
          </h1>
          <p className="text-sm text-[#4B5563] dark:text-[#8A93A1]">
            ISO 45001 compliant electronic permit lifecycle, gas testing verification, and isolation tracking.
          </p>
        </div>
        <Button variant="halo" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
          New Permit Application
        </Button>
      </div>

      {/* Filter & Controls Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#6B7280]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4B5563]">Type Filter:</span>
            {['ALL', 'HOT_WORK', 'CONFINED_SPACE', 'ELECTRICAL_ISOLATION'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  filterType === type
                    ? 'bg-[#06B6D4] text-white font-medium'
                    : 'bg-[#F6F7F9] dark:bg-[#181B21] text-[#4B5563] dark:text-[#8A93A1] hover:bg-[#EEF0F3]'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Filter by permit # or title..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-md bg-[#F6F7F9] dark:bg-[#181B21] border border-[#DDE1E7] dark:border-[#22262E] focus:outline-none focus:ring-1 focus:ring-[#06B6D4] w-64"
            />
          </div>
        </div>
      </Card>

      {/* Permits Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active & Pending Permits ({filteredPermits.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permit Number</TableHead>
                <TableHead>Title & Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Verifications</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPermits.map((permit) => (
                <TableRow key={permit.id}>
                  <TableCell className="font-mono text-xs font-semibold text-[#06B6D4]">
                    {permit.permitNumber}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm text-[#111827] dark:text-[#E4E7ED]">{permit.title}</div>
                    <div className="text-xs text-[#6B7280] line-clamp-1">{permit.description}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[#EEF0F3] dark:bg-[#181B21] text-[#374151] dark:text-[#8A93A1]">
                      {permit.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-medium">{permit.zoneId}</TableCell>
                  <TableCell>
                    <Badge severity={statusSeverity(permit.status) as any} dot>
                      {permit.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#6B7280]">
                    {new Date(permit.validUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {permit.isolationRequired && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-medium">LOTO</span>
                      )}
                      {permit.gasTestingRequired && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-medium">GAS</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Permit Application Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Issue New Permit to Work"
        description="Complete high-risk work permit details. Requires supervisor gas test verification."
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1 text-[#374151] dark:text-[#8A93A1]">Work Title</label>
            <input
              type="text"
              placeholder="e.g. Tank V-104 Pipe Cutting"
              className="w-full px-3 py-2 rounded-md bg-[#F6F7F9] dark:bg-[#181B21] border border-[#DDE1E7] dark:border-[#22262E]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-[#374151] dark:text-[#8A93A1]">Permit Category</label>
              <select className="w-full px-3 py-2 rounded-md bg-[#F6F7F9] dark:bg-[#181B21] border border-[#DDE1E7] dark:border-[#22262E]">
                <option value="HOT_WORK">HOT WORK</option>
                <option value="CONFINED_SPACE">CONFINED SPACE</option>
                <option value="ELECTRICAL_ISOLATION">ELECTRICAL ISOLATION</option>
                <option value="HEIGHT_WORK">HEIGHT WORK</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1 text-[#374151] dark:text-[#8A93A1]">Zone Assignment</label>
              <select className="w-full px-3 py-2 rounded-md bg-[#F6F7F9] dark:bg-[#181B21] border border-[#DDE1E7] dark:border-[#22262E]">
                <option value="Zone 4">Zone 4 - Tank Farm</option>
                <option value="Zone 2">Zone 2 - Unit 104</option>
                <option value="Zone 1">Zone 1 - Main Yard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1 text-[#374151] dark:text-[#8A93A1]">Safety Hazards & Mitigation</label>
            <textarea
              rows={3}
              placeholder="Describe hazards, required SCBA, LOTO lockout tags..."
              className="w-full px-3 py-2 rounded-md bg-[#F6F7F9] dark:bg-[#181B21] border border-[#DDE1E7] dark:border-[#22262E]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="halo" onClick={() => setIsModalOpen(false)}>
              Submit for Authorization
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
