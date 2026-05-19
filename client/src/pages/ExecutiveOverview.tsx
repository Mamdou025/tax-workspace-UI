// Tax Business Unit Overview — Screen 0
// Design: Control-tower org-chart. Grayscale + deep navy (#0F2044) palette.
// Audience: Lead Partners & Business Leads — strategic, calm, uncluttered.
// LOS nodes in a hub-and-spoke layout; hover reveals deliverable detail panel.

import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, Target,
  Share2, ArrowUpRight, Sparkles, ChevronRight, Users, Workflow,
  FileText, CheckCircle2, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AppShell from '@/components/AppShell';
import {
  LINES_OF_SERVICE, CROSS_LOS_CLIENTS, EXECUTIVE_STATS,
  type LineOfService, type CrossLOSClientRow
} from '@/lib/data';
import { toast } from 'sonner';

// ─── Palette — strictly grayscale + deep blue ─────────────────────────────────
// Deep navy: #0F2044  Mid-blue: #1B5FD4  Steel: #4A6080
// Slate-50: #F8FAFC   Slate-100: #F1F5F9  Slate-200: #E2E8F0
// Slate-400: #94A3B8  Slate-600: #475569  Slate-800: #1E293B
// All LOS nodes use the same deep-navy; only status indicators use muted tones.

// ─── LOS Node — compact pill for the org-chart ───────────────────────────────
function LOSNode({
  los,
  isHovered,
  onHover,
  onLeave,
}: {
  los: LineOfService;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const TrendIcon = los.trend === 'up' ? TrendingUp : los.trend === 'down' ? TrendingDown : Minus;
  const hasRisk = los.atRisk > 0;

  return (
    <div
      className={cn(
        'relative flex flex-col items-center gap-1.5 cursor-pointer select-none',
        'transition-transform duration-150',
        isHovered && 'scale-105'
      )}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={() => toast.info(`${los.name} — detailed LOS view coming soon`)}
    >
      {/* Node circle */}
      <div
        className={cn(
          'w-14 h-14 rounded-full flex flex-col items-center justify-center',
          'border-2 transition-all duration-150',
          'shadow-sm',
          isHovered
            ? 'bg-[#0F2044] border-[#1B5FD4] shadow-[0_0_0_3px_rgba(27,95,212,0.15)]'
            : hasRisk
            ? 'bg-[#1E293B] border-slate-400/60'
            : 'bg-[#1E293B] border-slate-600/40'
        )}
      >
        <span className="text-[11px] font-700 text-white leading-none">{los.abbreviation}</span>
        {hasRisk && (
          <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-slate-300/70" />
        )}
      </div>

      {/* Label below node */}
      <div className="text-center">
        <div className="text-[10px] font-600 text-slate-700 leading-tight max-w-[72px] text-center">
          {los.name.split(' ').slice(0, 2).join(' ')}
        </div>
        <div className={cn(
          'flex items-center justify-center gap-0.5 text-[9px] font-500 mt-0.5',
          los.trend === 'up' ? 'text-slate-500' : los.trend === 'down' ? 'text-slate-500' : 'text-slate-400'
        )}>
          <TrendIcon size={8} />
          <span>{los.trendPct}</span>
        </div>
      </div>
    </div>
  );
}

// ─── LOS Hover Panel ──────────────────────────────────────────────────────────
function LOSHoverPanel({ los, onClose }: { los: LineOfService; onClose: () => void }) {
  return (
    <div
      className={cn(
        'absolute z-50 w-72 bg-white border border-slate-200 rounded-lg shadow-xl',
        'animate-fade-slide-up p-4'
      )}
      onMouseEnter={() => {}} // keep open when hovering panel
      onMouseLeave={onClose}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-6 h-6 rounded bg-[#0F2044] flex items-center justify-center">
              <span className="text-[9px] font-700 text-white">{los.abbreviation}</span>
            </div>
            <span className="text-sm font-700 text-slate-800">{los.name}</span>
          </div>
          <div className="text-[11px] text-slate-500 pl-8">{los.leadPartner}</div>
        </div>
        <span className={cn(
          'text-[10px] font-600 px-1.5 py-0.5 rounded',
          los.trend === 'up' ? 'bg-slate-100 text-slate-600' : los.trend === 'down' ? 'bg-slate-100 text-slate-500' : 'bg-slate-100 text-slate-400'
        )}>
          {los.trendPct} YTD
        </span>
      </div>

      {/* Description */}
      <p className="text-[11px] text-slate-500 leading-relaxed mb-3 border-b border-slate-100 pb-3">
        {los.description}
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-slate-50 rounded">
          <div className="tabular-nums text-base font-700 text-[#0F2044]">{los.activeClients}</div>
          <div className="text-[9px] text-slate-400 uppercase tracking-wide mt-0.5">Clients</div>
        </div>
        <div className="text-center p-2 bg-slate-50 rounded">
          <div className="tabular-nums text-base font-700 text-[#0F2044]">{los.activeWorkflows}</div>
          <div className="text-[9px] text-slate-400 uppercase tracking-wide mt-0.5">Workflows</div>
        </div>
        <div className="text-center p-2 bg-slate-50 rounded">
          <div className={cn('tabular-nums text-base font-700', los.atRisk > 0 ? 'text-slate-600' : 'text-[#0F2044]')}>
            {los.atRisk > 0 ? `${los.atRisk} ⚠` : '—'}
          </div>
          <div className="text-[9px] text-slate-400 uppercase tracking-wide mt-0.5">At Risk</div>
        </div>
      </div>

      {/* Key deliverables */}
      <div className="mb-3">
        <div className="text-[9px] font-600 text-slate-400 uppercase tracking-wider mb-1.5">Key Deliverables</div>
        <div className="space-y-1">
          {los.keyDeliverables.slice(0, 3).map(d => (
            <div key={d} className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <FileText size={9} className="text-slate-400 shrink-0" />
              {d}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
        <div className="flex items-center gap-3">
          {los.pendingReviews > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <Clock size={9} />
              {los.pendingReviews} reviews
            </div>
          )}
          {los.upcomingDeadlines > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <AlertTriangle size={9} />
              {los.upcomingDeadlines} deadlines
            </div>
          )}
        </div>
        <span className="tabular-nums text-[11px] font-700 text-[#0F2044]">{los.revenueYTD}</span>
      </div>
    </div>
  );
}

// ─── Control Tower — hub-and-spoke org chart ─────────────────────────────────
function ControlTower() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const hoveredLOS = LINES_OF_SERVICE.find(l => l.id === hoveredId) ?? null;

  function handleHover(id: string) {
    setHoveredId(id);
    const node = nodeRefs.current[id];
    const container = containerRef.current;
    if (node && container) {
      const nr = node.getBoundingClientRect();
      const cr = container.getBoundingClientRect();
      // Position panel to the right of the node, or flip left if near right edge
      let left = nr.right - cr.left + 12;
      let top = nr.top - cr.top - 20;
      if (left + 288 > cr.width) left = nr.left - cr.left - 300;
      if (top + 280 > cr.height) top = cr.height - 290;
      if (top < 0) top = 0;
      setPanelPos({ top, left });
    }
  }

  function handleLeave() {
    setHoveredId(null);
    setPanelPos(null);
  }

  // Layout: 3 rows — top 3, middle 3, bottom 3 — with a central hub
  const rows = [
    LINES_OF_SERVICE.slice(0, 3),
    LINES_OF_SERVICE.slice(3, 6),
    LINES_OF_SERVICE.slice(6, 9),
  ];

  return (
    <div ref={containerRef} className="relative w-full">
      {/* SVG connector lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
        aria-hidden
      >
        <defs>
          <marker id="arrow" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
            <circle cx="2" cy="2" r="1.2" fill="#CBD5E1" />
          </marker>
        </defs>
        {/* Horizontal connectors within each row */}
        {/* These are decorative — actual layout is CSS flex */}
      </svg>

      {/* Org-chart rows */}
      <div className="relative z-10 space-y-0">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex items-center justify-center">
            {/* Row nodes */}
            <div className="flex items-start justify-center gap-8 md:gap-12 lg:gap-16 py-4">
              {row.map((los, nodeIdx) => (
                <div key={los.id} className="flex flex-col items-center">
                  {/* Vertical connector line going up (except top row) */}
                  {rowIdx > 0 && nodeIdx === 1 && (
                    <div className="w-px h-4 bg-slate-200 -mt-4 mb-0" />
                  )}

                  <div
                    ref={el => { nodeRefs.current[los.id] = el; }}
                  >
                    <LOSNode
                      los={los}
                      isHovered={hoveredId === los.id}
                      onHover={() => handleHover(los.id)}
                      onLeave={handleLeave}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Horizontal connector line between rows */}
            {rowIdx < rows.length - 1 && (
              <div className="absolute left-1/2 -translate-x-1/2" style={{ top: `${(rowIdx + 1) * 108 - 8}px`, width: '60%' }}>
                <div className="h-px bg-slate-200 w-full" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hover panel */}
      {hoveredLOS && panelPos && (
        <div
          className="absolute"
          style={{ top: panelPos.top, left: panelPos.left, zIndex: 100 }}
          onMouseEnter={() => setHoveredId(hoveredId)}
          onMouseLeave={handleLeave}
        >
          <LOSHoverPanel los={hoveredLOS} onClose={handleLeave} />
        </div>
      )}
    </div>
  );
}

// ─── Cross-LOS Client Row ─────────────────────────────────────────────────────
function CrossLOSRow({ row, index }: { row: CrossLOSClientRow; index: number }) {
  return (
    <tr
      className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer animate-fade-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => {
        if (row.clientId === 'northstar') {
          window.location.href = '/client/northstar';
        } else {
          toast.info(`${row.clientName} — client workspace coming soon`);
        }
      }}
    >
      {/* Client */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#0F2044] flex items-center justify-center text-white text-[10px] font-700 shrink-0">
            {row.leadPartnerInitials}
          </div>
          <div>
            <div className="text-[13px] font-600 text-slate-800">{row.clientName}</div>
            <div className="text-[11px] text-slate-400">{row.leadPartner}</div>
          </div>
        </div>
      </td>

      {/* Tier */}
      <td className="py-3 px-4">
        <span className="text-[10px] font-600 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          {row.tier}
        </span>
      </td>

      {/* Active LOS — grayscale pills */}
      <td className="py-3 px-4">
        <div className="flex flex-wrap gap-1">
          {row.activeLOS.map(los => (
            <span
              key={los}
              className="text-[10px] font-600 px-1.5 py-0.5 rounded bg-[#0F2044] text-white"
            >
              {los}
            </span>
          ))}
        </div>
      </td>

      {/* Shared data sets */}
      <td className="py-3 px-4">
        <div className="flex flex-wrap gap-1">
          {row.sharedDataSets.map(ds => (
            <span
              key={ds}
              className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-500"
            >
              {ds}
            </span>
          ))}
        </div>
      </td>

      {/* Revenue YTD */}
      <td className="py-3 px-4 text-right">
        <span className="tabular-nums text-[13px] font-600 text-slate-800">{row.totalRevenueYTD}</span>
      </td>

      {/* Navigate */}
      <td className="py-3 px-4">
        <ChevronRight size={14} className="text-slate-300 ml-auto" />
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ExecutiveOverview() {
  const attainmentPct = EXECUTIVE_STATS.revenueAttainment;

  return (
    <AppShell
      breadcrumbs={[{ label: 'Tax BU Overview' }]}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info('Export executive report — coming soon')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 bg-white text-slate-500 text-xs hover:border-slate-300 hover:text-slate-700 transition-colors"
          >
            Export
          </button>
        </div>
      }
    >
      <div className="p-6 space-y-7 max-w-[1200px]">

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-700 text-[#0F2044]">Tax Business Unit Overview</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Executive view · All Lines of Service · FY 2024–2025 · As of May 18, 2025
            </p>
          </div>
          <Link href="/dashboard">
            <div className="flex items-center gap-1.5 text-xs text-[#1B5FD4] hover:underline cursor-pointer">
              <span>Practitioner Dashboard</span>
              <ArrowUpRight size={12} />
            </div>
          </Link>
        </div>

        {/* ── AI Executive Summary ─────────────────────────────────────────── */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3">
          <div className="w-7 h-7 rounded bg-[#0F2044]/8 border border-[#0F2044]/12 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles size={13} className="text-[#1B5FD4]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-600 text-[#1B5FD4] mb-1 uppercase tracking-wider">AI Executive Summary</div>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong className="text-slate-800">4 deliverables are at risk</strong> across ICT, M&A, and Litigation. Pillar 2 GloBE Assessment (Northstar) has 4 unresolved exceptions due May 31. M&A — Project Cedar (Vantage Capital) is overdue for first-pass review. Revenue attainment is at <strong className="text-slate-800">{attainmentPct}%</strong> of target with 4 LOS trending above plan. Northstar Holdings is active across <strong className="text-slate-800">5 LOS</strong> — shared entity list and financial statements are available for cross-team use.
            </p>
          </div>
        </div>

        {/* ── Executive KPIs — only 3 top-level metrics ────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: 'Total Clients',
              value: EXECUTIVE_STATS.totalClients,
              sub: 'Under active engagement',
              icon: Users,
            },
            {
              label: 'Active Workflows',
              value: EXECUTIVE_STATS.totalActiveWorkflows,
              sub: 'Across all LOS',
              icon: Workflow,
            },
            {
              label: 'Revenue YTD',
              value: EXECUTIVE_STATS.totalRevenueYTD,
              sub: `${attainmentPct}% of ${EXECUTIVE_STATS.revenueTarget} target`,
              icon: Target,
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm animate-fade-slide-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <stat.icon size={14} className="text-slate-400" />
                <span className="text-[11px] font-600 text-slate-400 uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className="tabular-nums text-2xl font-700 text-[#0F2044]">{stat.value}</div>
              <div className="text-[11px] text-slate-400 mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Revenue attainment bar ───────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-600 text-slate-400 uppercase tracking-wider">Revenue Attainment by LOS</span>
            <span className="tabular-nums text-sm font-600 text-slate-500">{attainmentPct}% of target</span>
          </div>
          {/* Per-LOS bars */}
          <div className="space-y-2">
            {LINES_OF_SERVICE.map(los => {
              // Parse revenue string like "$1.2M" → numeric
              const raw = parseFloat(los.revenueYTD.replace(/[$M]/g, ''));
              const maxRev = 3.4; // M&A is highest at $3.4M
              const pct = Math.round((raw / maxRev) * 100);
              return (
                <div key={los.id} className="flex items-center gap-3">
                  <span className="w-8 text-[10px] font-600 text-slate-500 text-right shrink-0">{los.abbreviation}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#1B5FD4] transition-all duration-700"
                      style={{ width: `${pct}%`, opacity: 0.7 + (pct / 100) * 0.3 }}
                    />
                  </div>
                  <span className="tabular-nums text-[11px] text-slate-500 w-10 text-right shrink-0">{los.revenueYTD}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Control Tower — LOS org chart ───────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-700 text-[#0F2044]">Lines of Service</h2>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              Hover any node for details
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mb-4">
            9 active lines of service · Hover a node to see deliverables, team, and status
          </p>

          {/* Org-chart container */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-visible">
            {/* Hub label */}
            <div className="flex flex-col items-center mb-2">
              <div className="w-16 h-16 rounded-full bg-[#0F2044] flex flex-col items-center justify-center shadow-md mb-1.5">
                <span className="text-[10px] font-600 text-white/60 uppercase tracking-wider">Tax</span>
                <span className="text-[13px] font-700 text-white leading-tight">BU</span>
              </div>
              <span className="text-[10px] font-600 text-slate-400 uppercase tracking-wider">Business Unit</span>
              {/* Vertical stem from hub */}
              <div className="w-px h-5 bg-slate-200 mt-1" />
            </div>

            {/* Three rows of LOS nodes */}
            <div className="space-y-0">
              {[
                LINES_OF_SERVICE.slice(0, 3),
                LINES_OF_SERVICE.slice(3, 6),
                LINES_OF_SERVICE.slice(6, 9),
              ].map((row, rowIdx) => (
                <div key={rowIdx} className="relative">
                  {/* Horizontal connector bar */}
                  <div className="flex items-center justify-center mb-0">
                    <div className="w-2/3 h-px bg-slate-200" />
                  </div>

                  {/* Nodes row */}
                  <div className="flex items-start justify-center gap-6 md:gap-10 lg:gap-16 py-3 relative">
                    {row.map((los, nodeIdx) => {
                      const totalNodes = row.length;
                      return (
                        <div key={los.id} className="flex flex-col items-center relative">
                          {/* Vertical tick from horizontal bar */}
                          <div className="w-px h-3 bg-slate-200 -mt-3 mb-0" />
                          <div
                            ref={el => {
                              // We'll use a data attribute approach for panel positioning
                            }}
                            data-los-id={los.id}
                          >
                            <LOSNodeWithPanel los={los} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Vertical connector to next row */}
                  {rowIdx < 2 && (
                    <div className="flex justify-center">
                      <div className="w-px h-4 bg-slate-200" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Cross-LOS Client Intelligence ────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-700 text-[#0F2044]">Client Portfolio — Cross-LOS View</h2>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Shared data sets (entity lists, financial statements, org charts) are available to all LOS teams serving the same client.
          </p>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2.5 px-4 text-[10px] font-600 text-slate-400 uppercase tracking-wider">Client</th>
                    <th className="text-left py-2.5 px-4 text-[10px] font-600 text-slate-400 uppercase tracking-wider">Tier</th>
                    <th className="text-left py-2.5 px-4 text-[10px] font-600 text-slate-400 uppercase tracking-wider">Active LOS</th>
                    <th className="text-left py-2.5 px-4 text-[10px] font-600 text-slate-400 uppercase tracking-wider">Shared Data</th>
                    <th className="text-right py-2.5 px-4 text-[10px] font-600 text-slate-400 uppercase tracking-wider">Revenue YTD</th>
                    <th className="py-2.5 px-4 w-8"></th>
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
        </div>

      </div>
    </AppShell>
  );
}

// ─── LOSNodeWithPanel — self-contained hover node ─────────────────────────────
function LOSNodeWithPanel({ los }: { los: LineOfService }) {
  const [open, setOpen] = useState(false);
  const [panelSide, setPanelSide] = useState<'right' | 'left'>('right');
  const nodeRef = useRef<HTMLDivElement>(null);
  const TrendIcon = los.trend === 'up' ? TrendingUp : los.trend === 'down' ? TrendingDown : Minus;

  function handleEnter() {
    // Determine which side has more space
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      setPanelSide(rect.left > window.innerWidth / 2 ? 'left' : 'right');
    }
    setOpen(true);
  }

  return (
    <div
      ref={nodeRef}
      className="relative flex flex-col items-center gap-1.5 cursor-pointer select-none group"
      onMouseEnter={handleEnter}
      onMouseLeave={() => setOpen(false)}
      onClick={() => toast.info(`${los.name} — detailed LOS view coming soon`)}
    >
      {/* Node circle */}
      <div
        className={cn(
          'w-14 h-14 rounded-full flex flex-col items-center justify-center',
          'border-2 transition-all duration-150 shadow-sm',
          open
            ? 'bg-[#0F2044] border-[#1B5FD4] shadow-[0_0_0_4px_rgba(27,95,212,0.12)]'
            : 'bg-[#1E293B] border-slate-500/40 group-hover:border-slate-400'
        )}
      >
        <span className="text-[11px] font-700 text-white leading-none">{los.abbreviation}</span>
        {los.atRisk > 0 && (
          <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-slate-300/60" />
        )}
      </div>

      {/* Label */}
      <div className="text-center">
        <div className="text-[10px] font-600 text-slate-600 leading-tight max-w-[76px] text-center">
          {los.name.split(' ').slice(0, 2).join(' ')}
        </div>
        <div className="flex items-center justify-center gap-0.5 text-[9px] text-slate-400 mt-0.5">
          <TrendIcon size={8} />
          <span>{los.trendPct}</span>
        </div>
      </div>

      {/* Hover panel */}
      {open && (
        <div
          className={cn(
            'absolute z-50 w-72 bg-white border border-slate-200 rounded-lg shadow-2xl p-4',
            'animate-fade-slide-up top-0',
            panelSide === 'right' ? 'left-[calc(100%+12px)]' : 'right-[calc(100%+12px)]'
          )}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onClick={e => e.stopPropagation()}
        >
          {/* Panel header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-6 h-6 rounded bg-[#0F2044] flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-700 text-white">{los.abbreviation}</span>
                </div>
                <span className="text-sm font-700 text-slate-800">{los.name}</span>
              </div>
              <div className="text-[11px] text-slate-400 pl-8">{los.leadPartner}</div>
            </div>
            <span className="text-[10px] font-500 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0">
              {los.trendPct} YTD
            </span>
          </div>

          {/* Description */}
          <p className="text-[11px] text-slate-500 leading-relaxed mb-3 border-b border-slate-100 pb-3">
            {los.description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: 'Clients', value: los.activeClients },
              { label: 'Workflows', value: los.activeWorkflows },
              { label: 'Revenue', value: los.revenueYTD },
            ].map(s => (
              <div key={s.label} className="text-center p-2 bg-slate-50 rounded">
                <div className="tabular-nums text-sm font-700 text-[#0F2044]">{s.value}</div>
                <div className="text-[9px] text-slate-400 uppercase tracking-wide mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Key deliverables */}
          <div className="mb-3">
            <div className="text-[9px] font-600 text-slate-400 uppercase tracking-wider mb-1.5">Key Deliverables</div>
            <div className="space-y-1">
              {los.keyDeliverables.slice(0, 3).map(d => (
                <div key={d} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <FileText size={9} className="text-slate-300 shrink-0" />
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* Active workflows count + at-risk indicator */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
            <div className="flex items-center gap-3">
              {los.pendingReviews > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock size={9} />
                  {los.pendingReviews} reviews
                </div>
              )}
              {los.atRisk > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-500">
                  <AlertTriangle size={9} />
                  {los.atRisk} at risk
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#1B5FD4]">
              <span>Open</span>
              <ChevronRight size={10} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
