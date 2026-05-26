// Workbench — Sinaxe TaxWorkbench home screen
// Design: Task-first workspace. Centered title + chat prompt + HORIZONTAL tool categories below.
// Categories are shown as a horizontal scrollable row of pill/tab buttons.
// Clicking a category opens a dropdown panel below showing its tools in a grid.
// Palette: White background, slate text, deep navy accents.

import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowRight, ChevronDown,
  History, Mail, Calendar, MessageSquare,
  Calculator, BookOpen, FileSpreadsheet, Globe, Cpu,
  Lightbulb, FileText, Search, Mic, Plus,
  Send, Users, ClipboardList, Scale, TrendingUp, Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AppShell from '@/components/AppShell';
import { toast } from 'sonner';

// ─── Tool category definitions ────────────────────────────────────────────────
const TOOL_CATEGORIES = [
  {
    id: 'recent',
    label: 'Pick up where you left off',
    icon: History,
    accent: '#0F2044',
    single: true,
    action: () => { window.location.href = '/workflow/fapi'; },
    description: 'FAPI Workpaper 2025 — Northstar Holdings · Last opened 2h ago',
    tools: [] as { id: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; description: string; href?: string }[],
  },
  {
    id: 'correspondence',
    label: 'Client Correspondence',
    icon: Mail,
    accent: '#1B5FD4',
    single: false,
    action: undefined,
    description: '',
    tools: [
      { id: 'irl',     label: 'Send IRL',       icon: Send,          description: 'Draft and send an information request letter' },
      { id: 'meeting', label: 'Request Meeting', icon: Calendar,      description: 'Schedule a client meeting with agenda' },
      { id: 'followup',label: 'Follow Up',       icon: MessageSquare, description: 'Send a follow-up on outstanding items' },
    ],
  },
  {
    id: 'compliance',
    label: 'Tax Compliance Tools',
    icon: Calculator,
    accent: '#0F2044',
    single: false,
    action: undefined,
    description: '',
    tools: [
      { id: 'fapi',       label: 'FAPI Calculator',        icon: Globe,           description: 'Foreign accrual property income calculations' },
      { id: 'surplus',    label: 'Surplus Calculator',     icon: TrendingUp,      description: 'Exempt, taxable, and hybrid surplus analysis' },
      { id: 'eifel',      label: 'EIFEL Calculator',       icon: Calculator,      description: 'Excessive interest and financing expenses' },
      { id: 'safeincome', label: 'Safe Income Calculator', icon: Scale,           description: 'Safe income on hand for dividend planning' },
      { id: 't2',         label: 'T2 Workbook',            icon: FileSpreadsheet, description: 'Corporate income tax return workbook' },
      { id: 't1134',      label: 'T1134 Workbook',         icon: BookOpen,        description: 'Foreign affiliate information return' },
    ],
  },
  {
    id: 'consulting',
    label: 'Tax Consulting Tools',
    icon: Lightbulb,
    accent: '#1B5FD4',
    single: false,
    action: undefined,
    description: '',
    tools: [
      { id: 'stepplan', label: 'Step Plan Builder', icon: ClipboardList, description: 'Build a structured tax step plan for transactions' },
      { id: 'memo',     label: 'Memo Writer',       icon: FileText,      description: 'Draft a tax opinion or advisory memo' },
    ],
  },
  {
    id: 'research',
    label: 'Tax Research',
    icon: Search,
    accent: '#0F2044',
    single: false,
    action: undefined,
    description: '',
    tools: [
      { id: 'caselaw',  label: 'Case Law Search',    icon: Scale,    description: 'Search CRA rulings, Tax Court decisions' },
      { id: 'ita',      label: 'ITA Navigator',      icon: BookOpen, description: 'Browse and annotate the Income Tax Act' },
      { id: 'treaty',   label: 'Treaty Analyser',    icon: Globe,    description: 'Compare treaty provisions across jurisdictions' },
    ],
  },
  {
    id: 'client',
    label: 'Client Management',
    icon: Users,
    accent: '#1B5FD4',
    single: false,
    action: undefined,
    description: '',
    tools: [
      { id: 'workspace',  label: 'Client Workspace',  icon: Briefcase, description: "Open a client's full engagement workspace", href: '/client/northstar' },
      { id: 'dashboard',  label: 'Practitioner View', icon: Cpu,       description: 'See all your active workstreams',           href: '/dashboard' },
      { id: 'buoverview', label: 'BU Overview',       icon: Globe,     description: 'Executive view across all LOS',             href: '/bu-overview' },
    ],
  },
];

// ─── Tool grid item ────────────────────────────────────────────────────────────
function ToolItem({
  tool,
  accent,
}: {
  tool: { id: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; description: string; href?: string };
  accent: string;
}) {
  const Icon = tool.icon;
  return (
    <button
      onClick={() => {
        if (tool.href) { window.location.href = tool.href; return; }
        toast.info(`${tool.label} — coming soon`);
      }}
      className={cn(
        'flex items-start gap-3 w-full text-left px-3 py-3 rounded-xl border border-transparent',
        'hover:bg-slate-50 hover:border-slate-200 transition-all duration-100 group'
      )}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${accent}10`, border: `1px solid ${accent}18` }}
      >
        <Icon size={16} className="text-slate-600" />
      </div>
      <div className="min-w-0 pt-0.5">
        <div className="text-[13px] font-600 text-slate-800 group-hover:text-[#0F2044] transition-colors leading-tight">
          {tool.label}
        </div>
        <div className="text-[11px] text-slate-400 leading-snug mt-0.5">{tool.description}</div>
      </div>
    </button>
  );
}

// ─── Main Workbench page ──────────────────────────────────────────────────────
export default function Workbench() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [, navigate] = useLocation();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    toast.info(`AI assistant: "${query}" — coming soon`);
    setQuery('');
  }

  function handleCategoryClick(cat: typeof TOOL_CATEGORIES[number]) {
    if (cat.single && cat.action) {
      cat.action();
      return;
    }
    setActiveCategory(prev => prev === cat.id ? null : cat.id);
  }

  const activeCat = TOOL_CATEGORIES.find(c => c.id === activeCategory);

  return (
    <AppShell hideTopBar>
      {/* Full-height centered workspace */}
      <div className="flex flex-col items-center justify-start min-h-full px-6 pt-14 pb-10">

        {/* ── Title ─────────────────────────────────────────────────────────── */}
        <div className="text-center mb-8 select-none">
          <h1 className="text-[30px] font-800 text-[#0F2044] leading-none tracking-tight">
            Sinaxe
            <sup className="text-[14px] font-500 text-slate-400 ml-0.5 align-super">™</sup>
            {' '}
            <span className="font-400 text-slate-600">TaxWorkbench</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2">Your intelligent tax workspace</p>
        </div>

        {/* ── Chat prompt ───────────────────────────────────────────────────── */}
        <div className="w-full max-w-2xl mb-6">
          <form
            onSubmit={handleSubmit}
            className={cn(
              'relative bg-white border border-slate-200 rounded-2xl shadow-sm',
              'focus-within:border-[#0F2044]/40 focus-within:shadow-md transition-all duration-200'
            )}
          >
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
              placeholder="What do you want to work on?"
              rows={3}
              className={cn(
                'w-full resize-none bg-transparent px-5 pt-4 pb-12 text-[15px] text-slate-800',
                'placeholder:text-slate-400 focus:outline-none rounded-2xl'
              )}
            />
            {/* Bottom toolbar */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toast.info('Attach file — coming soon')}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Plus size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => toast.info('Voice input — coming soon')}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Mic size={16} />
                </button>
              </div>
              <button
                type="submit"
                disabled={!query.trim()}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-600 transition-all duration-150',
                  query.trim()
                    ? 'bg-[#0F2044] text-white hover:bg-[#1a3060] active:scale-95'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                )}
              >
                <ArrowRight size={13} />
                Ask
              </button>
            </div>
          </form>
        </div>

        {/* ── Horizontal category tabs ──────────────────────────────────────── */}
        <div className="w-full max-w-2xl">
          {/* Scrollable pill row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {TOOL_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[12px] font-600 whitespace-nowrap',
                    'transition-all duration-150 shrink-0',
                    isActive
                      ? 'bg-[#0F2044] text-white border-[#0F2044] shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  <Icon
                    size={14}
                    className={isActive ? 'text-white' : 'text-slate-400'}
                  />
                  {cat.label}
                  {!cat.single && (
                    <ChevronDown
                      size={12}
                      className={cn(
                        'transition-transform duration-150',
                        isActive ? 'rotate-180 text-white/70' : 'text-slate-300'
                      )}
                    />
                  )}
                  {cat.single && (
                    <ArrowRight
                      size={12}
                      className={isActive ? 'text-white/70' : 'text-slate-300'}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Expanded tool panel ─────────────────────────────────────────── */}
          {activeCat && !activeCat.single && activeCat.tools.length > 0 && (
            <div className="mt-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fade-slide-up">
              {/* Panel header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
                {(() => {
                  const Icon = activeCat.icon;
                  return (
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${activeCat.accent}10`, border: `1px solid ${activeCat.accent}18` }}
                    >
                      <Icon size={14} className="text-slate-600" />
                    </div>
                  );
                })()}
                <span className="text-[12px] font-700 text-slate-700 uppercase tracking-wider flex-1">
                  {activeCat.label}
                </span>
                <span className="text-[11px] text-slate-400">{activeCat.tools.length} tools</span>
              </div>
              {/* Tools grid */}
              <div className={cn(
                'p-3',
                activeCat.tools.length > 2
                  ? 'grid grid-cols-2 gap-1'
                  : 'flex flex-col gap-1'
              )}>
                {activeCat.tools.map(tool => (
                  <ToolItem key={tool.id} tool={tool} accent={activeCat.accent} />
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}
