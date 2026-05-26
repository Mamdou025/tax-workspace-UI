// Workbench — Sinaxe TaxWorkbench home screen
// Design: Task-first workspace. Centered title + chat prompt + tool categories below.
// Reference: Genspark AI Workspace layout.
// Palette: White background, slate text, deep navy accents. Light and calm.

import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowRight, ChevronDown, ChevronUp,
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
    single: true, // no dropdown, direct action
    action: () => { window.location.href = '/workflow/fapi'; },
    description: 'FAPI Workpaper 2025 — Northstar Holdings · Last opened 2h ago',
  },
  {
    id: 'correspondence',
    label: 'Client Correspondence',
    icon: Mail,
    accent: '#1B5FD4',
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
    tools: [
      { id: 'workspace', label: 'Client Workspace',  icon: Briefcase, description: "Open a client's full engagement workspace", href: '/client/northstar' },
      { id: 'dashboard', label: 'Practitioner View', icon: Cpu,       description: 'See all your active workstreams', href: '/dashboard' },
      { id: 'buoverview',label: 'BU Overview',       icon: Globe,     description: 'Executive view across all LOS', href: '/bu-overview' },
    ],
  },
];

// ─── Tool Card (inside a dropdown) ───────────────────────────────────────────
function ToolItem({
  tool,
  accent,
}: {
  tool: { id: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; description: string; href?: string; accentColor?: string };
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
        'flex items-start gap-3 w-full text-left px-3 py-2.5 rounded-lg',
        'hover:bg-slate-50 transition-colors duration-100 group'
      )}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: `${accent}12`, border: `1px solid ${accent}20` }}
      >
        <Icon size={15} className="shrink-0" />
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-600 text-slate-800 group-hover:text-[#0F2044] transition-colors">
          {tool.label}
        </div>
        <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{tool.description}</div>
      </div>
    </button>
  );
}

// ─── Category section ─────────────────────────────────────────────────────────
function CategorySection({ cat }: { cat: typeof TOOL_CATEGORIES[number] }) {
  const [open, setOpen] = useState(false);
  const Icon = cat.icon;

  // "Pick up where you left off" — single action button, no dropdown
  if (cat.single) {
    return (
      <button
        onClick={cat.action}
        className={cn(
          'flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white',
          'hover:border-[#0F2044]/30 hover:shadow-sm transition-all duration-150 group text-left w-full'
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-[#0F2044]/8 border border-[#0F2044]/12 flex items-center justify-center shrink-0">
          <Icon size={15} className="text-[#0F2044]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-700 text-[#0F2044] uppercase tracking-wider mb-0.5">{cat.label}</div>
          <div className="text-[12px] text-slate-500 truncate">{cat.description}</div>
        </div>
        <ArrowRight size={14} className="text-slate-300 group-hover:text-[#0F2044] group-hover:translate-x-0.5 transition-all shrink-0" />
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Category header — click to toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-2.5 px-4 py-2.5 w-full text-left',
          'hover:bg-slate-50 transition-colors duration-100',
          open && 'border-b border-slate-100'
        )}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${cat.accent}10`, border: `1px solid ${cat.accent}18` }}
        >
          <Icon size={15} style={{ color: cat.accent }} />
        </div>
        <span className="flex-1 text-[12px] font-700 text-slate-700 uppercase tracking-wider">{cat.label}</span>
        <span className="text-[10px] text-slate-400 mr-1">{cat.tools?.length} tools</span>
        {open
          ? <ChevronUp size={14} className="text-slate-400 shrink-0" />
          : <ChevronDown size={14} className="text-slate-400 shrink-0" />
        }
      </button>

      {/* Tools list */}
      {open && (
        <div className="px-2 py-1.5 space-y-0.5 animate-fade-slide-up">
          {cat.tools?.map(tool => (
            <ToolItem key={tool.id} tool={tool} accent={cat.accent} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Workbench page ──────────────────────────────────────────────────────
export default function Workbench() {
  const [query, setQuery] = useState('');
  const [, navigate] = useLocation();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    toast.info(`AI assistant: "${query}" — coming soon`);
    setQuery('');
  }

  return (
    <AppShell hideTopBar>
      {/* Full-height centered workspace */}
      <div className="flex flex-col items-center justify-start min-h-full px-6 pt-16 pb-10">

        {/* ── Title ─────────────────────────────────────────────────────────── */}
        <div className="text-center mb-10 select-none">
          <h1 className="text-[32px] font-800 text-[#0F2044] leading-none tracking-tight">
            Sinaxe
            <sup className="text-[16px] font-600 text-slate-400 ml-0.5 align-super">™</sup>
            {' '}
            <span className="font-400 text-slate-600">TaxWorkbench</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2">Your intelligent tax workspace</p>
        </div>

        {/* ── Chat prompt ───────────────────────────────────────────────────── */}
        <div className="w-full max-w-2xl mb-10">
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
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e as any); } }}
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

        {/* ── Tool categories ───────────────────────────────────────────────── */}
        <div className="w-full max-w-2xl space-y-2">
          {TOOL_CATEGORIES.map(cat => (
            <CategorySection key={cat.id} cat={cat} />
          ))}
        </div>

      </div>
    </AppShell>
  );
}
