// Workbench — Sinaxe TaxWorkbench home screen
// Design: Task-first workspace. Centered title + chat prompt.
// Below the chat: 4 large rounded-square category tiles + a "+" button that reveals the rest on hover.
// Clicking a tile opens its tool panel below. Palette: white bg, slate text, deep navy accents.

import { useState, useRef } from 'react';
import {
  ArrowRight, ChevronDown,
  History, Mail,
  Calculator, BookOpen, FileSpreadsheet, Globe, Cpu,
  Lightbulb, FileText, Search, Mic, Plus,
  Send, Users, ClipboardList, Scale, TrendingUp, Briefcase,
  ShieldCheck, PenLine, Receipt, DollarSign, Calendar, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AppShell from '@/components/AppShell';
import { toast } from 'sonner';

// ─── Tool category definitions ────────────────────────────────────────────────
const TOOL_CATEGORIES = [
  {
    id: 'recent',
    label: 'Pick up where\nyou left off',
    labelShort: 'Recent',
    icon: History,
    accent: '#0F2044',
    single: true,
    action: () => { window.location.href = '/workflow/fapi'; },
    description: 'FAPI Workpaper 2025 — Northstar Holdings · Last opened 2h ago',
    tools: [] as ToolDef[],
  },
  {
    id: 'correspondence',
    label: 'Client\nCorrespondence',
    labelShort: 'Correspondence',
    icon: Mail,
    accent: '#1B5FD4',
    single: false,
    action: undefined,
    description: '',
    tools: [
      { id: 'irl',      label: 'Send IRL',        icon: Send,          description: 'Draft and send an information request letter' },
      { id: 'meeting',  label: 'Request Meeting',  icon: Calendar,      description: 'Schedule a client meeting with agenda' },
      { id: 'followup', label: 'Follow Up',         icon: MessageSquare, description: 'Send a follow-up on outstanding items' },
    ],
  },
  {
    id: 'compliance',
    label: 'Tax Compliance\nTools',
    labelShort: 'Compliance',
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
    label: 'Tax Consulting\nTools',
    labelShort: 'Consulting',
    icon: Lightbulb,
    accent: '#1B5FD4',
    single: false,
    action: undefined,
    description: '',
    tools: [
      { id: 'stepplan', label: 'Step Plan Builder', icon: ClipboardList, description: 'Build a structured tax step plan for transactions' },
      { id: 'memo',     label: 'Memo Writer',        icon: FileText,      description: 'Draft a tax opinion or advisory memo' },
    ],
  },
  // ── overflow (shown in + popover) ──────────────────────────────────────────
  {
    id: 'research',
    label: 'Tax Research',
    labelShort: 'Research',
    icon: Search,
    accent: '#0F2044',
    single: false,
    action: undefined,
    description: '',
    tools: [
      { id: 'caselaw', label: 'Case Law Search', icon: Scale,    description: 'Search CRA rulings, Tax Court decisions' },
      { id: 'ita',     label: 'ITA Navigator',   icon: BookOpen, description: 'Browse and annotate the Income Tax Act' },
      { id: 'treaty',  label: 'Treaty Analyser', icon: Globe,    description: 'Compare treaty provisions across jurisdictions' },
    ],
  },
  {
    id: 'risk',
    label: 'Risk &\nContracting',
    labelShort: 'Risk & Contracting',
    icon: ShieldCheck,
    accent: '#0F2044',
    single: false,
    action: undefined,
    description: '',
    tools: [
      { id: 'engagement', label: 'Engagement Letter', icon: PenLine,    description: 'Draft and manage client engagement letters' },
      { id: 'mfe',        label: 'MFE',               icon: Receipt,    description: 'Maximum fee estimate and scope management' },
      { id: 'billing',    label: 'Billing',            icon: DollarSign, description: 'Time entry, invoicing, and WIP management' },
    ],
  },
  {
    id: 'client',
    label: 'Client\nManagement',
    labelShort: 'Client Mgmt',
    icon: Users,
    accent: '#1B5FD4',
    single: false,
    action: undefined,
    description: '',
    tools: [
      { id: 'workspace',  label: 'Client Workspace',  icon: Briefcase, description: "Open a client's full engagement workspace", href: '/client/northstar' },
      { id: 'dashboard',  label: 'Practitioner View', icon: Cpu,       description: 'See all your active workstreams',           href: '/dashboard' },
      { id: 'buoverview', label: 'BU Overview',        icon: Globe,     description: 'Executive view across all LOS',             href: '/bu-overview' },
    ],
  },
];

type ToolDef = {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
  href?: string;
};

type Category = typeof TOOL_CATEGORIES[number];

const PRIMARY_CATS = TOOL_CATEGORIES.slice(0, 4);
const OVERFLOW_CATS = TOOL_CATEGORIES.slice(4);

// ─── Tool grid item ────────────────────────────────────────────────────────────
function ToolItem({ tool, accent }: { tool: ToolDef; accent: string }) {
  const Icon = tool.icon;
  return (
    <button
      onClick={() => {
        if (tool.href) { window.location.href = tool.href; return; }
        toast.info(`${tool.label} — coming soon`);
      }}
      className="flex items-start gap-3 w-full text-left px-3 py-3 rounded-xl border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-all duration-100 group"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${accent}10`, border: `1px solid ${accent}18` }}
      >
        <Icon size={16} className="text-slate-600" />
      </div>
      <div className="min-w-0 pt-0.5">
        <div className="text-[13px] font-semibold text-slate-800 group-hover:text-[#0F2044] transition-colors leading-tight">
          {tool.label}
        </div>
        <div className="text-[11px] text-slate-400 leading-snug mt-0.5">{tool.description}</div>
      </div>
    </button>
  );
}

// ─── Expanded tool panel ──────────────────────────────────────────────────────
function ToolPanel({ cat }: { cat: Category }) {
  const Icon = cat.icon;
  return (
    <div className="mt-4 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" style={{ animation: 'fadeSlideUp 150ms ease-out' }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${cat.accent}10`, border: `1px solid ${cat.accent}18` }}
        >
          <Icon size={14} className="text-slate-600" />
        </div>
        <span className="text-[12px] font-bold text-slate-700 uppercase tracking-wider flex-1">
          {cat.labelShort}
        </span>
        <span className="text-[11px] text-slate-400">{cat.tools.length} tools</span>
      </div>
      <div className={cn('p-3', cat.tools.length > 2 ? 'grid grid-cols-2 gap-1' : 'flex flex-col gap-1')}>
        {cat.tools.map(tool => (
          <ToolItem key={tool.id} tool={tool} accent={cat.accent} />
        ))}
      </div>
    </div>
  );
}

// ─── Large square category tile ───────────────────────────────────────────────
function CategoryTile({ cat, isActive, onClick }: { cat: Category; isActive: boolean; onClick: () => void }) {
  const Icon = cat.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-2xl border transition-all duration-150 select-none',
        'w-[130px] h-[110px] shrink-0 text-center',
        isActive
          ? 'bg-[#0F2044] text-white border-[#0F2044] shadow-md'
          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm'
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-150',
          isActive ? 'bg-white/15' : 'bg-slate-100'
        )}
      >
        <Icon size={20} className={isActive ? 'text-white' : 'text-slate-500'} />
      </div>
      <span
        className={cn(
          'text-[12px] font-semibold leading-tight whitespace-pre-line px-2',
          isActive ? 'text-white' : 'text-slate-700'
        )}
      >
        {cat.label}
      </span>
      {!cat.single && (
        <ChevronDown
          size={12}
          className={cn(
            'transition-transform duration-150 -mt-1',
            isActive ? 'rotate-180 text-white/60' : 'text-slate-300'
          )}
        />
      )}
      {cat.single && (
        <ArrowRight size={12} className={isActive ? 'text-white/60 -mt-1' : 'text-slate-300 -mt-1'} />
      )}
    </button>
  );
}

// ─── Overflow "+" button with hover popover ───────────────────────────────────
function OverflowButton({ overflowCats, activeCategory, onSelect }: {
  overflowCats: Category[];
  activeCategory: string | null;
  onSelect: (cat: Category) => void;
}) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleMouseEnter() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  }
  function handleMouseLeave() {
    timerRef.current = setTimeout(() => setOpen(false), 200);
  }

  const hasActiveOverflow = overflowCats.some(c => c.id === activeCategory);

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* The + tile */}
      <button
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-2xl border transition-all duration-150 select-none',
          'w-[100px] h-[110px]',
          hasActiveOverflow
            ? 'bg-[#0F2044] text-white border-[#0F2044] shadow-md'
            : open
              ? 'bg-slate-100 border-slate-300 text-slate-700'
              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        )}
      >
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center',
          hasActiveOverflow ? 'bg-white/15' : 'bg-slate-100'
        )}>
          <Plus size={20} className={hasActiveOverflow ? 'text-white' : 'text-slate-500'} />
        </div>
        <span className={cn('text-[12px] font-semibold', hasActiveOverflow ? 'text-white' : 'text-slate-600')}>
          {overflowCats.length} more
        </span>
      </button>

      {/* Hover popover */}
      {open && (
        <div
          className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 min-w-[180px]"
          style={{ animation: 'fadeSlideUp 120ms ease-out' }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Arrow */}
          <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-slate-200 rotate-45" />
          {overflowCats.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => { onSelect(cat); setOpen(false); }}
                className={cn(
                  'flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl transition-all duration-100',
                  isActive
                    ? 'bg-[#0F2044] text-white'
                    : 'hover:bg-slate-50 text-slate-700'
                )}
              >
                <div className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                  isActive ? 'bg-white/15' : 'bg-slate-100'
                )}>
                  <Icon size={14} className={isActive ? 'text-white' : 'text-slate-500'} />
                </div>
                <span className="text-[13px] font-semibold">{cat.labelShort}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Workbench page ──────────────────────────────────────────────────────
export default function Workbench() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    toast.info(`AI assistant: "${query}" — coming soon`);
    setQuery('');
  }

  function handleCategoryClick(cat: Category) {
    if (cat.single && cat.action) {
      cat.action();
      return;
    }
    setActiveCategory(prev => prev === cat.id ? null : cat.id);
  }

  const activeCat = TOOL_CATEGORIES.find(c => c.id === activeCategory);

  return (
    <AppShell hideTopBar>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Full-height centered workspace */}
      <div className="flex flex-col items-center justify-start min-h-full px-6 pt-14 pb-10">

        {/* ── Title ─────────────────────────────────────────────────────────── */}
        <div className="text-center mb-8 select-none">
          <h1 className="text-[30px] font-extrabold text-[#0F2044] leading-none tracking-tight">
            Sinaxe
            <sup className="text-[14px] font-medium text-slate-400 ml-0.5 align-super">™</sup>
            {' '}
            <span className="font-normal text-slate-600">TaxWorkbench</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2">Your intelligent tax workspace</p>
        </div>

        {/* ── Chat prompt ───────────────────────────────────────────────────── */}
        <div className="w-full max-w-2xl mb-8">
          <form
            onSubmit={handleSubmit}
            className="relative bg-white border border-slate-200 rounded-2xl shadow-sm focus-within:border-[#0F2044]/40 focus-within:shadow-md transition-all duration-200"
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
              className="w-full resize-none bg-transparent px-5 pt-4 pb-12 text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none rounded-2xl"
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
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150',
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

        {/* ── 4 tiles + overflow "+" ─────────────────────────────────────────── */}
        <div className="w-full max-w-2xl">
          <div className="flex items-end gap-3 justify-center">
            {PRIMARY_CATS.map(cat => (
              <CategoryTile
                key={cat.id}
                cat={cat}
                isActive={activeCategory === cat.id}
                onClick={() => handleCategoryClick(cat)}
              />
            ))}
            <OverflowButton
              overflowCats={OVERFLOW_CATS}
              activeCategory={activeCategory}
              onSelect={cat => handleCategoryClick(cat)}
            />
          </div>

          {/* ── Expanded tool panel ─────────────────────────────────────────── */}
          {activeCat && !activeCat.single && activeCat.tools.length > 0 && (
            <ToolPanel cat={activeCat} />
          )}
        </div>

      </div>
    </AppShell>
  );
}
