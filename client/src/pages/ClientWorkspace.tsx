// Screen 2: Client Workspace
// Design: Clean, task-focused. Client switcher at top.
// Workflow cards show only the essentials by default; details expand via accordion.
// Palette: grayscale + deep navy (#0F2044), status colors only for signals.

import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import {
  Building2, ChevronDown, ChevronRight,
  AlertTriangle, CheckCircle2, Clock, Upload,
  Star, Activity, Users, Calendar, FileText,
  Shield, Folder, History, Package
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

// ─── Review stage pipeline ─────────────────────────────────────────────────────
const REVIEW_STAGES: Array<WorkflowCard['reviewStage']> = [
  'Consultant', 'Manager', 'Senior Manager', 'Partner', 'Delivered'
];

// ─── Workflow card — collapsed by default, expand to see details ───────────────
function WorkflowCardItem({ wf }: { wf: WorkflowCard }) {
  const [expanded, setExpanded] = useState(false);
  const isFapi = wf.id === 'wf-fapi';
  const currentStageIdx = REVIEW_STAGES.indexOf(wf.reviewStage);
  const isAtRisk = wf.status === 'At Risk';

  return (
    <div
      className={cn(
        'bg-white border rounded-xl overflow-hidden transition-all duration-150',
        isAtRisk ? 'border-red-300' : 'border-slate-200',
        'hover:border-slate-300 hover:shadow-sm'
      )}
    >
      {/* ── Always-visible row ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Status dot */}
        <div className={cn(
          'w-2 h-2 rounded-full shrink-0',
          isAtRisk ? 'bg-red-500' :
          wf.status === 'Complete' ? 'bg-emerald-500' :
          wf.status === 'In Progress' ? 'bg-blue-500' :
          wf.status === 'Under Review' ? 'bg-amber-500' :
          'bg-slate-300'
        )} />

        {/* Name + team */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold text-slate-800 truncate">{wf.name}</span>
            {isAtRisk && (
              <span className="flex items-center gap-1 text-[10px] text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                <AlertTriangle size={9} />
                At Risk
              </span>
            )}
            {wf.status === 'Under Review' && (
              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                Under Review
              </span>
            )}
            {wf.status === 'Complete' && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                <CheckCircle2 size={9} />
                Complete
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <TeamBadge
              name={wf.team}
              color={wf.teamColor}
              abbreviation={TAX_TEAMS.find(t => t.name === wf.team)?.abbreviation}
            />
            <span className="text-[10px] text-slate-400">FY {wf.year}</span>
            <span className="text-[10px] text-slate-400">·</span>
            <span className="text-[10px] text-slate-400">Due {wf.dueDate}</span>
            {wf.exceptions !== undefined && wf.exceptions > 0 && (
              <>
                <span className="text-[10px] text-slate-400">·</span>
                <span className="text-[10px] text-red-600 font-medium">{wf.exceptions} exception{wf.exceptions !== 1 ? 's' : ''}</span>
              </>
            )}
            {wf.openItems !== undefined && wf.openItems > 0 && (
              <>
                <span className="text-[10px] text-slate-400">·</span>
                <span className="text-[10px] text-amber-600 font-medium">{wf.openItems} open item{wf.openItems !== 1 ? 's' : ''}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Open Workflow button */}
          {isFapi ? (
            <a href="/workflow/fapi">
              <button className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#0F2044] text-white hover:bg-[#1a3060] active:scale-95 transition-all duration-100">
                Open Workflow →
              </button>
            </a>
          ) : (
            <button
              onClick={() => toast.info('Workflow execution — coming soon')}
              className="text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800 transition-colors"
            >
              Open Workflow
            </button>
          )}

          {/* View details toggle */}
          <button
            onClick={() => setExpanded(v => !v)}
            className={cn(
              'flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg border transition-colors',
              expanded
                ? 'border-slate-300 bg-slate-50 text-slate-700'
                : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'
            )}
          >
            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            <span>Details</span>
          </button>
        </div>
      </div>

      {/* ── Expandable details ─────────────────────────────────────────────── */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-4 space-y-4">

          {/* Review stage pipeline */}
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Review Stage</div>
            <div className="flex items-center gap-0">
              {REVIEW_STAGES.map((stage, i) => {
                const isDone = i < currentStageIdx;
                const isCurrent = i === currentStageIdx;
                const isLast = i === REVIEW_STAGES.length - 1;
                return (
                  <div key={stage} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-2.5 h-2.5 rounded-full border',
                        isDone ? 'bg-emerald-500 border-emerald-500' :
                        isCurrent ? 'bg-[#0F2044] border-[#0F2044]' :
                        'bg-white border-slate-300'
                      )} />
                      <span className={cn(
                        'text-[9px] mt-1 whitespace-nowrap',
                        isCurrent ? 'text-[#0F2044] font-semibold' :
                        isDone ? 'text-emerald-600' :
                        'text-slate-400'
                      )}>
                        {stage === 'Senior Manager' ? 'Sr. Mgr' : stage}
                      </span>
                    </div>
                    {!isLast && (
                      <div className={cn('flex-1 h-px mx-1 mb-3', isDone ? 'bg-emerald-400/50' : 'bg-slate-200')} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team */}
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Team</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {[
                { role: 'Preparer', name: wf.preparer },
                { role: 'Manager', name: wf.manager },
                { role: 'Sr. Manager', name: wf.seniorManager },
                { role: 'Partner', name: wf.partner },
              ].map(m => (
                <div key={m.role} className="flex items-center gap-2">
                  <AvatarInitials
                    initials={m.name.split(' ').map(n => n[0]).join('')}
                    name={m.name}
                    size="xs"
                  />
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider">{m.role}</div>
                    <div className="text-[11px] text-slate-700 font-medium">{m.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Milestones</div>
            <div className="space-y-1.5">
              {[
                { label: 'Source documents received', done: true },
                { label: 'First draft complete', done: currentStageIdx >= 1 },
                { label: 'Manager review', done: currentStageIdx >= 2 },
                { label: 'Partner sign-off', done: currentStageIdx >= 4 },
                { label: 'Delivered to client', done: wf.status === 'Complete' },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={cn(
                    'w-4 h-4 rounded-full flex items-center justify-center shrink-0',
                    m.done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  )}>
                    {m.done ? <CheckCircle2 size={10} /> : <Clock size={9} />}
                  </div>
                  <span className={cn(
                    'text-[11px]',
                    m.done ? 'text-slate-600 line-through' : 'text-slate-700'
                  )}>
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Last activity */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1 border-t border-slate-200">
            <Activity size={10} />
            <span>Last activity: {wf.lastActivity}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Client Workspace Page ────────────────────────────────────────────────────
export default function ClientWorkspace() {
  // Determine which client to show based on route param
  const [, params] = useRoute('/client/:clientId');
  const clientId = params?.clientId ?? 'northstar';
  const [selectedClientId, setSelectedClientId] = useState(clientId);
  const [, navigate] = useLocation();

  const client = CLIENTS.find(c => c.id === selectedClientId) ?? CLIENTS[0];
  const [activeTab, setActiveTab] = useState('workflows');

  const teams = client.teams.map(name => TAX_TEAMS.find(t => t.name === name)).filter(Boolean);
  const partners = TEAM_MEMBERS.filter(m => client.partners.includes(m.name));

  function handleClientChange(id: string) {
    setSelectedClientId(id);
    navigate(`/client/${id}`);
  }

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Practitioner Dashboard', href: '/dashboard' },
        { label: client.name },
      ]}
      actions={
        <button
          onClick={() => toast.info('Upload documents — coming soon')}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
        >
          <Upload size={12} />
          <span className="hidden sm:inline">Upload</span>
        </button>
      }
    >
      <div className="flex flex-col h-full">

        {/* ── Client header ──────────────────────────────────────────────────── */}
        <div className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-4">
            {/* Client logo */}
            <div className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
              <Building2 size={20} className="text-[#0F2044]" />
            </div>

            {/* Client selector + meta */}
            <div className="flex-1 min-w-0">
              {/* Client name as dropdown */}
              <div className="flex items-center gap-2 mb-1.5">
                <div className="relative group">
                  <button className="flex items-center gap-1.5 text-[17px] font-bold text-[#0F2044] hover:text-[#1a3060] transition-colors">
                    {client.name}
                    <ChevronDown size={15} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </button>
                  {/* Dropdown */}
                  <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 min-w-[240px] py-1.5 hidden group-hover:block">
                    {CLIENTS.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleClientChange(c.id)}
                        className={cn(
                          'flex items-center gap-3 w-full text-left px-3 py-2 transition-colors',
                          c.id === selectedClientId
                            ? 'bg-slate-50 text-[#0F2044]'
                            : 'text-slate-700 hover:bg-slate-50'
                        )}
                      >
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <Building2 size={13} className="text-slate-500" />
                        </div>
                        <div>
                          <div className="text-[12px] font-semibold">{c.name}</div>
                          <div className="text-[10px] text-slate-400">{c.leadPartner} · {c.tier}</div>
                        </div>
                        {c.id === selectedClientId && (
                          <CheckCircle2 size={13} className="text-emerald-500 ml-auto shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <span className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full font-semibold border',
                  client.tier === 'Platinum' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  client.tier === 'Strategic' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-slate-50 text-slate-600 border-slate-200'
                )}>
                  {client.tier}
                </span>
                {client.tier === 'Platinum' && (
                  <Star size={11} className="text-amber-500" />
                )}
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Lead Partner</span>
                  <AvatarInitials
                    initials={client.leadPartner.split(' ').map(n => n[0]).join('')}
                    name={client.leadPartner}
                    size="xs"
                  />
                  <span className="text-[11px] text-slate-700 font-medium">{client.leadPartner}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Partners</span>
                  <div className="flex -space-x-1">
                    {partners.map(p => (
                      <AvatarInitials key={p!.id} initials={p!.initials} name={p!.name} size="xs" />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Teams</span>
                  {teams.map(t => t && (
                    <TeamBadge key={t.id} name={t.name} color={t.color} abbreviation={t.abbreviation} />
                  ))}
                </div>
              </div>
            </div>

            {/* Quick stats — only workflow count and due items */}
            <div className="hidden lg:flex items-center gap-5 shrink-0 border-l border-slate-100 pl-5">
              <div className="text-center">
                <div className="text-xl font-bold text-[#0F2044] tabular-nums">{client.workflows.length}</div>
                <div className="text-[10px] text-slate-400">Workflows</div>
              </div>
              {client.atRiskDeliverables > 0 && (
                <div className="text-center">
                  <div className="text-xl font-bold text-red-500 tabular-nums">{client.atRiskDeliverables}</div>
                  <div className="text-[10px] text-slate-400">At Risk</div>
                </div>
              )}
              {client.openReviewItems > 0 && (
                <div className="text-center">
                  <div className="text-xl font-bold text-amber-600 tabular-nums">{client.openReviewItems}</div>
                  <div className="text-[10px] text-slate-400">Open Reviews</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <div className="border-b border-slate-200 bg-white px-5">
              <TabsList className="bg-transparent h-10 gap-0 p-0">
                {[
                  { value: 'workflows',    label: 'Active Workflows',   icon: <Activity size={12} /> },
                  { value: 'review',       label: 'Review Trail',        icon: <Shield size={12} /> },
                  { value: 'sources',      label: 'Sources',             icon: <Folder size={12} /> },
                  { value: 'history',      label: 'Prior-Year',          icon: <History size={12} /> },
                  { value: 'deliverables', label: 'Deliverables',        icon: <Package size={12} /> },
                ].map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      'flex items-center gap-1.5 text-xs px-3 py-2 rounded-none border-b-2 border-transparent',
                      'data-[state=active]:border-[#0F2044] data-[state=active]:text-[#0F2044] data-[state=active]:bg-transparent',
                      'text-slate-400 hover:text-slate-600 transition-colors'
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto bg-slate-50">

              {/* ── Active Workflows ──────────────────────────────────────── */}
              <TabsContent value="workflows" className="p-5 mt-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">Active Workflows</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {client.workflows.length} workflows · click "Details" to expand team, milestones & review stage
                    </p>
                  </div>
                  <button
                    onClick={() => toast.info('New workflow — coming soon')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#0F2044] text-white hover:bg-[#1a3060] transition-colors"
                  >
                    + New Workflow
                  </button>
                </div>

                {/* Annual recurring */}
                <div className="mb-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2">Annual Recurring</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                  <div className="space-y-2">
                    {client.workflows
                      .filter(w => ['wf-fapi', 'wf-t2', 'wf-t1134', 'wf-surplus', 'wf-pillar2'].includes(w.id))
                      .map(wf => <WorkflowCardItem key={wf.id} wf={wf} />)}
                  </div>
                </div>

                {/* Consulting */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2">Consulting</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                  <div className="space-y-2">
                    {client.workflows
                      .filter(w => ['wf-ma'].includes(w.id))
                      .map(wf => <WorkflowCardItem key={wf.id} wf={wf} />)}
                  </div>
                </div>
              </TabsContent>

              {/* ── Review Trail ──────────────────────────────────────────── */}
              <TabsContent value="review" className="p-5 mt-0">
                <div className="max-w-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-800">Review Trail — FAPI Workpaper 2025</h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">Consultant → Manager → Senior Manager → Partner → Delivery</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {FAPI_REVIEW_TRAIL.map(item => (
                      <div key={item.id} className="relative pl-6">
                        <div
                          className="absolute left-0 top-2 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                          style={{
                            borderColor: item.type === 'change-request' ? '#d97706' : item.type === 'approval' ? '#059669' : '#3b82f6',
                            backgroundColor: item.type === 'change-request' ? '#fef3c710' : item.type === 'approval' ? '#d1fae510' : '#eff6ff10',
                          }}
                        >
                          {item.type === 'change-request' ? <AlertTriangle size={8} className="text-amber-600" /> :
                           item.type === 'approval' ? <CheckCircle2 size={8} className="text-emerald-600" /> :
                           <FileText size={8} className="text-blue-500" />}
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <AvatarInitials initials={item.author.split(' ').map(n => n[0]).join('')} name={item.author} size="xs" />
                              <span className="text-xs font-semibold text-slate-800">{item.author}</span>
                              <span className="text-[10px] text-slate-400">{item.role}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.type === 'change-request' && (
                                <span className={cn(
                                  'text-[10px] px-1.5 py-0.5 rounded-full border',
                                  item.resolved
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                )}>
                                  {item.resolved ? 'Resolved' : 'Open'}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">{item.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* ── Sources ───────────────────────────────────────────────── */}
              <TabsContent value="sources" className="p-5 mt-0">
                <div className="max-w-3xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-slate-800">Uploaded Sources</h2>
                    <button
                      onClick={() => toast.info('Upload source — coming soon')}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[#0F2044] text-white hover:bg-[#1a3060] transition-colors flex items-center gap-1.5"
                    >
                      <Upload size={11} /> Upload
                    </button>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          {['File Name', 'Workflow', 'Type', 'Uploaded By', 'Date', 'Status'].map(h => (
                            <th key={h} className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">{h}</th>
                          ))}
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
                          <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-1.5">
                                <FileText size={11} className="text-slate-400 shrink-0" />
                                <span className="text-[11px] text-[#0F2044] hover:underline cursor-pointer" onClick={() => toast.info('File viewer — coming soon')}>
                                  {f.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-[11px] text-slate-600">{f.workflow}</td>
                            <td className="px-3 py-2">
                              <span className={cn(
                                'text-[10px] px-1.5 py-0.5 rounded-full border',
                                f.type === 'Excel' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                              )}>
                                {f.type}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-[11px] text-slate-600">{f.by}</td>
                            <td className="px-3 py-2 text-[11px] text-slate-500 tabular-nums">{f.date}</td>
                            <td className="px-3 py-2">
                              <span className={cn(
                                'text-[10px] px-1.5 py-0.5 rounded-full border',
                                f.status === 'Processed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                f.status === 'Pending' ? 'bg-slate-50 text-slate-500 border-slate-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              )}>
                                {f.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              {/* ── Prior-Year ────────────────────────────────────────────── */}
              <TabsContent value="history" className="p-5 mt-0">
                <div className="max-w-3xl">
                  <h2 className="text-sm font-semibold text-slate-800 mb-4">Prior-Year Context</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { year: 'FY 2023', workflows: 6, partner: 'Margaret Chen', notes: 'FAPI net income: CAD 15.2M. No material exceptions. Surplus pool updated.' },
                      { year: 'FY 2022', workflows: 5, partner: 'Margaret Chen', notes: 'First year with Pillar 2 assessment. T1134 filed for 8 foreign affiliates.' },
                      { year: 'FY 2021', workflows: 4, partner: 'David Okafor', notes: 'COVID-related adjustments to FAPI calculations. Treaty positions reviewed.' },
                    ].map((y, i) => (
                      <div key={i} className="bg-white border border-slate-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-[#0F2044]">{y.year}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Delivered</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mb-2">{y.workflows} workflows · {y.partner}</div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{y.notes}</p>
                        <button
                          onClick={() => toast.info('Prior-year workpapers — coming soon')}
                          className="mt-3 text-[10px] text-[#0F2044] font-semibold hover:underline"
                        >
                          View workpapers →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* ── Deliverables ──────────────────────────────────────────── */}
              <TabsContent value="deliverables" className="p-5 mt-0">
                <div className="max-w-3xl">
                  <h2 className="text-sm font-semibold text-slate-800 mb-4">Deliverables</h2>
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          {['Deliverable', 'Format', 'Status', 'Partner Sign-off', 'Action'].map(h => (
                            <th key={h} className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'FAPI Workpaper 2025', format: 'Excel + PDF', status: 'Pending', signoff: false },
                          { name: 'T2 Corporate Return 2024', format: 'Taxprep', status: 'In Progress', signoff: false },
                          { name: 'T1134 Foreign Affiliate 2024', format: 'Taxprep', status: 'In Progress', signoff: false },
                          { name: 'M&A Transaction Memo', format: 'PowerPoint + PDF', status: 'Under Review', signoff: false },
                          { name: 'Pillar 2 GloBE Assessment', format: 'Excel + JSON', status: 'At Risk', signoff: false },
                        ].map((d, i) => (
                          <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                            <td className="px-3 py-2 text-[12px] font-semibold text-slate-800">{d.name}</td>
                            <td className="px-3 py-2">
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{d.format}</span>
                            </td>
                            <td className="px-3 py-2">
                              <span className={cn(
                                'text-[10px] px-1.5 py-0.5 rounded-full border',
                                d.status === 'At Risk' ? 'bg-red-50 text-red-700 border-red-200' :
                                d.status === 'Under Review' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                d.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-slate-50 text-slate-500 border-slate-200'
                              )}>
                                {d.status}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-1.5">
                                <div className={cn('w-2 h-2 rounded-full', d.signoff ? 'bg-emerald-500' : 'bg-slate-300')} />
                                <span className="text-[10px] text-slate-500">{d.signoff ? 'Signed' : 'Pending'}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => toast.info('Output generation — coming soon')}
                                className="text-[11px] text-[#0F2044] font-semibold hover:underline"
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
