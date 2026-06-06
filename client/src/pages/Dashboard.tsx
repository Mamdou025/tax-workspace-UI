// Practitioner Dashboard — Screen 1
// Design: Grayscale + deep navy (#0F2044). Status colors (red/amber/green) ONLY for
// actionable signals: at-risk, awaiting sign-off, under review, completed, exceptions.
// Layout: 6 KPI tiles → Client Portfolio (full-width) → My Work Items → Review Queue + Deadlines → Activity

import { useState } from 'react';
import { Link } from 'wouter';
import {
  AlertTriangle, CheckCircle2, Clock, Users, FileText,
  Activity, Sparkles, ChevronRight, ArrowUpRight,
  Calendar, Shield, RefreshCw, Building2, Workflow, MessageSquare,
  Upload, Star
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import StatusBadge, { TeamBadge, AvatarInitials } from '@/components/StatusBadge';
import { CLIENTS, DASHBOARD_STATS, RECENT_ACTIVITY, TAX_TEAMS, NORTHSTAR_WORKFLOWS } from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── KPI Tile ─────────────────────────────────────────────────────────────────
// Grayscale base; only the value/icon carries a status color when actionable.
function KPITile({ label, value, sub, icon, valueColor }: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  valueColor?: string; // only set when the number itself is a status signal
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm animate-fade-slide-up">
      <div className="flex items-center justify-between mb-3">
        <div className="p-1.5 rounded bg-slate-100">
          {icon}
        </div>
      </div>
      <div className={cn('tabular-nums text-2xl font-700 mb-0.5', valueColor ?? 'text-[#0F2044]')}>{value}</div>
      <div className="text-xs font-500 text-slate-700 mb-0.5">{label}</div>
      {sub && <div className="text-[11px] text-slate-400">{sub}</div>}
    </div>
  );
}

// ─── Client Row ───────────────────────────────────────────────────────────────
function ClientRow({ client, index }: { client: typeof CLIENTS[0]; index: number }) {
  return (
    <Link href={client.id === 'northstar' ? '/client/northstar' : '#'}>
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3.5 border-b border-slate-100',
          'hover:bg-slate-50 transition-colors cursor-pointer animate-fade-slide-up',
          `stagger-${Math.min(index + 1, 6)}`
        )}
        onClick={client.id !== 'northstar' ? (e) => { e.preventDefault(); toast.info('Client workspace — coming soon'); } : undefined}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#0F2044] flex items-center justify-center text-white text-[11px] font-700 shrink-0">
          {client.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
        </div>

        {/* Client name + tier */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-600 text-slate-800 truncate">{client.name}</span>
            <span className={cn(
              'text-[9px] font-600 px-1.5 py-0.5 rounded-full border',
              client.tier === 'Platinum'
                ? 'bg-slate-100 border-slate-300 text-slate-600'
                : client.tier === 'Strategic'
                ? 'bg-slate-100 border-slate-200 text-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            )}>
              {client.tier}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Lead: {client.leadPartner} · {client.workflows.length} workflow{client.workflows.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Teams */}
        <div className="hidden lg:flex items-center gap-1 shrink-0">
          {client.teams.slice(0, 3).map(team => {
            const t = TAX_TEAMS.find(t => t.name === team);
            return t ? (
              <span
                key={t.id}
                className="text-[9px] font-600 px-1.5 py-0.5 rounded bg-[#0F2044] text-white"
              >
                {t.abbreviation}
              </span>
            ) : null;
          })}
          {client.teams.length > 3 && (
            <span className="text-[10px] text-slate-400">+{client.teams.length - 3}</span>
          )}
        </div>

        {/* Stats — status colors only on actionable numbers */}
        <div className="hidden md:flex items-center gap-5 shrink-0">
          <div className="text-center">
            <div className={cn(
              'tabular-nums text-sm font-600',
              client.openReviewItems > 0 ? 'text-amber-600' : 'text-slate-400'
            )}>
              {client.openReviewItems}
            </div>
            <div className="text-[10px] text-slate-400">Reviews</div>
          </div>
          <div className="text-center">
            <div className={cn(
              'tabular-nums text-sm font-600',
              client.atRiskDeliverables > 0 ? 'text-red-500' : 'text-slate-400'
            )}>
              {client.atRiskDeliverables > 0 ? client.atRiskDeliverables : '—'}
            </div>
            <div className="text-[10px] text-slate-400">At Risk</div>
          </div>
          <div className="text-center">
            <div className={cn(
              'tabular-nums text-sm font-600',
              client.upcomingDeadlines > 0 ? 'text-slate-700' : 'text-slate-400'
            )}>
              {client.upcomingDeadlines}
            </div>
            <div className="text-[10px] text-slate-400">Deadlines</div>
          </div>
        </div>

        {/* Last activity */}
        <div className="hidden xl:block text-[11px] text-slate-400 shrink-0 w-24 text-right">
          {client.lastActivity}
        </div>

        <ChevronRight size={14} className="text-slate-300 shrink-0" />
      </div>
    </Link>
  );
}

// ─── My Work Item ──────────────────────────────────────────────────────────────
// Action label uses status colors: red = urgent, amber = needs attention, green = completed
const MY_WORK_ITEMS = [
  { id: 'w1', name: 'FAPI Workpaper 2025', client: 'Northstar Holdings', role: 'Partner', action: 'Awaiting your sign-off', actionType: 'urgent' as const, href: '/workflow/fapi' },
  { id: 'w2', name: 'T1134 Foreign Affiliate 2024', client: 'Northstar Holdings', role: 'Partner', action: '1 open exception', actionType: 'warning' as const, href: '#' },
  { id: 'w3', name: 'M&A Memo — Project Maple', client: 'Northstar Holdings', role: 'Partner', action: 'Under review — Sr. Manager stage', actionType: 'info' as const, href: '#' },
  { id: 'w4', name: 'Pillar 2 GloBE Assessment', client: 'Northstar Holdings', role: 'Partner', action: '4 exceptions — immediate attention', actionType: 'urgent' as const, href: '#' },
];

const ACTION_STYLES = {
  urgent: 'bg-red-50 text-red-600 border border-red-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  info: 'bg-slate-100 text-slate-600 border border-slate-200',
} as const;

function WorkItem({ item, index }: { item: typeof MY_WORK_ITEMS[0]; index: number }) {
  return (
    <Link href={item.href}>
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 border-b border-slate-100',
          'hover:bg-slate-50 transition-colors cursor-pointer animate-fade-slide-up',
          `stagger-${Math.min(index + 1, 4)}`
        )}
        onClick={item.href === '#' ? (e) => { e.preventDefault(); toast.info('Workflow execution — coming soon'); } : undefined}
      >
        {/* Urgency dot */}
        <div className={cn(
          'w-2 h-2 rounded-full shrink-0',
          item.actionType === 'urgent' ? 'bg-red-500' :
          item.actionType === 'warning' ? 'bg-amber-500' :
            'bg-slate-300'
        )} />

        {/* Name + client */}
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-500 text-slate-800 truncate">{item.name}</div>
          <div className="text-[11px] text-slate-400">{item.client} · {item.role}</div>
        </div>

        {/* Action label — status color */}
        <div className={cn(
          'text-[11px] font-500 px-2 py-0.5 rounded shrink-0',
          ACTION_STYLES[item.actionType]
        )}>
          {item.action}
        </div>

        <ChevronRight size={13} className="text-slate-300 shrink-0" />
      </div>
    </Link>
  );
}

// ─── Review Queue Item ─────────────────────────────────────────────────────────
function ReviewQueueItem({ wf, index }: { wf: typeof NORTHSTAR_WORKFLOWS[0]; index: number }) {
  const statusStyle =
    wf.status === 'At Risk' ? 'bg-red-50 text-red-600 border border-red-200' :
    wf.status === 'Under Review' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
    wf.status === 'Complete' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
    'bg-slate-100 text-slate-500 border border-slate-200';

  return (
    <Link href={wf.id === 'wf-fapi' ? '/workflow/fapi' : '#'}>
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-2.5 border-b border-slate-100',
          'hover:bg-slate-50 transition-colors cursor-pointer animate-fade-slide-up',
          `stagger-${Math.min(index + 1, 6)}`
        )}
        onClick={wf.id !== 'wf-fapi' ? (e) => { e.preventDefault(); toast.info('Workflow execution — coming soon'); } : undefined}
      >
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-500 text-slate-800 truncate">{wf.name}</div>
          <div className="text-[11px] text-slate-400">Northstar · {wf.reviewStage} stage</div>
        </div>
        <span className={cn('text-[10px] font-500 px-1.5 py-0.5 rounded shrink-0', statusStyle)}>
          {wf.status}
        </span>
        <div className="text-[11px] text-slate-400 shrink-0">{wf.dueDate}</div>
        {wf.exceptions && wf.exceptions > 0 ? (
          <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded shrink-0">
            {wf.exceptions} exc.
          </span>
        ) : null}
      </div>
    </Link>
  );
}

// ─── Activity Feed Item ────────────────────────────────────────────────────────
// Icon colors are status signals — kept as-is
function ActivityItem({ item, index }: { item: typeof RECENT_ACTIVITY[0]; index: number }) {
  const iconMap: Record<string, React.ReactNode> = {
    review:    <MessageSquare size={11} className="text-amber-500" />,
    upload:    <Upload size={11} className="text-[#1B5FD4]" />,
    ai:        <Sparkles size={11} className="text-[#1B5FD4]" />,
    approval:  <CheckCircle2 size={11} className="text-emerald-500" />,
    exception: <AlertTriangle size={11} className="text-red-500" />,
    complete:  <CheckCircle2 size={11} className="text-emerald-500" />,
  };

  return (
    <div className={cn(
      'flex gap-3 px-4 py-2.5 border-b border-slate-100 animate-fade-slide-up',
      `stagger-${Math.min(index + 1, 6)}`
    )}>
      <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        {iconMap[item.type] || <Activity size={11} className="text-slate-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-slate-700 leading-relaxed">{item.text}</div>
        <div className="text-[10px] text-slate-400 mt-0.5">{item.time}</div>
      </div>
    </div>
  );
}

// ─── Practitioner Dashboard ────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'at-risk' | 'review'>('all');

  const filteredClients = activeFilter === 'at-risk'
    ? CLIENTS.filter(c => c.atRiskDeliverables > 0)
    : activeFilter === 'review'
    ? CLIENTS.filter(c => c.openReviewItems > 0)
    : CLIENTS;

  const reviewQueue = NORTHSTAR_WORKFLOWS.filter(w =>
    w.status === 'Under Review' || w.status === 'At Risk'
  );

  return (
    <AppShell
      breadcrumbs={[
        { label: 'InScope', href: '/' },
        { label: 'My Engagements' }
      ]}
      actions={
        <button
          onClick={() => toast.info('Data refreshed')}
          className="p-2 rounded hover:bg-slate-100 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={14} className="text-slate-400" />
        </button>
      }
    >
      <div className="p-5 space-y-5 max-w-[1200px]">

        {/* ── Page header ──────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-700 text-[#0F2044]">My Engagements</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Margaret Chen, Partner · Fiscal Year 2024–2025 · As of May 18, 2025
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="flex items-center gap-1.5 text-xs text-[#1B5FD4] hover:underline cursor-pointer">
                <span>Tax BU Overview</span>
                <ArrowUpRight size={12} />
              </div>
            </Link>
            <button
              onClick={() => toast.info('Export dashboard — coming soon')}
              className="text-xs px-3 py-1.5 rounded border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
            >
              Export
            </button>
          </div>
        </div>

        {/* ── AI Summary ───────────────────────────────────────────────────── */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex gap-3">
          <div className="w-7 h-7 rounded bg-[#0F2044]/8 border border-[#0F2044]/12 flex items-center justify-center shrink-0">
            <Sparkles size={13} className="text-[#1B5FD4]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-600 text-[#1B5FD4] mb-1 uppercase tracking-wider">AI Workspace Summary</div>
            <div className="text-[12px] text-slate-600 leading-relaxed">
              <strong className="text-slate-800">3 deliverables are at risk</strong> of missing their deadlines. Pillar 2 GloBE Assessment has 4 unresolved exceptions and is due May 31.
              M&A Transaction Memo — Project Cedar (Vantage Capital) is overdue for consultant first pass.
              FAPI Workpaper 2025 is awaiting manager sign-off on 2 open items.
              <span
                className="text-[#1B5FD4] cursor-pointer hover:underline ml-1"
                onClick={() => toast.info('AI detail view — coming soon')}
              >
                View full analysis →
              </span>
            </div>
          </div>
        </div>

        {/* ── 6 KPI Tiles ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPITile
            label="Total Clients"
            value={DASHBOARD_STATS.totalClients}
            icon={<Users size={15} className="text-slate-400" />}
          />
          <KPITile
            label="Active Workflows"
            value={DASHBOARD_STATS.activeWorkflows}
            sub="+2 this week"
            icon={<Workflow size={15} className="text-slate-400" />}
          />
          {/* Pending Reviews — amber because it requires action */}
          <KPITile
            label="Pending Reviews"
            value={DASHBOARD_STATS.pendingReviews}
            sub="Across all clients"
            icon={<Shield size={15} className="text-amber-500" />}
            valueColor="text-amber-600"
          />
          {/* Upcoming Deadlines — slate, informational */}
          <KPITile
            label="Upcoming Deadlines"
            value={DASHBOARD_STATS.upcomingDeadlines}
            sub="Next 30 days"
            icon={<Calendar size={15} className="text-slate-400" />}
          />
          {/* At Risk — red because it demands attention */}
          <KPITile
            label="At-Risk Deliverables"
            value={DASHBOARD_STATS.atRiskDeliverables}
            sub="Immediate attention"
            icon={<AlertTriangle size={15} className="text-red-500" />}
            valueColor="text-red-500"
          />
          {/* Completed — green because it's a positive signal */}
          <KPITile
            label="Completed (MTD)"
            value={DASHBOARD_STATS.completedThisMonth}
            sub="On track"
            icon={<CheckCircle2 size={15} className="text-emerald-500" />}
            valueColor="text-emerald-600"
          />
        </div>

        {/* ── Client Portfolio — full width ─────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-slate-400" />
              <span className="text-sm font-600 text-[#0F2044]">Client Portfolio</span>
              <span className="text-[10px] font-600 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {CLIENTS.length} clients
              </span>
            </div>
            <div className="flex items-center gap-1">
              {(['all', 'at-risk', 'review'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={cn(
                    'text-[11px] px-2.5 py-1 rounded transition-colors',
                    activeFilter === f
                      ? 'bg-[#0F2044] text-white'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  )}
                >
                  {f === 'at-risk' ? 'At Risk' : f === 'review' ? 'In Review' : 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-100 bg-slate-50">
            <div className="w-8 shrink-0" />
            <div className="flex-1 text-[10px] font-600 text-slate-400 uppercase tracking-wider">Client</div>
            <div className="hidden lg:block text-[10px] font-600 text-slate-400 uppercase tracking-wider w-28">Teams</div>
            <div className="hidden md:flex gap-5">
              <div className="text-[10px] font-600 text-slate-400 uppercase tracking-wider w-14 text-center">Reviews</div>
              <div className="text-[10px] font-600 text-slate-400 uppercase tracking-wider w-14 text-center">At Risk</div>
              <div className="text-[10px] font-600 text-slate-400 uppercase tracking-wider w-14 text-center">Deadlines</div>
            </div>
            <div className="hidden xl:block text-[10px] font-600 text-slate-400 uppercase tracking-wider w-24 text-right">Activity</div>
            <div className="w-4 shrink-0" />
          </div>

          {filteredClients.map((client, i) => (
            <ClientRow key={client.id} client={client} index={i} />
          ))}
        </div>

        {/* ── My Work Items ─────────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
            <Star size={13} className="text-amber-500" />
            <span className="text-sm font-600 text-[#0F2044]">My Work Items</span>
            <span className="text-[10px] font-600 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              {MY_WORK_ITEMS.length}
            </span>
            <span className="text-[11px] text-slate-400 ml-1">— Margaret Chen, Partner</span>
          </div>
          <div>
            {MY_WORK_ITEMS.map((item, i) => (
              <WorkItem key={item.id} item={item} index={i} />
            ))}
          </div>
        </div>

        {/* ── Review Queue + Deadlines — side by side ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Review Queue */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Shield size={13} className="text-amber-500" />
                <span className="text-sm font-600 text-[#0F2044]">Review Queue</span>
                <span className="text-[10px] font-600 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  {reviewQueue.length}
                </span>
              </div>
              <Link href="/client/northstar">
                <span className="text-[11px] text-[#1B5FD4] hover:underline cursor-pointer">View all</span>
              </Link>
            </div>
            {reviewQueue.map((wf, i) => (
              <ReviewQueueItem key={wf.id} wf={wf} index={i} />
            ))}
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
              <Clock size={13} className="text-slate-400" />
              <span className="text-sm font-600 text-[#0F2044]">Upcoming Deadlines</span>
            </div>
            {[
              { name: 'M&A Memo — Project Cedar', client: 'Vantage Capital', date: 'May 25', urgent: true },
              { name: 'M&A Memo — Project Maple',  client: 'Northstar',       date: 'May 28', urgent: true },
              { name: 'Pillar 2 GloBE Assessment', client: 'Northstar',       date: 'May 31', urgent: true },
              { name: 'T2 Corporate Return 2024',  client: 'Northstar',       date: 'Jun 15', urgent: false },
              { name: 'T2 Corporate Return 2024',  client: 'Meridian Energy', date: 'Jun 15', urgent: false },
            ].map((d, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center justify-between px-4 py-2.5 border-b border-slate-100 animate-fade-slide-up',
                  `stagger-${Math.min(i + 1, 5)}`
                )}
              >
                <div className="min-w-0">
                  <div className="text-[12px] font-500 text-slate-700 truncate">{d.name}</div>
                  <div className="text-[10px] text-slate-400">{d.client}</div>
                </div>
                {/* Date badge — red if urgent, slate if not */}
                <span className={cn(
                  'text-[10px] font-600 px-1.5 py-0.5 rounded shrink-0 ml-2',
                  d.urgent
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                )}>
                  {d.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent Activity ───────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
            <Activity size={13} className="text-slate-400" />
            <span className="text-sm font-600 text-[#0F2044]">Recent Activity</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {RECENT_ACTIVITY.map((item, i) => (
              <ActivityItem key={item.id} item={item} index={i} />
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
