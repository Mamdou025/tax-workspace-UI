// Screen 2: Client Workspace — Northstar Holdings Inc.
// Design: "Precision Instrument" — Dense client tax workspace with all workflow cards
// Shows: client overview, teams, active workflows, review trail, deliverables

import { useState } from 'react';
import { Link } from 'wouter';
import {
  Building2, Users, FileText, ChevronRight, AlertTriangle,
  CheckCircle2, Clock, Upload, Shield, Star, MoreHorizontal,
  Calendar, Activity, Folder, History, Package, Sparkles
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import StatusBadge, { TeamBadge, AvatarInitials } from '@/components/StatusBadge';
import {
  CLIENTS, TAX_TEAMS, TEAM_MEMBERS, FAPI_REVIEW_TRAIL,
  type WorkflowCard
} from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const client = CLIENTS[0]; // Northstar Holdings Inc.

// ─── Workflow Card ─────────────────────────────────────────────────────────────
function WorkflowCardItem({ wf, index }: { wf: WorkflowCard; index: number }) {
  const isFapi = wf.id === 'wf-fapi';
  const reviewStages: Array<WorkflowCard['reviewStage']> = ['Consultant', 'Manager', 'Senior Manager', 'Partner', 'Delivered'];
  const currentStageIdx = reviewStages.indexOf(wf.reviewStage);

  return (
    <div
      className={cn(
        'bg-card border border-border rounded overflow-hidden animate-fade-slide-up hover:border-primary/30 transition-colors',
        `stagger-${Math.min(index + 1, 6)}`,
        wf.status === 'At Risk' && 'border-red-500/30'
      )}
    >
      {/* Card header */}
      <div className="flex items-start justify-between px-4 py-3 border-b border-border">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-600 text-foreground truncate">{wf.name}</span>
            {wf.status === 'At Risk' && (
              <AlertTriangle size={12} className="text-red-400 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <TeamBadge
              name={wf.team}
              color={wf.teamColor}
              abbreviation={TAX_TEAMS.find(t => t.name === wf.team)?.abbreviation}
            />
            <StatusBadge status={wf.status} />
            <span className="text-[10px] text-muted-foreground">FY {wf.year}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {isFapi ? (
            <Link href="/workflow/fapi">
              <button className="text-[10px] px-2.5 py-1 rounded bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-colors">
                Open →
              </button>
            </Link>
          ) : (
            <button
              onClick={() => toast.info('Workflow execution — coming soon')}
              className="text-[10px] px-2.5 py-1 rounded bg-secondary text-muted-foreground border border-border hover:text-foreground transition-colors"
            >
              Open
            </button>
          )}
          <button
            onClick={() => toast.info('Workflow options')}
            className="p-1 rounded hover:bg-secondary transition-colors"
          >
            <MoreHorizontal size={13} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Review stage timeline */}
      <div className="px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-0">
          {reviewStages.map((stage, i) => {
            const isDone = i < currentStageIdx;
            const isCurrent = i === currentStageIdx;
            const isLast = i === reviewStages.length - 1;
            return (
              <div key={stage} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    isDone ? 'bg-green-400' : isCurrent ? 'bg-primary animate-pulse-dot' : 'bg-border'
                  )} />
                  <span className={cn(
                    'text-[9px] mt-0.5 whitespace-nowrap',
                    isCurrent ? 'text-primary font-600' : isDone ? 'text-green-400' : 'text-muted-foreground'
                  )}>
                    {stage === 'Senior Manager' ? 'Sr. Mgr' : stage}
                  </span>
                </div>
                {!isLast && (
                  <div className={cn('flex-1 h-px mx-1', isDone ? 'bg-green-400/40' : 'bg-border')} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* People + metadata */}
      <div className="px-4 py-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5">
        <div className="flex items-center gap-1.5">
          <AvatarInitials initials={wf.preparer.split(' ').map(n => n[0]).join('')} name={wf.preparer} size="xs" />
          <div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Preparer</div>
            <div className="text-[11px] text-foreground">{wf.preparer}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <AvatarInitials initials={wf.manager.split(' ').map(n => n[0]).join('')} name={wf.manager} size="xs" color="#F0883E" />
          <div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Manager</div>
            <div className="text-[11px] text-foreground">{wf.manager}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <AvatarInitials initials={wf.seniorManager.split(' ').map(n => n[0]).join('')} name={wf.seniorManager} size="xs" color="#A371F7" />
          <div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Sr. Manager</div>
            <div className="text-[11px] text-foreground">{wf.seniorManager}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <AvatarInitials initials={wf.partner.split(' ').map(n => n[0]).join('')} name={wf.partner} size="xs" color="#3FB950" />
          <div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Partner</div>
            <div className="text-[11px] text-foreground">{wf.partner}</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/20 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock size={10} />
            <span>Due {wf.dueDate}</span>
          </div>
          {wf.exceptions !== undefined && wf.exceptions > 0 && (
            <span className="text-[10px] status-error px-1.5 py-0.5 rounded">
              {wf.exceptions} exception{wf.exceptions !== 1 ? 's' : ''}
            </span>
          )}
          {wf.openItems !== undefined && wf.openItems > 0 && (
            <span className="text-[10px] status-warning px-1.5 py-0.5 rounded">
              {wf.openItems} open item{wf.openItems !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Activity size={10} />
          <span>{wf.lastActivity}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Review Trail ─────────────────────────────────────────────────────────────
function ReviewTrail() {
  return (
    <div className="space-y-3">
      {FAPI_REVIEW_TRAIL.map((item, i) => (
        <div key={item.id} className={cn('review-step animate-fade-slide-up', `stagger-${i + 1}`)}>
          <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center"
            style={{
              borderColor: item.type === 'change-request' ? '#F0883E' : item.type === 'approval' ? '#3FB950' : '#2F81F7',
              backgroundColor: item.type === 'change-request' ? '#F0883E18' : item.type === 'approval' ? '#3FB95018' : '#2F81F718',
            }}
          >
            {item.type === 'change-request' ? (
              <AlertTriangle size={8} style={{ color: '#F0883E' }} />
            ) : item.type === 'approval' ? (
              <CheckCircle2 size={8} style={{ color: '#3FB950' }} />
            ) : (
              <FileText size={8} style={{ color: '#2F81F7' }} />
            )}
          </div>
          <div className="bg-card border border-border rounded p-3 ml-1">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <AvatarInitials
                  initials={item.author.split(' ').map(n => n[0]).join('')}
                  name={item.author}
                  size="xs"
                />
                <span className="text-xs font-500 text-foreground">{item.author}</span>
                <span className="text-[10px] text-muted-foreground">{item.role}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.type === 'change-request' && (
                  <span className="text-[10px] status-warning px-1.5 py-0.5 rounded">
                    {item.resolved ? 'Resolved' : 'Open'}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground">{item.timestamp}</span>
              </div>
            </div>
            <p className="text-[11px] text-foreground/80 leading-relaxed">{item.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Client Workspace Page ────────────────────────────────────────────────────
export default function ClientWorkspace() {
  const [activeTab, setActiveTab] = useState('workflows');

  const teams = client.teams.map(name => TAX_TEAMS.find(t => t.name === name)).filter(Boolean);
  const partners = TEAM_MEMBERS.filter(m => client.partners.includes(m.name));

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Tax LOS Dashboard', href: '/' },
        { label: client.name },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info('Upload documents — coming soon')}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            <Upload size={12} />
            <span className="hidden sm:inline">Upload</span>
          </button>
        </div>
      }
    >
      <div className="flex flex-col h-full">
        {/* Client header banner */}
        <div className="border-b border-border bg-card/50 px-5 py-4">
          <div className="flex items-start gap-4">
            {/* Client avatar */}
            <div className="w-12 h-12 rounded border border-border bg-secondary flex items-center justify-center shrink-0">
              <Building2 size={22} className="text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                <h1 className="text-lg font-700 text-foreground">{client.name}</h1>
                <StatusBadge status={client.tier} size="md" />
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Star size={10} className="text-amber-400" />
                  <span>Platinum Client</span>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Lead Partner</span>
                  <AvatarInitials initials="MC" name="Margaret Chen" size="xs" />
                  <span className="text-[11px] text-foreground">{client.leadPartner}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Partners</span>
                  <div className="flex -space-x-1">
                    {partners.map(p => (
                      <AvatarInitials key={p!.id} initials={p!.initials} name={p!.name} size="xs" />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Teams</span>
                  {teams.map(t => t && (
                    <TeamBadge key={t.id} name={t.name} color={t.color} abbreviation={t.abbreviation} />
                  ))}
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="hidden lg:flex items-center gap-4 shrink-0">
              {[
                { label: 'Workflows', value: client.workflows.length, color: 'text-foreground' },
                { label: 'Open Reviews', value: client.openReviewItems, color: 'text-amber-400' },
                { label: 'At Risk', value: client.atRiskDeliverables, color: 'text-red-400' },
                { label: 'Deadlines', value: client.upcomingDeadlines, color: 'text-amber-400' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className={cn('tabular-nums text-xl font-700', s.color)}>{s.value}</div>
                  <div className="text-[10px] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <div className="border-b border-border px-5">
              <TabsList className="bg-transparent h-10 gap-0 p-0">
                {[
                  { value: 'workflows', label: 'Active Workflows', icon: <Activity size={12} /> },
                  { value: 'review', label: 'Review Trail', icon: <Shield size={12} /> },
                  { value: 'sources', label: 'Uploaded Sources', icon: <Folder size={12} /> },
                  { value: 'history', label: 'Prior-Year Context', icon: <History size={12} /> },
                  { value: 'deliverables', label: 'Deliverables', icon: <Package size={12} /> },
                ].map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      'flex items-center gap-1.5 text-xs px-3 py-2 rounded-none border-b-2 border-transparent',
                      'data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent',
                      'text-muted-foreground hover:text-foreground transition-colors'
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto">
              {/* Active Workflows */}
              <TabsContent value="workflows" className="p-5 mt-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-600 text-foreground">Active Workflows</h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {client.workflows.length} workflows across {client.teams.length} tax teams
                    </p>
                  </div>
                  <button
                    onClick={() => toast.info('New workflow — coming soon')}
                    className="text-xs px-3 py-1.5 rounded bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-colors"
                  >
                    + New Workflow
                  </button>
                </div>

                {/* Annual recurring section */}
                <div className="section-divider">
                  <span className="section-divider-label">Annual Recurring Work</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
                  {client.workflows.filter(w => ['wf-fapi', 'wf-t2', 'wf-t1134', 'wf-surplus', 'wf-pillar2'].includes(w.id)).map((wf, i) => (
                    <WorkflowCardItem key={wf.id} wf={wf} index={i} />
                  ))}
                </div>

                {/* Consulting section */}
                <div className="section-divider">
                  <span className="section-divider-label">Consulting Work</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {client.workflows.filter(w => ['wf-ma'].includes(w.id)).map((wf, i) => (
                    <WorkflowCardItem key={wf.id} wf={wf} index={i} />
                  ))}
                </div>
              </TabsContent>

              {/* Review Trail */}
              <TabsContent value="review" className="p-5 mt-0">
                <div className="max-w-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-sm font-600 text-foreground">Review Trail — FAPI Workpaper 2025</h2>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Consultant → Manager → Senior Manager → Partner → Delivery
                      </p>
                    </div>
                    <StatusBadge status="Manager" size="md" />
                  </div>

                  {/* Review stage progress */}
                  <div className="bg-card border border-border rounded p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-600 text-foreground">Review Progress</span>
                      <span className="text-[10px] text-muted-foreground">Stage 2 of 5</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[
                        { label: 'Consultant', done: true },
                        { label: 'Manager', current: true },
                        { label: 'Sr. Manager', done: false },
                        { label: 'Partner', done: false },
                        { label: 'Delivered', done: false },
                      ].map((s, i) => (
                        <div key={s.label} className="flex items-center flex-1">
                          <div className="flex flex-col items-center w-full">
                            <div className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-600',
                              s.done ? 'bg-green-400/20 text-green-400 border border-green-400/40' :
                              s.current ? 'bg-primary/20 text-primary border border-primary/40' :
                              'bg-secondary text-muted-foreground border border-border'
                            )}>
                              {s.done ? '✓' : i + 1}
                            </div>
                            <span className={cn(
                              'text-[9px] mt-1 text-center',
                              s.current ? 'text-primary font-600' : s.done ? 'text-green-400' : 'text-muted-foreground'
                            )}>
                              {s.label}
                            </span>
                          </div>
                          {i < 4 && <div className={cn('h-px flex-1 mx-1 -mt-4', s.done ? 'bg-green-400/40' : 'bg-border')} />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <ReviewTrail />
                </div>
              </TabsContent>

              {/* Uploaded Sources */}
              <TabsContent value="sources" className="p-5 mt-0">
                <div className="max-w-3xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-600 text-foreground">Uploaded Sources</h2>
                    <button
                      onClick={() => toast.info('Upload source — coming soon')}
                      className="text-xs px-3 py-1.5 rounded bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-colors flex items-center gap-1.5"
                    >
                      <Upload size={11} /> Upload
                    </button>
                  </div>
                  <div className="bg-card border border-border rounded overflow-hidden">
                    <table className="workpaper-table">
                      <thead>
                        <tr>
                          <th>File Name</th>
                          <th>Workflow</th>
                          <th>Type</th>
                          <th>Uploaded By</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'Northstar_FAPI_FinancialStatements_2024.xlsx', workflow: 'FAPI Workpaper 2025', type: 'Excel', by: 'Ryan Tran', date: '2025-05-14', status: 'Processed' },
                          { name: 'Northstar_FX_Rates_BoC_Dec2024.pdf', workflow: 'FAPI Workpaper 2025', type: 'PDF', by: 'Ryan Tran', date: '2025-05-14', status: 'Processed' },
                          { name: 'Northstar_T2_TrialBalance_2024.xlsx', workflow: 'T2 Corporate Return 2024', type: 'Excel', by: 'Aisha Kamara', date: '2025-05-10', status: 'Processed' },
                          { name: 'Northstar_T1134_EntityList_2024.xlsx', workflow: 'T1134 Foreign Affiliate 2024', type: 'Excel', by: 'Marcus Webb', date: '2025-05-12', status: 'Processed' },
                          { name: 'ProjectMaple_LOI_Signed.pdf', workflow: 'M&A Transaction Memo', type: 'PDF', by: 'Marcus Webb', date: '2025-05-17', status: 'Pending' },
                          { name: 'Northstar_Pillar2_EntityData_2024.xlsx', workflow: 'Pillar 2 GloBE Assessment', type: 'Excel', by: 'Aisha Kamara', date: '2025-05-13', status: 'Processing' },
                        ].map((f, i) => (
                          <tr key={i}>
                            <td>
                              <div className="flex items-center gap-1.5">
                                <FileText size={11} className="text-muted-foreground shrink-0" />
                                <span className="text-[11px] text-primary hover:underline cursor-pointer" onClick={() => toast.info('File viewer — coming soon')}>
                                  {f.name}
                                </span>
                              </div>
                            </td>
                            <td className="text-[11px]">{f.workflow}</td>
                            <td>
                              <span className={cn(
                                'text-[10px] px-1.5 py-0.5 rounded',
                                f.type === 'Excel' ? 'status-approved' : 'status-info'
                              )}>
                                {f.type}
                              </span>
                            </td>
                            <td className="text-[11px]">{f.by}</td>
                            <td className="text-[11px] tabular-nums">{f.date}</td>
                            <td>
                              <StatusBadge
                                status={f.status === 'Processed' ? 'Approved' : f.status === 'Pending' ? 'Pending' : 'In Progress'}
                                size="sm"
                                showDot={false}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              {/* Prior-Year Context */}
              <TabsContent value="history" className="p-5 mt-0">
                <div className="max-w-3xl">
                  <h2 className="text-sm font-600 text-foreground mb-4">Prior-Year Context</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { year: 'FY 2023', workflows: 6, partner: 'Margaret Chen', status: 'Delivered', notes: 'FAPI net income: CAD 15.2M. No material exceptions. Surplus pool updated.' },
                      { year: 'FY 2022', workflows: 5, partner: 'Margaret Chen', status: 'Delivered', notes: 'First year with Pillar 2 assessment. T1134 filed for 8 foreign affiliates.' },
                      { year: 'FY 2021', workflows: 4, partner: 'David Okafor', status: 'Delivered', notes: 'COVID-related adjustments to FAPI calculations. Treaty positions reviewed.' },
                    ].map((y, i) => (
                      <div key={i} className="bg-card border border-border rounded p-4 animate-fade-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-600 text-foreground">{y.year}</span>
                          <StatusBadge status="Complete" size="sm" />
                        </div>
                        <div className="text-[11px] text-muted-foreground mb-2">{y.workflows} workflows · Lead: {y.partner}</div>
                        <p className="text-[11px] text-foreground/70 leading-relaxed">{y.notes}</p>
                        <button
                          onClick={() => toast.info('Prior-year workpapers — coming soon')}
                          className="mt-2 text-[10px] text-primary hover:underline"
                        >
                          View workpapers →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Deliverables */}
              <TabsContent value="deliverables" className="p-5 mt-0">
                <div className="max-w-3xl">
                  <h2 className="text-sm font-600 text-foreground mb-4">Deliverables</h2>
                  <div className="bg-card border border-border rounded overflow-hidden">
                    <table className="workpaper-table">
                      <thead>
                        <tr>
                          <th>Deliverable</th>
                          <th>Workflow</th>
                          <th>Format</th>
                          <th>Status</th>
                          <th>Partner Sign-off</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'FAPI Workpaper 2025', workflow: 'FAPI Workpaper 2025', format: 'Excel + PDF', status: 'Pending', signoff: false },
                          { name: 'T2 Corporate Return 2024', workflow: 'T2 Corporate Return 2024', format: 'Taxprep', status: 'In Progress', signoff: false },
                          { name: 'T1134 Foreign Affiliate 2024', workflow: 'T1134 Foreign Affiliate 2024', format: 'Taxprep', status: 'In Progress', signoff: false },
                          { name: 'M&A Transaction Memo', workflow: 'M&A Transaction Memo', format: 'PowerPoint + PDF', status: 'Under Review', signoff: false },
                          { name: 'Pillar 2 GloBE Assessment', workflow: 'Pillar 2 GloBE Assessment', format: 'Excel + JSON', status: 'At Risk', signoff: false },
                        ].map((d, i) => (
                          <tr key={i}>
                            <td className="font-500 text-[11px]">{d.name}</td>
                            <td className="text-[11px] text-muted-foreground">{d.workflow}</td>
                            <td>
                              <span className="text-[10px] status-info px-1.5 py-0.5 rounded">{d.format}</span>
                            </td>
                            <td><StatusBadge status={d.status as any} size="sm" /></td>
                            <td>
                              <div className="flex items-center gap-1">
                                <div className={cn('w-2 h-2 rounded-full', d.signoff ? 'bg-green-400' : 'bg-border')} />
                                <span className="text-[10px] text-muted-foreground">{d.signoff ? 'Signed' : 'Pending'}</span>
                              </div>
                            </td>
                            <td>
                              <button
                                onClick={() => toast.info('Output generation — coming soon')}
                                className="text-[10px] text-primary hover:underline"
                              >
                                Generate
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </AppShell>
  );
}
