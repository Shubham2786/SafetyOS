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
import { AlertOctagon, FileText } from 'lucide-react';

export default function IncidentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockIncidents: Incident[] = [
    {
      id: 'inc-1',
      tenantId: 'tenant-1',
      siteId: 'site-alpha',
      incidentNumber: 'INC-2026-881',
      category: 'NEAR_MISS',
      severity: 'high',
      status: 'UNDER_INVESTIGATION',
      title: 'Unverified Gas Tester Entry near Tank Farm B',
      summary: 'Computer Vision model CV-027 detected unverified worker crossing zone boundary during nitrogen purge.',
      occurredAt: '2026-07-22T08:14:00Z',
      reportedAt: '2026-07-22T08:15:00Z',
      reporterId: 'usr-cv-engine',
      zoneId: 'Zone 4 - Tank Farm',
      attachments: [],
      correctiveActions: [],
      createdAt: '2026-07-22T08:15:00Z',
      updatedAt: '2026-07-22T08:20:00Z',
      createdBy: 'usr-cv-engine',
      updatedBy: 'usr-101',
    },
    {
      id: 'inc-2',
      tenantId: 'tenant-1',
      siteId: 'site-alpha',
      incidentNumber: 'INC-2026-880',
      category: 'FIRST_AID',
      severity: 'medium',
      status: 'REPORTED',
      title: 'Minor Hand Contusion during Pipe Flange Assembly',
      summary: 'Worker sustained minor wrist pinch while positioning 12-inch flange bolts.',
      occurredAt: '2026-07-22T07:30:00Z',
      reportedAt: '2026-07-22T07:45:00Z',
      reporterId: 'usr-204',
      zoneId: 'Zone 2 - Unit 104',
      attachments: [],
      correctiveActions: [],
      createdAt: '2026-07-22T07:45:00Z',
      updatedAt: '2026-07-22T07:45:00Z',
      createdBy: 'usr-204',
      updatedBy: 'usr-204',
    },
    {
      id: 'inc-3',
      tenantId: 'tenant-1',
      siteId: 'site-alpha',
      incidentNumber: 'INC-2026-879',
      category: 'ENVIRONMENTAL_SPILL',
      severity: 'low',
      status: 'ACTION_REQUIRED',
      title: 'Hydraulic Oil Leak on Excavator CAT-340',
      summary: 'Approx 2 liters of hydraulic oil spilled during hose rupture. Absorbent pads applied.',
      occurredAt: '2026-07-22T06:10:00Z',
      reportedAt: '2026-07-22T06:20:00Z',
      reporterId: 'usr-305',
      zoneId: 'Zone 1 - Main Yard',
      attachments: [],
      correctiveActions: [],
      createdAt: '2026-07-22T06:20:00Z',
      updatedAt: '2026-07-22T06:30:00Z',
      createdBy: 'usr-305',
      updatedBy: 'usr-305',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] dark:text-[#E4E7ED]">
            Incidents & Hazard Intelligence
          </h1>
          <p className="text-sm text-[#4B5563] dark:text-[#8A93A1]">
            Real-time incident reporting, edge CV hazard detection stream, and root cause analysis (RCA).
          </p>
        </div>
        <Button variant="destructive" leftIcon={<AlertOctagon className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
          Report New Incident
        </Button>
      </div>

      {/* Incident Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-[#6B7280]">Total Incidents (This Shift)</p>
          <p className="text-3xl font-bold text-[#111827] dark:text-[#E4E7ED] font-mono mt-1">3</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-[#DC2626]">
          <p className="text-xs uppercase tracking-wider text-[#6B7280]">Under Investigation</p>
          <p className="text-3xl font-bold text-[#DC2626] font-mono mt-1">1</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-[#16A34A]">
          <p className="text-xs uppercase tracking-wider text-[#6B7280]">Closed / Verified</p>
          <p className="text-3xl font-bold text-[#16A34A] font-mono mt-1">12</p>
        </Card>
      </div>

      {/* Incidents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Incident & Hazard Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incident #</TableHead>
                <TableHead>Title & Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reported At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockIncidents.map((inc) => (
                <TableRow key={inc.id}>
                  <TableCell className="font-mono text-xs font-semibold text-[#06B6D4]">
                    {inc.incidentNumber}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm text-[#111827] dark:text-[#E4E7ED]">{inc.title}</div>
                    <div className="text-xs text-[#6B7280] line-clamp-1">{inc.summary}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#EEF0F3] dark:bg-[#181B21] text-[#374151] dark:text-[#8A93A1]">
                      {inc.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-medium">{inc.zoneId}</TableCell>
                  <TableCell>
                    <Badge severity={inc.severity as any} dot>
                      {inc.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-600">
                      {inc.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#6B7280]">
                    {new Date(inc.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />}>
                      RCA
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Incident Report Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Report Safety Incident or Hazard"
        description="Log an observed near miss, hazard, or injury. Triggers automated notifications to HSE Manager."
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1 text-[#374151] dark:text-[#8A93A1]">Incident Title</label>
            <input
              type="text"
              placeholder="e.g. Chemical Spill near Valve Block 3"
              className="w-full px-3 py-2 rounded-md bg-[#F6F7F9] dark:bg-[#181B21] border border-[#DDE1E7] dark:border-[#22262E]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-[#374151] dark:text-[#8A93A1]">Category</label>
              <select className="w-full px-3 py-2 rounded-md bg-[#F6F7F9] dark:bg-[#181B21] border border-[#DDE1E7] dark:border-[#22262E]">
                <option value="NEAR_MISS">NEAR MISS</option>
                <option value="FIRST_AID">FIRST AID</option>
                <option value="MEDICAL_TREATMENT">MEDICAL TREATMENT</option>
                <option value="ENVIRONMENTAL_SPILL">ENVIRONMENTAL SPILL</option>
                <option value="FIRE_EXPLOSION">FIRE / EXPLOSION</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1 text-[#374151] dark:text-[#8A93A1]">Severity Level</label>
              <select className="w-full px-3 py-2 rounded-md bg-[#F6F7F9] dark:bg-[#181B21] border border-[#DDE1E7] dark:border-[#22262E]">
                <option value="low">LOW</option>
                <option value="medium">MEDIUM</option>
                <option value="high">HIGH</option>
                <option value="critical">CRITICAL</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1 text-[#374151] dark:text-[#8A93A1]">Detailed Description</label>
            <textarea
              rows={3}
              placeholder="Describe event timeline, equipment involved, immediate corrective actions..."
              className="w-full px-3 py-2 rounded-md bg-[#F6F7F9] dark:bg-[#181B21] border border-[#DDE1E7] dark:border-[#22262E]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setIsModalOpen(false)}>
              Submit Incident Report
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
