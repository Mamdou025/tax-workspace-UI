// SurplusWorksheet.tsx — Sinaxe InScope v2.0
// Design: Two-panel worksheet template — exact FAPI layout
// LEFT PANEL: Surplus calculator (ES, HS, TS, PAS) — one FA at a time
// RIGHT PANEL: Collapsible — slides in from the right
// BOTTOM CENTER: Animated InScope orbital milestone menu (8 nodes, upward arc)
// Greyscale UI, Sinaxe Purple (#6B21A8) + Orange (#C2410C) for logo/accents only

import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAgentChat } from '@/contexts/AgentChatContext';
import {
  ChevronRight, ChevronDown,
  Plus, Download, Upload, X, Check, FileText,
  ClipboardCheck, Eye, PenLine, Package, Sparkles,
  Clock, Mail, MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Brand colours ────────────────────────────────────────────────────────────
const PURPLE = '#6B21A8';
const ORANGE = '#C2410C';

// ─── Milestone menu ───────────────────────────────────────────────────────────
type MilestoneId =
  | 'ai-assistant'
  | 'client-context'
  | 'upload'
  | 'sources-mapping'
  | 'validate'
  | 'irl'
  | 'review'
  | 'sign-off'
  | 'file';

interface Milestone {
  id: MilestoneId;
  label: string;
  icon: React.ReactNode;
  done: boolean;
}

const MILESTONES: Milestone[] = [
  { id: 'ai-assistant',    label: 'AI Assistant',    icon: <Sparkles size={14} />,       done: false },
  { id: 'client-context',  label: 'Client Context',  icon: <FileText size={14} />,       done: true  },
  { id: 'upload',          label: 'Upload',          icon: <Upload size={14} />,          done: true  },
  { id: 'sources-mapping', label: 'Sources Mapping', icon: <MapPin size={14} />,          done: true  },
  { id: 'validate',        label: 'Validate',        icon: <ClipboardCheck size={14} />,  done: false },
  { id: 'irl',             label: 'IRL',             icon: <Mail size={14} />,            done: false },
  { id: 'review',          label: 'Review',          icon: <Eye size={14} />,             done: false },
  { id: 'sign-off',        label: 'Sign-off',        icon: <PenLine size={14} />,         done: false },
  { id: 'file',            label: 'File',            icon: <Package size={14} />,         done: false },
];

// ─── Data ─────────────────────────────────────────────────────────────────────
const AFFILIATES = [
  'SAS Paris (France)',
  'GmbH Berlin (Germany)',
  'Ltd London (UK)',
  'Inc Delaware (USA)',
  'Pte Singapore I (Singapore)',
];
const YEARS = ['2022', '2023', '2024', '2025'];

// Surplus account types
type SurplusType = 'ES' | 'HS' | 'TS' | 'PAS';
const SURPLUS_TYPES: { id: SurplusType; label: string; fullLabel: string; color: string }[] = [
  { id: 'ES',  label: 'ES',  fullLabel: 'Exempt Surplus',          color: '#374151' },
  { id: 'HS',  label: 'HS',  fullLabel: 'Hybrid Surplus',          color: '#374151' },
  { id: 'TS',  label: 'TS',  fullLabel: 'Taxable Surplus',         color: '#374151' },
  { id: 'PAS', label: 'PAS', fullLabel: 'Pre-Acquisition Surplus', color: '#374151' },
];

interface CalcRow {
  id: string;
  tag?: string;
  label: string;
  /** Values keyed by surplus type. Null = n/a for this account */
  values: Partial<Record<SurplusType, string>>;
  isSection?: boolean;
  isResult?: boolean;
  children?: CalcRow[];
  badge?: string;
  showIcons?: boolean;
  linked?: boolean; // 🔗 pulled from another worksheet
  indent?: number;
}

// Realistic mock data for SAS Paris (France) — EUR functional currency
const CALC_SECTIONS: CalcRow[] = [
  // ─── Opening Balance ──────────────────────────────────────────────────────
  {
    id: 'opening',
    label: 'OPENING BALANCE',
    isSection: true,
    values: {},
    children: [
      {
        id: 'opening-bal',
        tag: 'OB',
        label: 'Opening surplus balance (prior year closing)',
        values: { ES: '1,245,000', HS: '0', TS: '312,000', PAS: '0' },
        badge: 'PRIOR YEAR',
        showIcons: true,
      },
    ],
  },
  // ─── Income / Loss per Financial Statements ───────────────────────────────
  {
    id: 'fs-income',
    label: 'INCOME / LOSS PER FINANCIAL STATEMENTS',
    isSection: true,
    values: {},
    children: [
      {
        id: 'net-income',
        tag: 'NI',
        label: 'Net income (loss) per financial statements',
        values: { ES: '2,180,000', HS: '0', TS: '0', PAS: '0' },
        badge: 'LINKED — FS',
        linked: true,
        showIcons: true,
      },
      {
        id: 'other-comp-income',
        tag: 'OCI',
        label: 'Other comprehensive income items',
        values: { ES: '0', HS: '0', TS: '0', PAS: '0' },
        showIcons: true,
      },
    ],
  },
  // ─── Book-to-Tax Adjustments ──────────────────────────────────────────────
  {
    id: 'book-tax',
    label: 'BOOK-TO-TAX ADJUSTMENTS',
    isSection: true,
    values: {},
    children: [
      {
        id: 'active-biz',
        tag: 'ABR',
        label: 'Active business income adjustments (foreign rules)',
        values: { ES: '(145,000)', HS: '0', TS: '0', PAS: '0' },
        showIcons: true,
        children: [
          { id: 'dep-diff',    label: 'Depreciation / CCA difference',       values: { ES: '(98,000)',  HS: '0', TS: '0', PAS: '0' }, indent: 1, showIcons: true },
          { id: 'accruals',    label: 'Accruals and provisions',              values: { ES: '(47,000)',  HS: '0', TS: '0', PAS: '0' }, indent: 1, showIcons: true },
        ],
      },
      {
        id: 'cdn-rules',
        tag: 'CDN',
        label: 'Adjustments under Canadian rules — businesses other than active',
        values: { ES: '0', HS: '0', TS: '(312,000)', PAS: '0' },
        showIcons: true,
        children: [
          { id: 'fapi-adj',    label: 'FAPI recharacterization (ss.95(2))',   values: { ES: '0', HS: '0', TS: '(312,000)', PAS: '0' }, indent: 1, badge: 'LINKED — FAPI', linked: true, showIcons: true },
          { id: 'prop-inc',    label: 'Property income adjustments',          values: { ES: '0', HS: '0', TS: '0',         PAS: '0' }, indent: 1, showIcons: true },
        ],
      },
    ],
  },
  // ─── Reg. 5907(2) Adjustments ─────────────────────────────────────────────
  {
    id: 'reg-5907',
    label: 'ADJUSTMENTS UNDER REG. 5907(2)',
    isSection: true,
    values: {},
    children: [
      {
        id: '5907-2a',
        tag: '5907(2)(a)',
        label: 'Amounts included in income under ss.91(1) — FAPI inclusion',
        values: { ES: '0', HS: '0', TS: '(312,000)', PAS: '0' },
        badge: 'LINKED — FAPI',
        linked: true,
        showIcons: true,
      },
      {
        id: '5907-2b',
        tag: '5907(2)(b)',
        label: 'Hybrid surplus / deficit adjustments',
        values: { ES: '0', HS: '(28,000)', TS: '0', PAS: '0' },
        showIcons: true,
      },
      {
        id: '5907-2c',
        tag: '5907(2)(c)',
        label: 'Gains and losses on disposition of property',
        values: { ES: '0', HS: '0', TS: '0', PAS: '0' },
        showIcons: true,
      },
      {
        id: '5907-2d',
        tag: '5907(2)(d)',
        label: 'Amounts deducted under ss.91(4) — FAPIT deduction',
        values: { ES: '0', HS: '0', TS: '0', PAS: '0' },
        showIcons: true,
      },
      {
        id: '5907-2e',
        tag: '5907(2)(e)',
        label: 'Amounts included in income under ss.91(3)',
        values: { ES: '0', HS: '0', TS: '0', PAS: '0' },
        showIcons: true,
      },
    ],
  },
  // ─── Income Taxes Paid / Refunded ─────────────────────────────────────────
  {
    id: 'taxes',
    label: 'INCOME TAXES PAID / REFUNDED',
    isSection: true,
    values: {},
    children: [
      {
        id: 'taxes-paid',
        tag: 'TAX',
        label: 'Income taxes paid (current year)',
        values: { ES: '(654,000)', HS: '0', TS: '(93,600)', PAS: '0' },
        showIcons: true,
      },
      {
        id: 'taxes-refund',
        tag: 'REF',
        label: 'Tax refunds / adjustments received',
        values: { ES: '0', HS: '0', TS: '0', PAS: '0' },
        showIcons: true,
      },
      {
        id: 'withholding',
        tag: 'WHT',
        label: 'Withholding taxes on dividends paid',
        values: { ES: '(12,000)', HS: '0', TS: '0', PAS: '0' },
        showIcons: true,
      },
    ],
  },
  // ─── Dividends Paid / Received ────────────────────────────────────────────
  {
    id: 'dividends',
    label: 'DIVIDENDS PAID / RECEIVED',
    isSection: true,
    values: {},
    children: [
      {
        id: 'div-paid-es',
        tag: 'DIV↑',
        label: 'Dividends paid — out of exempt surplus',
        values: { ES: '(500,000)', HS: '0', TS: '0', PAS: '0' },
        showIcons: true,
      },
      {
        id: 'div-paid-ts',
        tag: 'DIV↑',
        label: 'Dividends paid — out of taxable surplus',
        values: { ES: '0', HS: '0', TS: '(100,000)', PAS: '0' },
        showIcons: true,
      },
      {
        id: 'div-received',
        tag: 'DIV↓',
        label: 'Dividends received from lower-tier affiliates',
        values: { ES: '0', HS: '0', TS: '0', PAS: '0' },
        showIcons: true,
      },
      {
        id: 'div-5900',
        tag: 'REG',
        label: 'Reg. 5900(2) election — reclassification between accounts',
        values: { ES: '0', HS: '0', TS: '0', PAS: '0' },
        showIcons: true,
      },
    ],
  },
];

// Closing balance computed from mock data
const CLOSING: Record<SurplusType, string> = {
  ES:  '2,114,000',
  HS:  '(28,000)',
  TS:  '(505,600)',
  PAS: '0',
};

// ─── Orbital milestone menu ───────────────────────────────────────────────────
function OrbitalMilestoneMenu({
  open,
  onClose,
  onSelect,
  activeMilestone,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (id: MilestoneId) => void;
  activeMilestone: MilestoneId | null;
}) {
  if (!open) return null;
  const RADIUS = 175;
  const count = MILESTONES.length;
  return (
    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50" style={{ width: 1, height: 1 }}>
      {MILESTONES.map((m, i) => {
        const startAngle = -160 * (Math.PI / 180);
        const endAngle   = -20  * (Math.PI / 180);
        const angle = startAngle + (i / (count - 1)) * (endAngle - startAngle);
        const x = Math.cos(angle) * RADIUS;
        const y = Math.sin(angle) * RADIUS;
        const isActive = activeMilestone === m.id;
        return (
          <button
            key={m.id}
            onClick={() => { onSelect(m.id); onClose(); }}
            className={cn('absolute flex flex-col items-center gap-1 group transition-all duration-200 hover:scale-110')}
            style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
          >
            <div
              className={cn(
                'relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200',
                isActive
                  ? 'text-white border-transparent shadow-lg'
                  : m.done
                  ? 'bg-white border-green-400 text-green-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:border-gray-500',
              )}
              style={isActive ? { background: `linear-gradient(135deg, ${PURPLE}, ${ORANGE})`, borderColor: 'transparent' } : {}}
            >
              {m.icon}
              {m.done && !isActive && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <Check size={9} className="text-white" strokeWidth={3} />
                </span>
              )}
            </div>
            <span className={cn('text-[9px] font-500 whitespace-nowrap', isActive ? 'text-gray-800' : 'text-gray-500')}>
              {m.label}
            </span>
          </button>
        );
      })}
      <button onClick={onClose} className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-gray-400 hover:text-gray-600 text-xs flex items-center gap-1">
        <X size={12} /> close
      </button>
    </div>
  );
}

// ─── Right panel content ──────────────────────────────────────────────────────
function RightPanelContent({ milestone }: { milestone: MilestoneId | null }) {
  if (!milestone) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: '#f3f4f6' }}>
          <Sparkles size={20} style={{ color: '#9ca3af' }} />
        </div>
        <p className="text-sm text-gray-500 font-500">Select a menu item</p>
        <p className="text-xs text-gray-400 mt-1">Click the InScope menu below to open a workflow item</p>
      </div>
    );
  }

  if (milestone === 'ai-assistant') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-gray-400" />
            <span className="text-xs font-600 text-gray-700">AI Assistant</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Surplus analysis for SAS Paris · 2024</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[11px] text-gray-700 leading-relaxed">
              <strong>AI</strong> has reviewed the prior-year surplus balances and identified the following items requiring attention:
            </p>
          </div>
          {[
            { priority: 'high',   msg: 'Taxable surplus is negative ($(505,600)). Confirm whether a dividend has been paid to absorb the deficit or if a Reg. 5900(2) election is required.' },
            { priority: 'medium', msg: 'Hybrid surplus deficit of $(28,000) — verify the Reg. 5907(2)(b) adjustment source. Was there a hybrid instrument payment in the year?' },
            { priority: 'low',    msg: 'Exempt surplus increased by $869,000 net. Cross-check against the T1134 Supplement Section 3A.1 for consistency.' },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '8px 10px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12,
              borderLeft: `3px solid ${item.priority === 'high' ? '#fca5a5' : item.priority === 'medium' ? '#fde68a' : '#d1d5db'}`,
            }}>
              <div style={{ color: '#374151', lineHeight: 1.5 }}>{item.msg}</div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <input placeholder="Ask about this surplus calculation…" className="flex-1 text-[11px] bg-transparent outline-none text-gray-700 placeholder-gray-400" />
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (milestone === 'client-context') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-gray-400" />
            <span className="text-xs font-600 text-gray-700">Client Context</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: '#f9fafb', borderRadius: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1e1b4b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14 }}>N</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>Northstar Inc.</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>BN: 123456789 · FY Dec 31, 2024</div>
            </div>
          </div>
          {[
            { label: 'Affiliate',        value: 'SAS Paris (France)' },
            { label: 'Functional CCY',   value: 'EUR' },
            { label: 'FX Rate (avg)',     value: '1.4782 CAD/EUR' },
            { label: 'CFA / NCFA',       value: 'CFA (100% owned)' },
            { label: 'Ownership %',      value: '100%' },
            { label: 'Participating %',  value: '100%' },
            { label: 'Prior Year ES',    value: '€1,245,000' },
            { label: 'Prior Year TS',    value: '€312,000' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f3f4f6', fontSize: 12 }}>
              <span style={{ color: '#6b7280' }}>{row.label}</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (milestone === 'upload') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Upload size={14} className="text-gray-400" />
            <span className="text-sm font-600 text-gray-800">Upload Documents</span>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-500">✓ 2 files</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-gray-300 transition-colors cursor-pointer">
            <Upload size={20} className="text-gray-400" />
            <p className="text-xs font-500 text-gray-600">Drop files here or click to upload</p>
            <p className="text-[10px] text-gray-400">Prior year surplus summary, FS, tax returns</p>
          </div>
          <div>
            <div className="text-[10px] font-700 text-gray-400 uppercase tracking-wider mb-2">Uploaded Files</div>
            <div className="space-y-2">
              {[
                { name: 'Surplus_2023_SASParis.xlsx', size: '340 KB', status: 'processed' },
                { name: 'SAS_paris_FS_2024.pdf',      size: '2.1 MB', status: 'processed' },
                { name: 'TaxReturn_SASParis_2024.pdf', size: '1.4 MB', status: 'processing' },
              ].map((file) => (
                <div key={file.name} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
                  <FileText size={14} className="text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-500 text-gray-700 truncate">{file.name}</div>
                    <div className="text-[10px] text-gray-400">{file.size}</div>
                  </div>
                  <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-500', file.status === 'processed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                    {file.status === 'processed' ? '✓ Ready' : '⟳ Processing'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (milestone === 'sources-mapping') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-gray-400" />
            <span className="text-sm font-600 text-gray-800">Sources Mapping</span>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-500">✓ Mapped</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="text-[10px] text-gray-500 mb-3">AI-extracted values mapped to surplus calculator fields</div>
          {[
            { field: 'Net income per FS',          source: 'SAS_paris_FS_2024.pdf · p.4',        value: '€2,180,000', confidence: 97, status: 'mapped' },
            { field: 'Income taxes paid',           source: 'TaxReturn_SASParis_2024.pdf · p.2',  value: '€654,000',   confidence: 94, status: 'mapped' },
            { field: 'Opening ES balance',          source: 'Surplus_2023_SASParis.xlsx · Tab ES', value: '€1,245,000', confidence: 99, status: 'mapped' },
            { field: 'Dividends paid',              source: 'SAS_paris_FS_2024.pdf · p.8',        value: '€500,000',   confidence: 91, status: 'mapped' },
            { field: 'Depreciation adjustment',     source: 'TaxReturn_SASParis_2024.pdf · p.5',  value: 'Pending',    confidence: 0,  status: 'pending' },
          ].map((row) => (
            <div key={row.field} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="text-[10px] font-600 text-gray-700">{row.field}</div>
                <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-500 shrink-0', row.status === 'mapped' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                  {row.status === 'mapped' ? `${row.confidence}% conf.` : 'Pending'}
                </span>
              </div>
              <div className="text-[10px] text-gray-500">Source: {row.source}</div>
              <div className="text-[11px] font-600 text-gray-800 mt-1">{row.value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (milestone === 'irl') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-gray-400" />
            <span className="text-xs font-600 text-gray-700">Information Request Letter</span>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-500">3 pending</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Confirm year-end transactions that may affect surplus balances</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {[
            { id: 1, question: 'Were any dividends paid by SAS Paris in 2024 other than the €500,000 identified in the financial statements?', status: 'pending', due: 'Jun 20' },
            { id: 2, question: 'Confirm whether a Reg. 5900(2) election was filed or is required given the taxable surplus deficit.', status: 'pending', due: 'Jun 20' },
            { id: 3, question: 'Provide the breakdown of income taxes paid between current and deferred portions.', status: 'pending', due: 'Jun 15' },
            { id: 4, question: 'Confirm the depreciation method used for the 2024 tax return (straight-line vs. declining balance).', status: 'received', due: 'Jun 10' },
          ].map((item) => (
            <div key={item.id} className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] text-gray-700 leading-relaxed flex-1">{item.question}</p>
                <span className={cn('shrink-0 text-[9px] px-1.5 py-0.5 rounded-full font-600', item.status === 'received' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                  {item.status === 'received' ? '✓ Received' : '⏳ Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-gray-400">Due {item.due}</span>
                {item.status === 'pending' && (
                  <button className="text-[9px] font-600 px-2 py-0.5 rounded border border-gray-200 text-gray-500 hover:text-gray-700 transition-colors">Send reminder</button>
                )}
              </div>
            </div>
          ))}
          <button className="w-full mt-2 flex items-center justify-center gap-1.5 text-[11px] font-600 py-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors">
            <Plus size={12} /> Add request
          </button>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 shrink-0">
          <button className="w-full py-2 rounded-xl text-white text-xs font-600 flex items-center justify-center gap-2" style={{ background: '#374151' }}>
            <Mail size={12} /> Send IRL to client
          </button>
        </div>
      </div>
    );
  }

  if (milestone === 'validate') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={14} className="text-gray-400" />
            <span className="text-sm font-600 text-gray-800">Validate</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Running validation checks…</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {[
            { label: 'Opening balance ties to prior year closing',              status: 'pass' },
            { label: 'Net income per FS matches uploaded financial statements', status: 'pass' },
            { label: 'FAPI inclusion ties to FAPI worksheet',                   status: 'fail', count: 'Review' },
            { label: 'Taxes paid cross-referenced to tax return',               status: 'warn', count: 'Pending' },
            { label: 'Dividends paid do not exceed available surplus',          status: 'fail', count: 'TS deficit' },
            { label: 'Reg. 5907(2) adjustments complete',                      status: 'warn', count: '2 blank' },
            { label: 'T1134 Supplement Section 3A.1 ties to closing ES',       status: 'pass' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#f9fafb', borderRadius: 8, fontSize: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: item.status === 'fail' ? '#fca5a5' : item.status === 'warn' ? '#fde68a' : '#a7f3d0' }} />
              <span style={{ flex: 1, color: '#374151' }}>{item.label}</span>
              {item.count && <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280' }}>{item.count}</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (milestone === 'review') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-gray-400" />
            <span className="text-sm font-600 text-gray-800">Review</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div style={{ fontSize: 12, color: '#6b7280' }}>Manager review comments</div>
          {[
            { reviewer: 'M. Chen', comment: 'Please confirm the taxable surplus deficit — was a Reg. 5900(2) election filed? If not, the dividend paid may need to be recharacterized.', date: 'Jun 3, 2025', resolved: false },
            { reviewer: 'J. Park', comment: 'Depreciation adjustment looks reasonable. Confirm the CCA class used under French tax rules.', date: 'Jun 4, 2025', resolved: true },
          ].map((c, i) => (
            <div key={i} style={{ padding: 10, background: c.resolved ? '#f0fdf4' : '#fff', border: `1px solid ${c.resolved ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: 8, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: '#111827' }}>{c.reviewer}</span>
                <span style={{ color: '#9ca3af', fontSize: 11 }}>{c.date}</span>
              </div>
              <div style={{ color: '#4b5563', lineHeight: 1.5 }}>{c.comment}</div>
              {c.resolved && <div style={{ marginTop: 6, fontSize: 11, color: '#10b981', fontWeight: 700 }}>✓ Resolved</div>}
            </div>
          ))}
          <button style={{ padding: '8px 0', background: '#f3f4f6', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#374151', cursor: 'pointer', width: '100%' }}>
            + Add Comment
          </button>
        </div>
      </div>
    );
  }

  if (milestone === 'sign-off') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <PenLine size={14} className="text-gray-400" />
            <span className="text-sm font-600 text-gray-800">Sign-off</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Digital sign-off required before filing</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {[
            { role: 'Preparer', name: 'Sarah Thompson', date: 'Jun 5, 2025', signed: true },
            { role: 'Reviewer', name: 'Michael Chen',   date: '',            signed: false },
            { role: 'Partner',  name: 'James Park',     date: '',            signed: false },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: s.signed ? '#f0fdf4' : '#fafafa', borderRadius: 8, border: `1px solid ${s.signed ? '#bbf7d0' : '#e5e7eb'}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{s.name}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{s.role}</div>
              </div>
              {s.signed ? (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>✓ Signed</div>
                  <div style={{ fontSize: 10, color: '#9ca3af' }}>{s.date}</div>
                </div>
              ) : (
                <button style={{ padding: '6px 12px', background: '#374151', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Sign</button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Generic pending milestone
  const m = MILESTONES.find((x) => x.id === milestone);
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
        {m?.icon}
      </div>
      <p className="text-sm font-600 text-gray-700">{m?.label}</p>
      <p className="text-xs text-gray-400 mt-1">This milestone is pending</p>
      <div className="mt-4 flex items-center gap-1.5 text-[10px] text-gray-400">
        <Clock size={11} /> Not started
      </div>
    </div>
  );
}

// ─── Surplus Calculator ───────────────────────────────────────────────────────
function SurplusCalculator({
  affiliate,
  year,
  onAffiliateChange,
  onYearChange,
}: {
  affiliate: string;
  year: string;
  onAffiliateChange: (v: string) => void;
  onYearChange: (v: string) => void;
}) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(['active-biz', 'cdn-rules']));

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const renderRow = (row: CalcRow, depth = 0): React.ReactNode => {
    const isExpanded = expandedRows.has(row.id);
    const hasChildren = !!row.children?.length;

    return (
      <div key={row.id}>
        {row.isSection ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
            <span className="text-[10px] font-700 text-gray-500 uppercase tracking-widest">{row.label}</span>
          </div>
        ) : (
          <div
            className={cn(
              'flex items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors group',
              depth > 0 ? 'pl-6' : '',
            )}
            style={{ minHeight: '40px' }}
          >
            {/* Expand toggle */}
            <div className="w-8 flex items-center justify-center shrink-0">
              {hasChildren ? (
                <button onClick={() => toggleRow(row.id)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
              ) : <span className="w-3" />}
            </div>

            {/* Tag badge */}
            {row.tag && (
              <div className="w-20 mr-2 shrink-0 flex items-center">
                <span className="text-[9px] font-700 px-1.5 py-0.5 rounded border text-center"
                  style={{ color: PURPLE, borderColor: `${PURPLE}40`, background: `${PURPLE}08`, minWidth: '40px' }}>
                  {row.tag}
                </span>
              </div>
            )}

            {/* Label */}
            <div className="flex-1 flex items-center gap-2 py-2 pr-2 min-w-0">
              <span className={cn('text-[11px] leading-tight', hasChildren ? 'font-500 text-gray-800' : 'text-gray-700', depth > 0 ? 'text-gray-600' : '')}>
                {row.label}
              </span>
              {row.badge && (
                <span className={cn('text-[9px] px-1.5 py-0.5 rounded font-500 border shrink-0',
                  row.linked ? 'text-purple-700 border-purple-200 bg-purple-50' : 'text-gray-500 border-gray-200 bg-gray-100')}>
                  {row.badge}
                </span>
              )}
            </div>

            {/* Values — one column per surplus type */}
            <div className="flex items-center shrink-0">
              {SURPLUS_TYPES.map((st) => {
                const val = row.values[st.id];
                const isNA = val === undefined;
                return (
                  <div key={st.id} className="w-24 text-right pr-3">
                    {isNA ? (
                      <span className="text-[11px] text-gray-200">—</span>
                    ) : (
                      <span className={cn('text-[11px] tabular-nums', hasChildren ? 'font-600 text-gray-800' : 'text-gray-700',
                        val?.startsWith('(') ? 'text-gray-600' : '')}>
                        {val}
                      </span>
                    )}
                  </div>
                );
              })}
              {/* Row action icons */}
              <div className="w-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                {row.showIcons && (
                  <>
                    <button className="text-gray-400 hover:text-gray-600 p-0.5"><FileText size={10} /></button>
                    <button className="text-gray-400 hover:text-gray-600 p-0.5"><Clock size={10} /></button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Children */}
        {hasChildren && (row.isSection || isExpanded) && (
          <div>{row.children!.map((child) => renderRow(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Calculator header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="text-[10px] font-700 text-gray-400 uppercase tracking-widest mb-0.5">SURPLUS WORKSHEET</div>
        <div className="text-lg font-600 text-gray-900">Surplus Accounts Calculator</div>
        <div className="text-[11px] text-gray-400 mt-0.5">Regulation 5907 — Exempt, Hybrid, Taxable &amp; Pre-Acquisition Surplus</div>
      </div>

      {/* Selectors bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 flex-wrap">
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-gray-400 font-600 uppercase tracking-wider text-[9px]">Company</span>
          <span className="font-500 text-gray-800 bg-gray-100 px-2 py-1 rounded text-[11px]">Northstar Inc.</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-gray-400 font-600 uppercase tracking-wider text-[9px]">Affiliate</span>
          <select value={affiliate} onChange={(e) => onAffiliateChange(e.target.value)}
            className="font-500 text-gray-800 bg-gray-100 px-2 py-1 rounded text-[11px] border-0 outline-none cursor-pointer hover:bg-gray-200 transition-colors">
            {AFFILIATES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-gray-400 font-600 uppercase tracking-wider text-[9px]">Year</span>
          <select value={year} onChange={(e) => onYearChange(e.target.value)}
            className="font-500 text-gray-800 bg-gray-100 px-2 py-1 rounded text-[11px] border-0 outline-none cursor-pointer hover:bg-gray-200 transition-colors">
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-gray-400 font-600 uppercase tracking-wider text-[9px]">CCY</span>
          <span className="font-500 text-gray-800 bg-gray-100 px-2 py-1 rounded text-[11px]">EUR</span>
        </div>
        <button className="flex items-center gap-1 text-[11px] font-500 px-2.5 py-1 rounded border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all">
          <Plus size={11} /> New affiliate
        </button>
      </div>

      {/* Table header */}
      <div className="flex items-center px-4 py-2 border-b border-gray-200 bg-gray-50 sticky top-0 z-20">
        <div className="w-8 shrink-0" />
        <div className="w-20 shrink-0" />
        <div className="flex-1 text-[10px] font-700 text-gray-500 uppercase tracking-wider">Description</div>
        {SURPLUS_TYPES.map((st) => (
          <div key={st.id} className="w-24 text-right pr-3">
            <div className="text-[10px] font-700 text-gray-500 uppercase tracking-wider">{st.label}</div>
            <div className="text-[9px] text-gray-400 font-400">{st.fullLabel}</div>
          </div>
        ))}
        <div className="w-10" />
      </div>

      {/* Scrollable calculator body */}
      <div className="flex-1 overflow-y-auto">
        {CALC_SECTIONS.map((section) => renderRow(section))}
      </div>

      {/* Results Summary (sticky bottom) */}
      <div className="border-t-2 border-gray-200 bg-gray-50">
        <div className="flex items-center px-4 py-2 border-b border-gray-200">
          <button className="flex items-center gap-1.5 text-[10px] font-700 text-gray-500 uppercase tracking-wider">
            <ChevronDown size={12} />
            Closing Balances
          </button>
          <div className="ml-auto">
            <button className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-700 transition-colors">
              <Download size={12} />
              Export results
            </button>
          </div>
        </div>
        {/* Closing balance row */}
        <div className="flex items-center px-4 py-3">
          <div className="w-8 shrink-0" />
          <div className="w-20 shrink-0">
            <span className="text-[9px] font-700 px-1.5 py-0.5 rounded border"
              style={{ color: PURPLE, borderColor: `${PURPLE}40`, background: `${PURPLE}08` }}>CB</span>
          </div>
          <div className="flex-1 text-[12px] font-700 text-gray-800">Closing Surplus Balance</div>
          {SURPLUS_TYPES.map((st) => {
            const val = CLOSING[st.id];
            const isNeg = val.startsWith('(');
            return (
              <div key={st.id} className="w-24 text-right pr-3">
                <span className={cn('text-[12px] font-700 tabular-nums', isNeg ? 'text-red-600' : 'text-gray-900')}>
                  {val}
                </span>
              </div>
            );
          })}
          <div className="w-10" />
        </div>
        {/* CAD equivalent row */}
        <div className="flex items-center px-4 pb-3">
          <div className="w-8 shrink-0" />
          <div className="w-20 shrink-0">
            <span className="text-[9px] font-700 px-1.5 py-0.5 rounded border text-gray-400 border-gray-200 bg-gray-50">CAD</span>
          </div>
          <div className="flex-1 text-[11px] text-gray-500">CAD equivalent (@ 1.4782)</div>
          {SURPLUS_TYPES.map((st) => {
            const rawStr = CLOSING[st.id].replace(/[(),]/g, '');
            const raw = parseFloat(rawStr) || 0;
            const isNeg = CLOSING[st.id].startsWith('(');
            const cad = (raw * 1.4782).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return (
              <div key={st.id} className="w-24 text-right pr-3">
                <span className={cn('text-[11px] tabular-nums text-gray-500', isNeg ? 'text-red-400' : '')}>
                  {isNeg ? `(${cad})` : cad}
                </span>
              </div>
            );
          })}
          <div className="w-10" />
        </div>
      </div>
    </div>
  );
}

// ─── InScope animated logo trigger ───────────────────────────────────────────
function InScopeLogoTrigger({
  onClick, activeMilestone, doneCount, total,
}: {
  open: boolean;
  onClick: () => void;
  activeMilestone: MilestoneId | null;
  doneCount: number;
  total: number;
}) {
  const SIZE = 120;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const OUTER_R = 52;
  const INNER_R = 36;
  const outerDots = 44;
  const innerDots = 30;
  const FADE = 6;
  const centerLabel = activeMilestone ? (MILESTONES.find((m) => m.id === activeMilestone)?.label ?? '') : '';

  return (
    <>
      <style>{`
        @keyframes surplus-cw  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes surplus-ccw { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        .surplus-cw  { animation: surplus-cw  9s linear infinite; transform-origin: ${CX}px ${CY}px; }
        .surplus-ccw { animation: surplus-ccw 6s linear infinite; transform-origin: ${CX}px ${CY}px; }
      `}</style>
      <button onClick={onClick} aria-label="Open milestone menu"
        className="relative select-none transition-transform duration-200 hover:scale-105 active:scale-95"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ position: 'absolute', inset: 0 }}>
          <g className="surplus-cw">
            {Array.from({ length: outerDots }, (_, i) => {
              const a = (i / outerDots) * Math.PI * 2;
              const dist = Math.min(i, outerDots - 1 - i);
              const raw = dist >= FADE ? 1 : dist / FADE;
              const env = Math.pow(raw, 0.5);
              if (raw === 0) return null;
              return <circle key={i} cx={CX + OUTER_R * Math.cos(a)} cy={CY + OUTER_R * Math.sin(a)} r={1.4 * env} fill={PURPLE} opacity={0.88 * env} />;
            })}
          </g>
          <g className="surplus-ccw">
            {Array.from({ length: innerDots }, (_, i) => {
              const a = (i / innerDots) * Math.PI * 2;
              const dist = Math.min(i, innerDots - 1 - i);
              const raw = dist >= FADE ? 1 : dist / FADE;
              const env = Math.pow(raw, 0.5);
              if (raw === 0) return null;
              return <circle key={i} cx={CX + INNER_R * Math.cos(a)} cy={CY + INNER_R * Math.sin(a)} r={1.2 * env} fill={ORANGE} opacity={0.88 * env} />;
            })}
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ pointerEvents: 'none', gap: 2 }}>
          {centerLabel ? (
            <>
              <span style={{ fontSize: 9, fontWeight: 800, color: '#111827', lineHeight: 1.2, textAlign: 'center', maxWidth: INNER_R * 2 - 8, display: 'block', wordBreak: 'break-word' }}>{centerLabel}</span>
              <span style={{ fontSize: 6, color: '#9CA3AF', marginTop: 2 }}>active</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: 9, fontWeight: 800, color: '#111827', lineHeight: 1.2, textAlign: 'center', maxWidth: INNER_R * 2 - 8, display: 'block' }}>Surplus</span>
              <span style={{ fontSize: 6, color: '#9CA3AF', marginTop: 2 }}>{doneCount}/{total} done</span>
            </>
          )}
        </div>
      </button>
    </>
  );
}

// ─── Main SurplusWorksheet ────────────────────────────────────────────────────
export default function SurplusWorksheet() {
  const [, navigate] = useLocation();
  const { openChat } = useAgentChat();
  const [affiliate, setAffiliate] = useState(AFFILIATES[0]);
  const [year, setYear] = useState('2025');
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<MilestoneId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const doneCount = MILESTONES.filter((m) => m.done).length;

  const handleMilestoneSelect = (id: MilestoneId) => {
    setActiveMilestone(id);
    setRightPanelOpen(true);
    setMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-gray-100 z-20 shrink-0">
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 select-none hover:opacity-80 transition-opacity">
          <span className="text-sm font-700 tracking-tight text-gray-900">Sinaxe</span>
          <span className="text-[10px] text-gray-300 font-400">™</span>
          <span className="text-sm font-700 tracking-tight" style={{ color: PURPLE }}>InScope</span>
        </button>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span className="text-gray-300">·</span>
          <button onClick={() => navigate('/')} className="hover:text-gray-600 transition-colors">Northstar Inc.</button>
          <span className="text-gray-300">›</span>
          <button onClick={() => navigate('/')} className="hover:text-gray-600 transition-colors">ICT</button>
          <span className="text-gray-300">›</span>
          <button onClick={() => navigate('/')} className="hover:text-gray-600 transition-colors">Calculate</button>
          <span className="text-gray-300">›</span>
          <span className="text-gray-600 font-500">Surplus Worksheet</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {MILESTONES.map((m) => (
                <div key={m.id} className="w-4 h-1 rounded-full transition-all" style={{ background: m.done ? '#22c55e' : '#e5e7eb' }} />
              ))}
            </div>
                        <span className="text-[10px] text-gray-400 font-500">{doneCount}/{MILESTONES.length} milestones</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <button
            onClick={() => { openChat(''); navigate('/chat'); }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all"
            title="Open AI Assistant"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            AI
          </button>
        </div>
      </div>
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT PANEL */}
        <div
          className="flex flex-col overflow-hidden border-r border-gray-100"
          style={{
            flex: rightPanelOpen ? '0 0 62%' : '1 1 0%',
            transition: 'flex-basis 300ms cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        >
          <SurplusCalculator
            affiliate={affiliate}
            year={year}
            onAffiliateChange={setAffiliate}
            onYearChange={setYear}
          />
        </div>

        {/* RIGHT PANEL — slides in from the right */}
        <div
          className="absolute top-0 right-0 bottom-0 flex flex-col bg-white border-l border-gray-100 shadow-[-4px_0_16px_rgba(0,0,0,0.06)]"
          style={{
            width: '38%',
            transform: rightPanelOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 300ms cubic-bezier(0.23, 1, 0.32, 1)',
            pointerEvents: rightPanelOpen ? 'auto' : 'none',
          }}
        >
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 shrink-0">
            <span className="text-xs font-600 text-gray-700 flex-1">
              {activeMilestone ? MILESTONES.find((m) => m.id === activeMilestone)?.label : 'Panel'}
            </span>
            <button
              onClick={() => { setRightPanelOpen(false); setActiveMilestone(null); }}
              className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-100"
              title="Close panel"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <RightPanelContent milestone={activeMilestone} />
          </div>
        </div>

        {/* ANIMATED INSCOPE LOGO */}
        <div
          className="absolute z-30 flex flex-col items-center"
          style={{
            ...(rightPanelOpen
              ? { right: '38%', bottom: '24px', transform: 'translateX(50%)' }
              : { left: '50%', bottom: '24px', transform: 'translateX(-50%)' }),
            transition: 'all 300ms cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        >
          <div className="relative">
            <OrbitalMilestoneMenu
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              onSelect={handleMilestoneSelect}
              activeMilestone={activeMilestone}
            />
            <InScopeLogoTrigger
              open={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              activeMilestone={activeMilestone}
              doneCount={doneCount}
              total={MILESTONES.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
