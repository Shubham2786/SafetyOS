'use client';

import React from 'react';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@safetyos/ui';
import { Building2, Shield, FileCode2, Plus } from 'lucide-react';

export default function AdminPortalPage() {
  const tenants = [
    {
      id: 't-1',
      name: 'Global Refineries Inc.',
      code: 'GLOBAL_REF',
      sites: 4,
      status: 'ACTIVE',
      dataResidency: 'US-East (AWS)',
    },
    {
      id: 't-2',
      name: 'Apex Chemical Processors',
      code: 'APEX_CHEM',
      sites: 2,
      status: 'ACTIVE',
      dataResidency: 'EU-Frankfurt (GCP)',
    },
    {
      id: 't-3',
      name: 'Titan Steel Works',
      code: 'TITAN_STL',
      sites: 1,
      status: 'PROVISIONING',
      dataResidency: 'AP-South (AWS)',
    },
  ];

  const opaPolicies = [
    {
      id: 'pol-1',
      name: 'ptw.authorization.hot_work',
      scope: 'Global',
      status: 'ENFORCED',
      lastUpdated: '2 hours ago',
    },
    {
      id: 'pol-2',
      name: 'loto.verification.dual_sign',
      scope: 'Global',
      status: 'ENFORCED',
      lastUpdated: '1 day ago',
    },
    {
      id: 'pol-[#pol-3]',
      name: 'ai.copilot.kill_switch',
      scope: 'Global',
      status: 'ACTIVE_MONITORING',
      lastUpdated: '3 mins ago',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#E4E7ED] p-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#22262E] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-[#06B6D4]" />
            <h1 className="text-2xl font-bold tracking-tight">Platform Administration & Security Console</h1>
          </div>
          <p className="text-sm text-[#8A93A1] mt-1">
            Tenant provisioning (PLT-001), Open Policy Agent (OPA) management, and CISO audit controls.
          </p>
        </div>
        <Button variant="halo" leftIcon={<Plus className="h-4 w-4" />}>
          Provision New Tenant
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#101216] border-[#22262E]">
          <p className="text-xs uppercase tracking-wider text-[#8A93A1]">Active Tenants</p>
          <p className="text-3xl font-bold text-[#E4E7ED] font-mono mt-1">3</p>
        </Card>
        <Card className="p-4 bg-[#101216] border-[#22262E]">
          <p className="text-xs uppercase tracking-wider text-[#8A93A1]">Total Plant Sites</p>
          <p className="text-3xl font-bold text-[#06B6D4] font-mono mt-1">7</p>
        </Card>
        <Card className="p-4 bg-[#101216] border-[#22262E]">
          <p className="text-xs uppercase tracking-wider text-[#8A93A1]">OPA Rego Policies</p>
          <p className="text-3xl font-bold text-[#10B981] font-mono mt-1">42</p>
        </Card>
        <Card className="p-4 bg-[#101216] border-[#22262E]">
          <p className="text-xs uppercase tracking-wider text-[#8A93A1]">WORM Audit Logs</p>
          <p className="text-3xl font-bold text-[#E4E7ED] font-mono mt-1">1.4M</p>
        </Card>
      </div>

      {/* Multi-Tenant Provisioning Table */}
      <Card className="bg-[#101216] border-[#22262E]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#06B6D4]" />
            Tenant Organizations & Data Residency (PLT-001)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#22262E]">
                <TableHead>Tenant Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Sites Count</TableHead>
                <TableHead>Data Residency Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((t) => (
                <TableRow key={t.id} className="border-[#181B21]">
                  <TableCell className="font-semibold text-sm text-[#E4E7ED]">{t.name}</TableCell>
                  <TableCell className="font-mono text-xs text-[#06B6D4]">{t.code}</TableCell>
                  <TableCell className="font-mono text-xs">{t.sites} Sites</TableCell>
                  <TableCell className="text-xs text-[#8A93A1]">{t.dataResidency}</TableCell>
                  <TableCell>
                    <Badge severity={t.status === 'ACTIVE' ? 'success' : 'warning'} dot>
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Configure
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* OPA Policy Rules Panel */}
      <Card className="bg-[#101216] border-[#22262E]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileCode2 className="h-4 w-4 text-[#10B981]" />
            Open Policy Agent (OPA) RBAC+ABAC Security Rules (WFP-003)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#22262E]">
                <TableHead>Policy Identifier</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Enforcement Status</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opaPolicies.map((pol) => (
                <TableRow key={pol.id} className="border-[#181B21]">
                  <TableCell className="font-mono text-xs font-medium text-[#00F0FF]">
                    {pol.name}
                  </TableCell>
                  <TableCell className="text-xs">{pol.scope}</TableCell>
                  <TableCell>
                    <Badge severity="success">{pol.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-[#8A93A1]">{pol.lastUpdated}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Edit Rego
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
