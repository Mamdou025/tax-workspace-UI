// Screen 1: Tax LOS Dashboard — Practitioner View
// Design: "Precision Instrument" Light — for tax practitioners managing their client portfolio
// Shows: client portfolio, review queue, deadlines, recent activity, my work items

import { useState } from 'react';
import { Link } from 'wouter';
import {
  AlertTriangle, CheckCircle2, Clock, Users, FileText,
  TrendingUp, Activity, Sparkles, ChevronRight, ArrowUpRight,
  Calendar, Shield, RefreshCw, Building2, Workflow, MessageSquare,
  Upload, Star
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import StatusBadge, { TeamBadge, AvatarInitials } from '@/components/StatusBadge';
import { CLIENTS, DASHBOARD_STATS, RECENT_ACTIVITY, TAX_TEAMS, NORTHSTAR_WORKFLOWS } from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, accent, trend }: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; accent: string; trend?: string;
}) {
  return (
    <div className={cn('bg-card border border-border rounded-lg p-4 shadow-sm animate-fade-slide-up', accent)}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded bg-secondary">
          {icon}
        </div>
        {trend && (
          <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-500">
            <TrendingUp size={10} /> {trend}
          </span>
        )}
      </div>
      <div className="tabular-nums text-2xl font-700 text-foreground mb-0.5">{value}</div>
      <div className="text-xs font-500 text-foreground mb-0.5">{label}</div>
      {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

// ─── Client Row ───────────────────────────────────────────────────────────────
function ClientRow({ client, index }: { client: typeof CLIENTS[0]; index: number }) {
  return (
    <Link href={client.id === 'northstar' ? '/client/northstar' : '#'}>
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-secondary/40 transition-colors cursor-pointer animate-fade-slide-up',
          `stagger-${Math.min(index + 1, 6)}`
        )}
        onClick={client.id !== 'northstar' ? (e) => { e.preventDefault(); toast.info('Client workspace — coming soon'); } : undefined}
      >
        {/* Client name + tier */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-500 text-foreground truncate">{client.name}</span>
            <StatusBadge status={client.tier} size="sm" />
          </div>
          <div className="text-[11px] text-muted-foreground">
            Lead: {client.leadPartner} · {client.workflows.length} workflow{client.workflows.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Teams */}
        <div className="hidden lg:flex items-center gap-1 shrink-0">
          {client.teams.slice(0, 3).map(team => {
            const t = TAX_TEAMS.find(t => t.name === team);
            return t ? <TeamBadge key={t.id} name={t.name} color={t.color} abbreviation={t.abbreviation} /> : null;
          })}
          {client.teams.length > 3 && (
            <span className="text-[10px] text-muted-foreground">+{client.teams.length - 3}</span>
          )}
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <div className="text-center">
            <div className="tabular-nums text-sm font-600 text-foreground">{client.openReviewItems}</div>
            <div className="text-[10px] text-muted-foreground">Reviews</div>
          </div>
          <div className="text-center">
            <div className={cn('tabular-nums text-sm font-600', client.atRiskDeliverables > 0 ? 'text-red-500' : 'text-foreground')}>
              {client.atRiskDeliverables}
            </div>
            <div className="text-[10px] text-muted-foreground">At Risk</div>
          </div>
          <div className="text-center">
            <div className="tabular-nums text-sm font-600 text-amber-600">{client.upcomingDeadlines}</div>
            <div className="text-[10px] text-muted-foreground">Deadlines</div>
          </div>
        </div>

        {/* Last activity */}
        <div className="hidden xl:block text-[11px] text-muted-foreground shrink-0 w-24 text-right">
          {client.lastActivity}
        </div>

        <ChevronRight size={14} className="text-muted-foreground shrink-0" />
      </div>
    </Link>
  );
}

// ─── Review Queue Item ─────────────────────────────────────────────────────────
function ReviewQueueItem({ wf, index }: { wf: typeof NORTHSTAR_WORKFLOWS[0]; index: number }) {
  return (
    <Link href={wf.id === 'wf-fapi' ? '/workflow/fapi' : '#'}>
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-2.5 border-b border-border hover:bg-secondary/40 transition-colors cursor-pointer animate-fade-slide-up',
          `stagger-${Math.min(index + 1, 6)}`
        )}
        onClick={wf.id !== 'wf-fapi' ? (e) => { e.preventDefault(); toast.info('Workflow execution — coming soon'); } : undefined}
      >
        <div className="flex-1 min-w-0">
          <div className="text-xs font-500 text-foreground truncate">{wf.name}</div>
          <div className="text-[11px] text-muted-foreground">Northstar Holdings · {wf.reviewStage} stage</div>
        </div>
        <StatusBadge status={wf.status} size="sm" />
        <div className="text-[11px] text-muted-foreground shrink-0">{wf.dueDate}</div>
        {wf.exceptions && wf.exceptions > 0 ? (
          <span className="text-[10px] status-error px-1.5 py-0.5 rounded">{wf.exceptions} exc.</span>
        ) : null}
      </div>
    </Link>
  );
}

// ─── Activity Feed Item ────────────────────────────────────────────────────────
function ActivityItem({ item, index }: { item: typeof RECENT_ACTIVITY[0]; index: number }) {
  const iconMap: Record<string, React.ReactNode> = {
    review: <MessageSquare size={12} className="text-amber-500" />,
    upload: <Upload size={12} className="text-blue-500" />,
    ai: <Sparkles size={12} className="text-violet-500" />,
    approval: <CheckCircle2 size={12} className="text-emerald-500" />,
    exception: <AlertTriangle size={12} className="text-red-500" />,
    complete: <CheckCircle2 size={12} className="text-emerald-500" />,
  };

  return (
    <div className={cn('flex gap-3 px-4 py-2.5 border-b border-border animate-fade-slide-up', `stagger-${Math.min(index + 1, 6)}`)}>
      <div className="w-5 h-5 rounded bg-secondary flex items-center justify-center shrink-0 mt-0.5">
        {iconMap[item.type] || <Activity size={12} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-foreground leading-relaxed">{item.text}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{item.time}</div>
      </div>
    </div>
  );
}

// ─── My Work Items ─────────────────────────────────────────────────────────────
const MY_WORK_ITEMS = [
  { id: 'w1', name: 'FAPI Workpaper 2025', client: 'Northstar Holdings', role: 'Partner', action: 'Awaiting your sign-off', urgent: true, href: '/workflow/fapi' },
  { id: 'w2', name: 'T1134 Foreign Affiliate 2024', client: 'Northstar Holdings', role: 'Partner', action: '1 open exception', urgent: false, href: '#' },
  { id: 'w3', name: 'M&A Memo — Project Maple', client: 'Northstar Holdings', role: 'Partner', action: 'Under review — Sr. Manager stage', urgent: false, href: '#' },
  { id: 'w4', name: 'Pillar 2 GloBE Assessment', client: 'Northstar Holdings', role: 'Partner', action: '4 exceptions — immediate attention', urgent: true, href: '#' },
];

// ─── Dashboard Page ────────────────────────────────────────────────────────────
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
        { label: 'Executive Overview', href: '/' },
        { label: 'Tax LOS Dashboard' }
      ]}
      actions={
        <button
          onClick={() => toast.info('Data refreshed')}
          className="p-2 rounded hover:bg-secondary transition-colors"
        >
          <RefreshCw size={14} className="text-muted-foreground" />
        </button>
      }
    >
      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-700 text-foreground">Tax LOS Dashboard</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Practitioner view · Fiscal Year 2024–2025 · As of May 18, 2025
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <div className="flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer">
                <span>Executive Overview</span>
                <ArrowUpRight size={12} />
              </div>
            </Link>
            <button
              onClick={() => toast.info('Export dashboard — coming soon')}
              className="text-xs px-3 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              Export
            </button>
          </div>
        </div>

        {/* AI Summary Banner */}
        <div className="bg-primary/5 border border-primary/15 rounded-lg p-3.5 flex gap-3">
          <div className="w-7 h-7 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Sparkles size={14} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-600 text-primary mb-1">AI Workspace Summary</div>
            <div className="text-[11px] text-foreground/80 leading-relaxed">
              <strong>3 deliverables are at risk</strong> of missing their deadlines. Pillar 2 GloBE Assessment has 4 unresolved exceptions and is due May 31.
              M&A Transaction Memo — Project Cedar (Vantage Capital) is overdue for consultant first pass.
              FAPI Workpaper 2025 is awaiting manager sign-off on 2 open items.
              <span className="text-primary cursor-pointer hover:underline ml-1" onClick={() => toast.info('AI detail view — coming soon')}>View full analysis →</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            label="Total Clients"
            value={DASHBOARD_STATS.totalClients}
            icon={<Users size={16} className="text-primary" />}
            accent="card-accent-blue"
          />
          <StatCard
            label="Active Workflows"
            value={DASHBOARD_STATS.activeWorkflows}
            icon={<Workflow size={16} className="text-primary" />}
            accent="card-accent-blue"
            trend="+2 this week"
          />
          <StatCard
            label="Pending Reviews"
            value={DASHBOARD_STATS.pendingReviews}
            sub="Across all clients"
            icon={<Shield size={16} className="text-amber-500" />}
            accent="card-accent-amber"
          />
          <StatCard
            label="Upcoming Deadlines"
            value={DASHBOARD_STATS.upcomingDeadlines}
            sub="Next 30 days"
            icon={<Calendar size={16} className="text-amber-500" />}
            accent="card-accent-amber"
          />
          <StatCard
            label="At-Risk Deliverables"
            value={DASHBOARD_STATS.atRiskDeliverables}
            sub="Immediate attention"
            icon={<AlertTriangle size={16} className="text-red-500" />}
            accent="card-accent-red"
          />
          <StatCard
            label="Completed (MTD)"
            value={DASHBOARD_STATS.completedThisMonth}
            icon={<CheckCircle2 size={16} className="text-emerald-500" />}
            accent="card-accent-green"
            trend="On track"
          />
        </div>

        {/* My Work Items */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Star size={14} className="text-amber-500" />
            <span className="text-sm font-600 text-foreground">My Work Items</span>
            <span className="text-[10px] status-warning px-1.5 py-0.5 rounded">{MY_WORK_ITEMS.length}</span>
            <span className="text-[11px] text-muted-foreground ml-1">— Margaret Chen, Partner</span>
          </div>
          <div>
            {MY_WORK_ITEMS.map((item, i) => (
              <Link href={item.href} key={item.id}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 border-b border-border hover:bg-secondary/40 transition-colors cursor-pointer animate-fade-slide-up',
                    `stagger-${Math.min(i + 1, 4)}`
                  )}
                  onClick={item.href === '#' ? (e) => { e.preventDefault(); toast.info('Workflow execution — coming soon'); } : undefined}
                >
                  <div className={cn(
                    'w-1.5 h-1.5 rounded-full shrink-0',
                    item.urgent ? 'bg-red-500' : 'bg-emerald-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-500 text-foreground truncate">{item.name}</div>
                    <div className="text-[11px] text-muted-foreground">{item.client} · {item.role}</div>
                  </div>
                  <div className={cn(
                    'text-[11px] px-2 py-0.5 rounded shrink-0',
                    item.urgent ? 'status-error' : 'status-pending'
                  )}>
                    {item.action}
                  </div>
                  <ChevronRight size={13} className="text-muted-foreground shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Client Portfolio — 2 cols */}
          <div className="lg:col-span-2 bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-primary" />
                <span className="text-sm font-600 text-foreground">Client Portfolio</span>
                <span className="text-[10px] status-info px-1.5 py-0.5 rounded">{CLIENTS.length} clients</span>
              </div>
              <div className="flex items-center gap-1">
                {(['all', 'at-risk', 'review'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={cn(
                      'text-[10px] px-2 py-1 rounded transition-colors capitalize',
                      activeFilter === f ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {f === 'at-risk' ? 'At Risk' : f === 'review' ? 'In Review' : 'All'}
                  </button>
                ))}
              </div>
            </div>

            {/* Table header */}
            <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-secondary/30">
              <div className="flex-1 text-[10px] font-600 text-muted-foreground uppercase tracking-wider">Client</div>
              <div className="hidden lg:block text-[10px] font-600 text-muted-foreground uppercase tracking-wider w-36">Teams</div>
              <div className="hidden md:flex gap-4">
                <div className="text-[10px] font-600 text-muted-foreground uppercase tracking-wider w-14 text-center">Reviews</div>
                <div className="text-[10px] font-600 text-muted-foreground uppercase tracking-wider w-14 text-center">At Risk</div>
                <div className="text-[10px] font-600 text-muted-foreground uppercase tracking-wider w-14 text-center">Deadlines</div>
              </div>
              <div className="hidden xl:block text-[10px] font-600 text-muted-foreground uppercase tracking-wider w-24 text-right">Activity</div>
              <div className="w-4" />
            </div>

            {filteredClients.map((client, i) => (
              <ClientRow key={client.id} client={client} index={i} />
            ))}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Review Queue */}
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-amber-500" />
                  <span className="text-sm font-600 text-foreground">Review Queue</span>
                  <span className="text-[10px] status-warning px-1.5 py-0.5 rounded">{reviewQueue.length}</span>
                </div>
                <Link href="/client/northstar">
                  <span className="text-[10px] text-primary hover:underline cursor-pointer">View all</span>
                </Link>
              </div>
              {reviewQueue.map((wf, i) => (
                <ReviewQueueItem key={wf.id} wf={wf} index={i} />
              ))}
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <Clock size={14} className="text-amber-500" />
                <span className="text-sm font-600 text-foreground">Upcoming Deadlines</span>
              </div>
              {[
                { name: 'M&A Memo — Project Cedar', client: 'Vantage Capital', date: 'May 25', urgent: true },
                { name: 'M&A Memo — Project Maple', client: 'Northstar', date: 'May 28', urgent: true },
                { name: 'Pillar 2 GloBE Assessment', client: 'Northstar', date: 'May 31', urgent: true },
                { name: 'T2 Corporate Return 2024', client: 'Northstar', date: 'Jun 15', urgent: false },
                { name: 'T2 Corporate Return 2024', client: 'Meridian Energy', date: 'Jun 15', urgent: false },
              ].map((d, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-center justify-between px-4 py-2.5 border-b border-border animate-fade-slide-up',
                    `stagger-${Math.min(i + 1, 5)}`
                  )}
                >
                  <div className="min-w-0">
                    <div className="text-[11px] font-500 text-foreground truncate">{d.name}</div>
                    <div className="text-[10px] text-muted-foreground">{d.client}</div>
                  </div>
                  <span className={cn(
                    'text-[10px] font-600 px-1.5 py-0.5 rounded shrink-0 ml-2',
                    d.urgent ? 'status-error' : 'status-pending'
                  )}>
                    {d.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity — full width */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Activity size={14} className="text-primary" />
            <span className="text-sm font-600 text-foreground">Recent Activity</span>
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
