// FapiWorksheet.tsx — Sinaxe InScope v2.0
// Design: Two-panel worksheet template
// LEFT PANEL: FAPI calculator (exact replica of the reference screenshot)
// RIGHT PANEL: Collapsible — shows selected orbital menu item content
// BOTTOM CENTER: Animated InScope orbital milestone menu (8 nodes, clockwise)
// Greyscale UI, Sinaxe Purple (#5E2E93) + Orange (#DA5E2C) for logo/accents only

import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  ChevronRight, ChevronDown,
  Plus, Download, Upload, X, Check, FileText,
  MapPin, ClipboardCheck, Eye,
  PenLine, Package, Sparkles, Clock, Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Brand colours (matching OrbitalStage exactly) ──────────────────────────
const PURPLE = '#6B21A8';
const ORANGE = '#C2410C';

// ─── Milestone menu items (clockwise order) ───────────────────────────────────
type MilestoneId =
  | 'ai-assistant'
  | 'client-context'
  | 'upload'
  | 'sources-mapping'
  | 'validate'
  | 'irl'
  | 'review'
  | 'sign-off'
  | 'deliver';

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
  { id: 'deliver',         label: 'Deliver',         icon: <Package size={14} />,         done: false },
];

// ─── FAPI Calculator data ─────────────────────────────────────────────────────
const AFFILIATES = ['SAS paris', 'Northstar US LLC', 'Northstar DE GmbH', 'Northstar UK Ltd'];
const YEARS = ['2022', '2023', '2024', '2025'];

interface CalcRow {
  id: string;
  tag?: string;
  label: string;
  amount: string;
  ccy?: string;
  isSection?: boolean;
  isExpanded?: boolean;
  children?: CalcRow[];
  isResult?: boolean;
  indent?: number;
  badge?: string;
  showAddBtn?: boolean;
  showIcons?: boolean;
}

const CALC_SECTIONS: CalcRow[] = [
  {
    id: 'currency-conversion',
    label: 'CURRENCY CONVERSION',
    isSection: true,
    amount: '',
    children: [
      { id: 'fx', tag: 'FX', label: 'Annual Average FX Rate', amount: '1.000000', ccy: 'RATE' },
    ],
  },
  {
    id: 'property-income',
    label: 'PROPERTY INCOME',
    isSection: true,
    amount: '',
    children: [
      {
        id: 'a',
        tag: 'A',
        label: 'Property Income',
        amount: '0.00',
        ccy: 'CAD',
        isExpanded: true,
        children: [
          { id: 'a-div', label: 'Dividendes', amount: '0.00', ccy: 'CAD', badge: 'MANUAL', showIcons: true, indent: 1 },
        ],
        showAddBtn: true,
      },
    ],
  },
  {
    id: 'allowable-expenses',
    label: 'ALLOWABLE EXPENSES RELATED TO FAPI',
    isSection: true,
    amount: '',
    children: [
      { id: 'exp', tag: 'EXP', label: 'Expenses', amount: '0.00', ccy: 'CAD' },
    ],
  },
  {
    id: 'component-b',
    label: 'COMPONENT B',
    isSection: true,
    amount: '',
    children: [
      { id: 'b', tag: 'B', label: 'Gains From Disposition (Derived)', amount: '0.00', ccy: 'CAD' },
    ],
  },
  {
    id: 'canadian-rules',
    label: 'COMPUTATION UNDER CANADIAN RULES 95(2)',
    isSection: true,
    amount: '',
    children: [
      { id: '95-2', tag: '95(2)', label: 'Canadian Rules 95(2)', amount: '0.00', ccy: 'CAD' },
    ],
  },
  {
    id: 'other-income',
    label: 'OTHER INCOME COMPONENTS',
    isSection: true,
    amount: '',
    children: [
      { id: 'a1', tag: 'A.1', label: 'Debt Forgiveness', amount: '0.00', ccy: 'CAD' },
      { id: 'a2', tag: 'A.2', label: 'Prior Year G', amount: '0.00', ccy: 'CAD' },
    ],
  },
];

// ─── Dot ring for the orbital menu trigger ────────────────────────────────────
function MiniDotRing({
  radius,
  dotCount,
  dotRadius,
  color1,
  color2,
  animDir = 1,
  duration = 20,
}: {
  radius: number;
  dotCount: number;
  dotRadius: number;
  color1: string;
  color2: string;
  animDir?: 1 | -1;
  duration?: number;
}) {
  const size = (radius + dotRadius + 4) * 2;
  const cx = size / 2;
  const cy = size / 2;

  const dots = Array.from({ length: dotCount }, (_, i) => {
    const angle = (i / dotCount) * Math.PI * 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    const t = i / dotCount;
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return { x, y, fill: `rgb(${r},${g},${b})` };
  });

  const animId = `mini-rot-${radius}-${animDir > 0 ? 'cw' : 'ccw'}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="absolute pointer-events-none"
      style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
    >
      <style>{`
        @keyframes ${animId} {
          from { transform: rotate(0deg); }
          to { transform: rotate(${animDir > 0 ? 360 : -360}deg); }
        }
      `}</style>
      <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: `${animId} ${duration}s linear infinite` }}>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={dotRadius} fill={d.fill} opacity={0.9} />
        ))}
      </g>
    </svg>
  );
}

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

  // Fan out in a semicircle above the trigger (upward arc)
  const RADIUS = 175;
  const count = MILESTONES.length;

  return (
    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50" style={{ width: 1, height: 1 }}>
      {MILESTONES.map((m, i) => {
        // Spread from -160° to -20° (upward arc, left to right)
        const startAngle = -160 * (Math.PI / 180);
        const endAngle = -20 * (Math.PI / 180);
        const angle = startAngle + (i / (count - 1)) * (endAngle - startAngle);
        const x = Math.cos(angle) * RADIUS;
        const y = Math.sin(angle) * RADIUS;
        const isActive = activeMilestone === m.id;

        return (
          <button
            key={m.id}
            onClick={() => { onSelect(m.id); onClose(); }}
            className={cn(
              'absolute flex flex-col items-center gap-1 group',
              'transition-all duration-200 hover:scale-110',
            )}
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Node circle */}
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200',
                isActive
                  ? 'text-white border-transparent shadow-lg'
                  : m.done
                  ? 'bg-white border-green-400 text-green-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:border-gray-500',
              )}
              style={
                isActive
                  ? { background: `linear-gradient(135deg, ${PURPLE}, ${ORANGE})`, borderColor: 'transparent' }
                  : {}
              }
            >
              {m.icon}
              {/* Green checkmark badge */}
              {m.done && !isActive && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <Check size={9} className="text-white" strokeWidth={3} />
                </span>
              )}
            </div>
            {/* Label */}
            <span className={cn(
              'text-[9px] font-500 whitespace-nowrap',
              isActive ? 'text-gray-800' : 'text-gray-500',
            )}>
              {m.label}
            </span>
          </button>
        );
      })}

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-gray-400 hover:text-gray-600 text-xs flex items-center gap-1"
      >
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
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
          style={{ background: '#f3f4f6' }}
        >
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
            <span className="text-sm font-600 text-gray-800">AI Assistant</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-700 leading-relaxed">
              <span className="font-600 text-gray-700">AI:</span> I've reviewed the FAPI worksheet for SAS paris. All sections are currently at zero — you'll need to enter the annual average FX rate and property income figures to begin the calculation.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-700 leading-relaxed">
              <span className="font-600 text-gray-600">Suggestion:</span> For the FX rate, the Bank of Canada annual average EUR/CAD rate for 2025 is approximately 1.4821. Would you like me to populate this?
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <p className="text-xs text-gray-700 leading-relaxed">
              <span className="font-600 text-gray-600">Note:</span> Under ss.95(1) ITA, SAS paris qualifies as a controlled foreign affiliate. Property income from dividends received from non-resident corporations will be included in FAPI under Component A.
            </p>
          </div>
        </div>
        <div className="p-3 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              placeholder="Ask the AI assistant…"
              className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none placeholder-gray-400"
            />
            <button
              className="px-3 py-2 rounded-lg text-white text-xs font-600"
              style={{ background: '#374151' }}
            >
              Send
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
            <FileText size={14} className="text-gray-500" />
            <span className="text-sm font-600 text-gray-800">Client Context</span>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-500">✓ Complete</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Facts & Assumptions */}
          <div>
            <div className="text-[10px] font-700 text-gray-400 uppercase tracking-wider mb-2">Facts & Assumptions</div>
            <div className="space-y-2">
              {[
                { label: 'Canadian Parent', value: 'Northstar Inc. — Canadian-controlled private corporation (CCPC) resident in Canada.' },
                { label: 'Foreign Affiliate', value: 'SAS paris — French société par actions simplifiée, 100% owned by Northstar Inc.' },
                { label: 'Income Type', value: 'Rental income from commercial property in Paris, France.' },
                { label: 'Ownership', value: 'Direct 100% ownership; SAS paris is a controlled foreign affiliate (CFA) under ss.95(1) ITA.' },
                { label: 'Assumption', value: 'All amounts are in EUR; FX conversion uses annual average Bank of Canada rate.' },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-2.5">
                  <div className="text-[10px] font-600 text-gray-600 mb-0.5">{item.label}</div>
                  <div className="text-[11px] text-gray-700 leading-relaxed">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ITA Application */}
          <div>
            <div className="text-[10px] font-700 text-gray-400 uppercase tracking-wider mb-2">ITA Application</div>
            <div className="space-y-2">
              {[
                { provision: 'ss.95(1)', title: 'FA Status', status: 'confirmed', note: 'SAS paris meets the definition of a foreign affiliate.' },
                { provision: 'ss.95(1)', title: 'FAPI Component A', status: 'confirmed', note: 'Rental income is property income included in FAPI.' },
                { provision: 'ss.95(2)', title: 'Recharacterization', status: 'pending', note: 'Review whether any income is recharacterized as active business income.' },
                { provision: 'ss.91(1)', title: 'FAPI Inclusion', status: 'confirmed', note: 'Northstar Inc. must include its share of FAPI in income.' },
                { provision: 'ss.91(4)', title: 'FAPIT Deduction', status: 'pending', note: 'Foreign accrual property income tax (FAPIT) deduction to be calculated.' },
              ].map((item) => (
                <div key={item.provision + item.title} className="flex gap-2 bg-gray-50 rounded-lg p-2.5">
                  <div className="shrink-0">
                    <span className={cn(
                      'text-[9px] px-1.5 py-0.5 rounded font-600',
                      item.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700',
                    )}>
                      {item.provision}
                    </span>
                  </div>
                  <div>
                    <div className="text-[10px] font-600 text-gray-700">{item.title}</div>
                    <div className="text-[10px] text-gray-500 leading-relaxed">{item.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (milestone === 'upload') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Upload size={14} className="text-gray-500" />
            <span className="text-sm font-600 text-gray-800">Upload Documents</span>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-500">✓ 3 files</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Drop zone */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-gray-300 transition-colors cursor-pointer">
            <Upload size={20} className="text-gray-400" />
            <p className="text-xs font-500 text-gray-600">Drop files here or click to upload</p>
            <p className="text-[10px] text-gray-400">PDF, Excel, CSV — max 50MB</p>
          </div>

          {/* Uploaded files */}
          <div>
            <div className="text-[10px] font-700 text-gray-400 uppercase tracking-wider mb-2">Uploaded Files</div>
            <div className="space-y-2">
              {[
                { name: 'SAS_paris_FS_2025.pdf', size: '2.4 MB', type: 'Financial Statements', status: 'processed' },
                { name: 'FX_rates_2025.xlsx', size: '156 KB', type: 'FX Rate Table', status: 'processed' },
                { name: 'Rental_income_schedule.pdf', size: '890 KB', type: 'Income Schedule', status: 'processing' },
              ].map((file) => (
                <div key={file.name} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
                  <FileText size={14} className="text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-500 text-gray-700 truncate">{file.name}</div>
                    <div className="text-[10px] text-gray-400">{file.type} · {file.size}</div>
                  </div>
                  <span className={cn(
                    'text-[9px] px-1.5 py-0.5 rounded-full font-500',
                    file.status === 'processed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700',
                  )}>
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
            <MapPin size={14} className="text-gray-500" />
            <span className="text-sm font-600 text-gray-800">Sources Mapping</span>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-500">✓ Mapped</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="text-[10px] text-gray-500 mb-3">
            AI-extracted data points mapped to calculator fields
          </div>
          {[
            { source: 'SAS_paris_FS_2025.pdf · p.12', field: 'Property Income — Dividendes', value: '€0.00', confidence: 98, status: 'mapped' },
            { source: 'FX_rates_2025.xlsx · Row 47', field: 'Annual Average FX Rate (EUR/CAD)', value: '1.000000', confidence: 95, status: 'mapped' },
            { source: 'Rental_income_schedule.pdf · p.3', field: 'Rental Income (gross)', value: 'Pending', confidence: 0, status: 'pending' },
          ].map((row) => (
            <div key={row.field} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="text-[10px] font-600 text-gray-700">{row.field}</div>
                <span className={cn(
                  'text-[9px] px-1.5 py-0.5 rounded-full font-500 shrink-0',
                  row.status === 'mapped' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700',
                )}>
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

  // IRL — Additional client info requests
  if (milestone === 'irl') {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-gray-400" />
            <span className="text-xs font-600 text-gray-700">Information Request Letter</span>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-500">2 pending</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Additional client information needed to complete the FAPI calculation</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {[
            { id: 1, question: 'Please confirm the annual average CAD/EUR exchange rate used for the fiscal year.', status: 'pending', due: 'Jun 15' },
            { id: 2, question: 'Provide the breakdown of property income between rental and interest components.', status: 'pending', due: 'Jun 15' },
            { id: 3, question: 'Confirm whether any income was recharacterized as active business income under ss.95(2).', status: 'received', due: 'Jun 10' },
            { id: 4, question: 'Provide the opening and closing surplus balances for SAS Paris for the fiscal year.', status: 'received', due: 'Jun 10' },
          ].map((item) => (
            <div key={item.id} className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] text-gray-700 leading-relaxed flex-1">{item.question}</p>
                <span className={cn(
                  'shrink-0 text-[9px] px-1.5 py-0.5 rounded-full font-600',
                  item.status === 'received' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700',
                )}>
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
          <button
            className="w-full mt-2 flex items-center justify-center gap-1.5 text-[11px] font-600 py-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors"
          >
            <Plus size={12} /> Add request
          </button>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 shrink-0">
          <button
            className="w-full py-2 rounded-xl text-white text-xs font-600 flex items-center justify-center gap-2"
            style={{ background: '#374151' }}
          >
            <Mail size={12} /> Send IRL to client
          </button>
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
        <Clock size={11} />
        Not started
      </div>
    </div>
  );
}

// ─── FAPI Calculator ──────────────────────────────────────────────────────────
function FapiCalculator({
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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(['a']));

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderRow = (row: CalcRow, depth = 0) => {
    const isExpanded = expandedRows.has(row.id);
    const hasChildren = row.children && row.children.length > 0;

    return (
      <div key={row.id}>
        {/* Section header — no colored bar */}
        {row.isSection ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
            <span className="text-[10px] font-700 text-gray-500 uppercase tracking-widest">{row.label}</span>
          </div>
        ) : (
          /* Data row */
          <div
            className={cn(
              'flex items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors group',
              depth > 0 ? 'pl-8' : '',
            )}
            style={{ minHeight: '40px' }}
          >
            {/* Expand toggle */}
            <div className="w-8 flex items-center justify-center shrink-0">
              {hasChildren ? (
                <button
                  onClick={() => toggleRow(row.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
              ) : (
                <span className="w-3" />
              )}
            </div>

            {/* Tag badge */}
            {row.tag && (
              <div
                className="w-12 mr-3 shrink-0 flex items-center justify-center"
              >
                <span
                  className="text-[9px] font-700 px-1.5 py-0.5 rounded border text-center"
                  style={{
                    color: PURPLE,
                    borderColor: `${PURPLE}40`,
                    background: `${PURPLE}08`,
                    minWidth: '28px',
                  }}
                >
                  {row.tag}
                </span>
              </div>
            )}

            {/* Label */}
            <div className="flex-1 flex items-center gap-2 py-2 pr-4">
              <span
                className={cn(
                  'text-[12px]',
                  hasChildren ? 'font-500 text-gray-800' : 'text-gray-700',
                  depth > 0 ? 'text-gray-600' : '',
                )}
              >
                {row.label}
              </span>
              {row.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-500 border border-gray-200">
                  {row.badge}
                </span>
              )}
            </div>

            {/* Amount */}
            <div className="flex items-center gap-2 pr-4 shrink-0">
              <span
                className={cn(
                  'text-[12px] tabular-nums',
                  hasChildren ? 'font-600 text-gray-800' : 'text-gray-700',
                )}
              >
                {row.amount}
              </span>
              {row.ccy && (
                <span className="text-[10px] text-gray-400 font-400 w-10">{row.ccy}</span>
              )}
              {/* Row action icons */}
              {row.showIcons && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-gray-400 hover:text-gray-600 p-0.5">
                    <FileText size={11} />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600 p-0.5">
                    <Clock size={11} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Children */}
        {hasChildren && (row.isSection || isExpanded) && (
          <div>
            {row.children!.map((child) => renderRow(child, depth + (row.isSection ? 0 : 1)))}
            {/* Add row button */}
            {row.showAddBtn && isExpanded && (
              <div className="flex justify-end px-4 py-1 border-b border-gray-50">
                <button className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 transition-colors">
                  <Plus size={10} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Calculator header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="text-[10px] font-700 text-gray-400 uppercase tracking-widest mb-0.5">FAPI WORKSHEET</div>
        <div className="text-lg font-600 text-gray-900">Foreign Accrual Property Income</div>
      </div>

      {/* Selectors bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 flex-wrap">
        {/* Company */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-gray-400 font-600 uppercase tracking-wider text-[9px]">Company</span>
          <span className="font-500 text-gray-800 bg-gray-100 px-2 py-1 rounded text-[11px]">Northstar Inc.</span>
        </div>

        {/* Country */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-gray-400 font-600 uppercase tracking-wider text-[9px]">Country</span>
          <span className="font-500 text-gray-800 bg-gray-100 px-2 py-1 rounded text-[11px]">France</span>
        </div>

        {/* Affiliate selector */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-gray-400 font-600 uppercase tracking-wider text-[9px]">Affiliate</span>
          <select
            value={affiliate}
            onChange={(e) => onAffiliateChange(e.target.value)}
            className="font-500 text-gray-800 bg-gray-100 px-2 py-1 rounded text-[11px] border-0 outline-none cursor-pointer hover:bg-gray-200 transition-colors"
          >
            {AFFILIATES.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* FAPI Year selector */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-gray-400 font-600 uppercase tracking-wider text-[9px]">FAPI Year</span>
          <select
            value={year}
            onChange={(e) => onYearChange(e.target.value)}
            className="font-500 text-gray-800 bg-gray-100 px-2 py-1 rounded text-[11px] border-0 outline-none cursor-pointer hover:bg-gray-200 transition-colors"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* + New affiliate */}
        <button className="flex items-center gap-1 text-[11px] font-500 px-2.5 py-1 rounded border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all">
          <Plus size={11} />
          New affiliate
        </button>
      </div>

      {/* Table header */}
      <div className="flex items-center px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="w-8 shrink-0" />
        <div className="w-16 shrink-0" />
        <div className="flex-1 text-[10px] font-700 text-gray-500 uppercase tracking-wider">Description</div>
        <div className="text-[10px] font-700 text-gray-500 uppercase tracking-wider pr-4 w-24 text-right">Amount</div>
        <div className="text-[10px] font-700 text-gray-500 uppercase tracking-wider w-14">CCY</div>
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
            Results Summary
          </button>
          <div className="ml-auto">
            <button className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-700 transition-colors">
              <Download size={12} />
              Export results
            </button>
          </div>
        </div>

        {/* Summary table */}
        <div className="px-4 py-3">
          <div className="flex justify-end mb-2">
            <span className="text-[10px] font-700 text-gray-400 uppercase tracking-wider w-24 text-right pr-4">CAD</span>
          </div>
          {[
            { label: 'Gross', value: '—', bold: false },
            { label: 'Deductions', value: '—', bold: false },
            { label: 'FAPI Brut', value: '—', bold: true },
            { label: 'FAT Deduction', value: '—', bold: false },
            { label: 'Net FAPI', value: '—', bold: true },
          ].map((row) => (
            <div key={row.label} className="flex items-center py-1">
              <div className="w-8 shrink-0" />
              <div className="flex-1 text-[12px] text-gray-700 pl-16">{row.label}</div>
              <div
                className={cn(
                  'text-[12px] tabular-nums w-24 text-right pr-4',
                  row.bold ? 'font-700 text-gray-900' : 'text-gray-600',
                )}
              >
                {row.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main FapiWorksheet ───────────────────────────────────────────────────────

// ─── InScope animated logo trigger (exact OrbitalStage style) ────────────────
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
  const centerLabel = activeMilestone
    ? (MILESTONES.find((m) => m.id === activeMilestone)?.label ?? '')
    : '';
  return (
    <>
      <style>{`
        @keyframes fapi-cw  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fapi-ccw { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        .fapi-cw  { animation: fapi-cw  9s linear infinite; transform-origin: ${CX}px ${CY}px; }
        .fapi-ccw { animation: fapi-ccw 6s linear infinite; transform-origin: ${CX}px ${CY}px; }
      `}</style>
      <button onClick={onClick} aria-label="Open milestone menu"
        className="relative select-none transition-transform duration-200 hover:scale-105 active:scale-95"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, width: SIZE, height: SIZE }}
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ position: 'absolute', inset: 0 }}>
          <g className="fapi-cw">
            {Array.from({ length: outerDots }, (_, i) => {
              const a = (i / outerDots) * Math.PI * 2;
              const FADE = 6; const dist = Math.min(i, outerDots - 1 - i);
              const raw = dist >= FADE ? 1 : dist / FADE;
              const env = Math.pow(raw, 0.5);
              if (raw === 0) return null;
              return <circle key={i} cx={CX + OUTER_R * Math.cos(a)} cy={CY + OUTER_R * Math.sin(a)} r={1.4 * env} fill={PURPLE} opacity={0.88 * env} />;
            })}
          </g>
          <g className="fapi-ccw">
            {Array.from({ length: innerDots }, (_, i) => {
              const a = (i / innerDots) * Math.PI * 2;
              const FADE = 5; const dist = Math.min(i, innerDots - 1 - i);
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
              <span style={{ fontSize: 9, fontWeight: 800, color: '#111827', lineHeight: 1.2, textAlign: 'center', maxWidth: INNER_R * 2 - 8, display: 'block' }}>FAPI</span>
              <span style={{ fontSize: 6, color: '#9CA3AF', marginTop: 2 }}>{doneCount}/{total} done</span>
            </>
          )}
        </div>
      </button>
    </>
  );
}

export default function FapiWorksheet() {
  const [, navigate] = useLocation();

  // State
  const [affiliate, setAffiliate] = useState('SAS paris');
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
        {/* InScope logo — matches AppShell wordmark */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 select-none hover:opacity-80 transition-opacity"
        >
          <span className="text-sm font-700 tracking-tight text-gray-900">Sinaxe</span>
          <span className="text-[10px] text-gray-300 font-400">™</span>
          <span className="text-sm font-700 tracking-tight" style={{ color: PURPLE }}>InScope</span>
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span className="text-gray-300">·</span>
          <button onClick={() => navigate('/')} className="hover:text-gray-600 transition-colors">Northstar Inc.</button>
          <span className="text-gray-300">›</span>
          <button onClick={() => navigate('/')} className="hover:text-gray-600 transition-colors">ICT</button>
          <span className="text-gray-300">›</span>
          <button onClick={() => navigate('/')} className="hover:text-gray-600 transition-colors">Calculate</button>
          <span className="text-gray-300">›</span>
          <span className="text-gray-600 font-500">FAPI Worksheet</span>
        </div>

        {/* Milestone progress */}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {MILESTONES.map((m) => (
                <div
                  key={m.id}
                  className="w-4 h-1 rounded-full transition-all"
                  style={{ background: m.done ? '#22c55e' : '#e5e7eb' }}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-400 font-500">{doneCount}/{MILESTONES.length} milestones</span>
          </div>
        </div>
      </div>

            {/* Main content area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT PANEL — Calculator, shrinks when right panel opens */}
        <div
          className="flex flex-col overflow-hidden border-r border-gray-100"
          style={{
            flex: rightPanelOpen ? '0 0 62%' : '1 1 0%',
            transition: 'flex-basis 300ms cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        >
          <FapiCalculator
            affiliate={affiliate}
            year={year}
            onAffiliateChange={setAffiliate}
            onYearChange={setYear}
          />
        </div>

        {/* RIGHT PANEL — slides in from the right edge */}
        <div
          className="absolute top-0 right-0 bottom-0 flex flex-col bg-white border-l border-gray-100 shadow-[-4px_0_16px_rgba(0,0,0,0.06)]"
          style={{
            width: '38%',
            transform: rightPanelOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 300ms cubic-bezier(0.23, 1, 0.32, 1)',
            pointerEvents: rightPanelOpen ? 'auto' : 'none',
          }}
        >
          {/* Right panel header */}
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
          {/* Right panel content */}
          <div className="flex-1 overflow-hidden">
            <RightPanelContent milestone={activeMilestone} />
          </div>
        </div>

        {/* ANIMATED INSCOPE LOGO — bottom-center when panel closed, anchored to panel divider when open */}
        <div
          className="absolute z-30 flex flex-col items-center"
          style={{
            ...(rightPanelOpen
              ? {
                  // Anchored to the divider between left (62%) and right (38%) panels
                  right: '38%',
                  bottom: '24px',
                  transform: 'translateX(50%)',
                }
              : {
                  // Bottom-center of the full content area
                  left: '50%',
                  bottom: '24px',
                  transform: 'translateX(-50%)',
                }),
            transition: 'all 300ms cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        >
          {/* Orbital menu nodes fan out above */}
          <div className="relative">
            <OrbitalMilestoneMenu
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              onSelect={handleMilestoneSelect}
              activeMilestone={activeMilestone}
            />

            {/* Exact InScope animated logo — same as OrbitalStage level 0 */}
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
