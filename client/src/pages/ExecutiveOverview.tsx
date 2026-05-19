// Executive Overview — Screen 0
// Design: "Precision Instrument" Light — for Lead Partners & Business Leads
// Shows all 9 Tax Lines of Service with cross-LOS client intelligence

import { useState } from 'react';
import { Link } from 'wouter';
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, Clock, CheckCircle2,
  Users, Workflow, ChevronRight, BarChart3, Layers, Share2,
  ArrowUpRight, Target, Activity, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AppShell from '@/components/AppShell';
import {
  LINES_OF_SERVICE, CROSS_LOS_CLIENTS, EXECUTIVE_STATS,
  type LineOfService, type CrossLOSClientRow
} from '@/lib/data';
import { toast } from 'sonner';

// ─── LOS Card ─────────────────────────────────────────────────────────────────
function LOSCard({ los, index }: { los: LineOfService; index: number }) {
  const TrendIcon = los.trend === 'up' ? TrendingUp : los.trend === 'down' ? TrendingDown : Minus;
  const trendColor = los.trend === 'up'
    ? 'text-emerald-600'
    : los.trend === 'down'
    ? 'text-red-500'
    : 'text-slate-400';

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg overflow-hidden shadow-sm',
        'hover:shadow-md hover:border-primary/30 transition-all duration-200',
        'animate-fade-slide-up cursor-pointer group'
      )}
      style={{ animationDelay: `${index * 40}ms` }}
      onClick={() => toast.info(`${los.name} — detailed LOS view coming soon`)}
    >
      {/* Card header stripe */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: los.color }}
      />

      {/* Main content */}
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded flex items-center justify-center text-white text-[11px] font-700 shrink-0"
              style={{ backgroundColor: los.color }}
            >
              {los.abbreviation}
            </div>
            <div>
              <div className="text-[13px] font-600 text-foreground leading-tight">{los.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                <span
                  className="w-4 h-4 rounded-full text-white text-[9px] font-600 flex items-center justify-center shrink-0"
                  style={{ backgroundColor: los.color + '99' }}
                >
                  {los.leadPartnerInitials}
                </span>
                {los.leadPartner}
              </div>
            </div>
          </div>
          <div className={cn('flex items-center gap-0.5 text-[11px] font-600', trendColor)}>
            <TrendIcon size={12} />
            <span>{los.trendPct}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-3 line-clamp-2">
          {los.description}
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <div className="tabular-nums text-[15px] font-700 text-foreground">{los.activeClients}</div>
            <div className="text-[10px] text-muted-foreground">Clients</div>
          </div>
          <div className="text-center">
            <div className="tabular-nums text-[15px] font-700 text-foreground">{los.activeWorkflows}</div>
            <div className="text-[10px] text-muted-foreground">Workflows</div>
          </div>
          <div className="text-center">
            <div className={cn(
              'tabular-nums text-[15px] font-700',
              los.atRisk > 0 ? 'text-red-500' : 'text-foreground'
            )}>
              {los.atRisk}
            </div>
            <div className="text-[10px] text-muted-foreground">At Risk</div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-2.5 border-t border-border">
          <div className="flex items-center gap-3">
            {los.pendingReviews > 0 && (
              <div className="flex items-center gap-1 text-[11px] text-amber-600">
                <Clock size={11} />
                <span>{los.pendingReviews} reviews</span>
              </div>
            )}
            {los.upcomingDeadlines > 0 && (
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <AlertTriangle size={11} />
                <span>{los.upcomingDeadlines} deadlines</span>
              </div>
            )}
          </div>
          <div className="tabular-nums text-[12px] font-600 text-foreground">{los.revenueYTD}</div>
        </div>

        {/* Shared data indicator */}
        {los.sharedDataClients.length > 0 && (
          <div className="mt-2 flex items-center gap-1 text-[10px] text-primary/70">
            <Share2 size={10} />
            <span>{los.sharedDataClients.length} shared client{los.sharedDataClients.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Cross-LOS Client Row ─────────────────────────────────────────────────────
function CrossLOSRow({ row, index }: { row: CrossLOSClientRow; index: number }) {
  const LOS_COLORS: Record<string, string> = {
    'TC': '#1B5FD4', 'ICT': '#7C3AED', 'M&A': '#D97706', 'IND': '#0891B2',
    'R&D': '#16A34A', 'US': '#2563EB', 'TP': '#059669', 'PE': '#9333EA', 'LIT': '#DC2626',
  };

  return (
    <tr
      className={cn(
        'border-b border-border hover:bg-secondary/40 transition-colors cursor-pointer',
        'animate-fade-slide-up'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => {
        if (row.clientId === 'northstar') {
          window.location.href = '/client/northstar';
        } else {
          toast.info(`${row.clientName} — client workspace coming soon`);
        }
      }}
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-700 shrink-0"
            style={{ backgroundColor: row.tier === 'Platinum' ? '#7C3AED' : row.tier === 'Strategic' ? '#1B5FD4' : '#64748B' }}
          >
            {row.leadPartnerInitials}
          </div>
          <div>
            <div className="text-[13px] font-600 text-foreground">{row.clientName}</div>
            <div className="text-[11px] text-muted-foreground">{row.leadPartner}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={cn(
          'text-[10px] font-600 px-2 py-0.5 rounded-full',
          row.tier === 'Platinum' ? 'status-platinum' : row.tier === 'Strategic' ? 'status-info' : 'status-pending'
        )}>
          {row.tier}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-wrap gap-1">
          {row.activeLOS.map(los => (
            <span
              key={los}
              className="text-[10px] font-600 px-1.5 py-0.5 rounded text-white"
              style={{ backgroundColor: LOS_COLORS[los] || '#64748B' }}
            >
              {los}
            </span>
          ))}
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-wrap gap-1">
          {row.sharedDataSets.map(ds => (
            <span
              key={ds}
              className="text-[10px] px-1.5 py-0.5 rounded border border-primary/20 bg-primary/5 text-primary/70"
            >
              {ds}
            </span>
          ))}
        </div>
      </td>
      <td className="py-3 px-4 text-center">
        <span className="tabular-nums text-[13px] font-600 text-foreground">{row.totalWorkflows}</span>
      </td>
      <td className="py-3 px-4 text-center">
        {row.atRisk > 0 ? (
          <span className="tabular-nums text-[13px] font-600 text-red-500">{row.atRisk}</span>
        ) : (
          <span className="tabular-nums text-[13px] text-muted-foreground">—</span>
        )}
      </td>
      <td className="py-3 px-4 text-center">
        {row.openReviews > 0 ? (
          <span className="tabular-nums text-[13px] font-600 text-amber-600">{row.openReviews}</span>
        ) : (
          <span className="tabular-nums text-[13px] text-muted-foreground">—</span>
        )}
      </td>
      <td className="py-3 px-4 text-center">
        <span className="text-[12px] text-muted-foreground">{row.nearestDeadline}</span>
      </td>
      <td className="py-3 px-4 text-right">
        <span className="tabular-nums text-[13px] font-600 text-foreground">{row.totalRevenueYTD}</span>
      </td>
      <td className="py-3 px-4">
        <ChevronRight size={14} className="text-muted-foreground ml-auto" />
      </td>
    </tr>
  );
}

// ─── Executive Overview Page ──────────────────────────────────────────────────
export default function ExecutiveOverview() {
  const [losFilter, setLosFilter] = useState<'all' | 'at-risk' | 'active'>('all');

  const filteredLOS = LINES_OF_SERVICE.filter(los => {
    if (losFilter === 'at-risk') return los.atRisk > 0;
    if (losFilter === 'active') return los.activeWorkflows > 0;
    return true;
  });

  const attainmentPct = EXECUTIVE_STATS.revenueAttainment;

  return (
    <AppShell
      breadcrumbs={[{ label: 'Executive Overview' }]}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info('Export executive report — coming soon')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border bg-card text-muted-foreground text-xs hover:border-primary/40 hover:text-foreground transition-colors"
          >
            <BarChart3 size={12} />
            Export
          </button>
        </div>
      }
    >
      <div className="p-6 space-y-6">

        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-700 text-foreground">Tax Line of Service Overview</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Executive view · All Lines of Service · FY 2024–2025 · As of May 18, 2025
            </p>
          </div>
          <Link href="/dashboard">
            <div className="flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer">
              <span>Practitioner Dashboard</span>
              <ArrowUpRight size={12} />
            </div>
          </Link>
        </div>

        {/* AI Executive Summary banner */}
        <div className="bg-primary/5 border border-primary/15 rounded-lg p-4 flex items-start gap-3">
          <div className="w-7 h-7 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles size={14} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-600 text-primary mb-1">AI Executive Summary</div>
            <p className="text-sm text-foreground/80 leading-relaxed">
              <strong>4 deliverables are at risk</strong> across ICT, M&A, and Litigation. Pillar 2 GloBE Assessment (Northstar) has 4 unresolved exceptions due May 31. M&A — Project Cedar (Vantage Capital) is overdue for first-pass review. Revenue attainment is at <strong>{attainmentPct}%</strong> of target with 4 LOS trending above plan. Northstar Holdings is active across <strong>5 LOS</strong> — shared entity list and financial statements are available for cross-team use.
            </p>
          </div>
        </div>

        {/* Executive KPI tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'Total Clients', value: EXECUTIVE_STATS.totalClients, icon: Users, color: 'text-primary', accent: 'card-accent-blue' },
            { label: 'Active LOS', value: EXECUTIVE_STATS.activeLOSEngagements, icon: Layers, color: 'text-violet-600', accent: 'card-accent-purple' },
            { label: 'Active Workflows', value: EXECUTIVE_STATS.totalActiveWorkflows, icon: Workflow, color: 'text-primary', accent: 'card-accent-blue' },
            { label: 'Pending Reviews', value: EXECUTIVE_STATS.pendingReviews, icon: Clock, color: 'text-amber-600', accent: 'card-accent-amber' },
            { label: 'At Risk', value: EXECUTIVE_STATS.atRiskDeliverables, icon: AlertTriangle, color: 'text-red-500', accent: 'card-accent-red' },
            { label: 'Cross-LOS Clients', value: EXECUTIVE_STATS.crossLOSClients, icon: Share2, color: 'text-emerald-600', accent: 'card-accent-green' },
            { label: 'Completed MTD', value: 5, icon: CheckCircle2, color: 'text-emerald-600', accent: 'card-accent-green' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={cn('bg-card border border-border rounded-lg p-3 shadow-sm animate-fade-slide-up', stat.accent)}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <stat.icon size={15} className={cn('mb-2', stat.color)} />
              <div className={cn('tabular-nums text-2xl font-700', stat.color)}>{stat.value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Revenue attainment bar */}
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target size={14} className="text-primary" />
              <span className="text-sm font-600 text-foreground">Revenue Attainment YTD</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="tabular-nums font-700 text-foreground">{EXECUTIVE_STATS.totalRevenueYTD}</span>
              <span className="text-muted-foreground">of</span>
              <span className="tabular-nums font-600 text-muted-foreground">{EXECUTIVE_STATS.revenueTarget}</span>
              <span className={cn(
                'text-xs font-600 px-2 py-0.5 rounded-full',
                attainmentPct >= 80 ? 'status-approved' : attainmentPct >= 60 ? 'status-warning' : 'status-error'
              )}>
                {attainmentPct}%
              </span>
            </div>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${attainmentPct}%`, backgroundColor: '#1B5FD4' }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            {LINES_OF_SERVICE.map(los => (
              <div key={los.id} className="flex flex-col items-center gap-0.5" title={`${los.name}: ${los.revenueYTD}`}>
                <div
                  className="w-1 h-3 rounded-full opacity-70"
                  style={{ backgroundColor: los.color }}
                />
                <span className="text-[9px] text-muted-foreground">{los.abbreviation}</span>
              </div>
            ))}
          </div>
        </div>

        {/* LOS Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-foreground" />
              <h2 className="text-sm font-600 text-foreground">Lines of Service</h2>
              <span className="text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {LINES_OF_SERVICE.length} LOS
              </span>
            </div>
            <div className="flex items-center gap-1">
              {(['all', 'at-risk', 'active'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setLosFilter(f)}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded transition-colors',
                    losFilter === f
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  {f === 'all' ? 'All' : f === 'at-risk' ? 'At Risk' : 'Active'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            {filteredLOS.map((los, i) => (
              <LOSCard key={los.id} los={los} index={i} />
            ))}
          </div>
        </div>

        {/* Cross-LOS Client Intelligence */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Share2 size={15} className="text-foreground" />
              <h2 className="text-sm font-600 text-foreground">Cross-LOS Client Intelligence</h2>
              <span className="text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                Shared data & context across teams
              </span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="workpaper-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Tier</th>
                    <th>Active LOS</th>
                    <th>Shared Data Sets</th>
                    <th className="text-center">Workflows</th>
                    <th className="text-center">At Risk</th>
                    <th className="text-center">Reviews</th>
                    <th className="text-center">Next Deadline</th>
                    <th className="text-right">Revenue YTD</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {CROSS_LOS_CLIENTS.map((row, i) => (
                    <CrossLOSRow key={row.clientId} row={row} index={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shared data note */}
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Share2 size={11} />
            <span>
              Shared data sets (entity lists, financial statements, org charts) are available to all LOS teams serving the same client — reducing duplicate data collection and improving consistency.
            </span>
          </div>
        </div>

        {/* Active Deliverables by Tax Team */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={15} className="text-foreground" />
            <h2 className="text-sm font-600 text-foreground">Active Deliverables by Line of Service</h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
            {LINES_OF_SERVICE.map((los, i) => (
              <div
                key={los.id}
                className="bg-card border border-border rounded-lg p-3 text-center shadow-sm animate-fade-slide-up hover:shadow-md transition-shadow cursor-pointer"
                style={{ animationDelay: `${i * 30}ms` }}
                onClick={() => toast.info(`${los.name} deliverables — coming soon`)}
              >
                <div
                  className="w-8 h-8 rounded mx-auto mb-2 flex items-center justify-center text-white text-[10px] font-700"
                  style={{ backgroundColor: los.color }}
                >
                  {los.abbreviation}
                </div>
                <div className="tabular-nums text-lg font-700 text-foreground">{los.activeWorkflows}</div>
                <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                  {los.name.split(' ').slice(0, 2).join(' ')}
                </div>
                {los.atRisk > 0 && (
                  <div className="mt-1.5 text-[10px] font-600 text-red-500 flex items-center justify-center gap-0.5">
                    <AlertTriangle size={9} />
                    {los.atRisk} at risk
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
