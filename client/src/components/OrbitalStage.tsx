// OrbitalStage.tsx — Sinaxe InScope v2.0 — Skeuomorphic edition

import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  Search, X, ChevronDown,
  // Service line icons
  Globe, Handshake, Receipt, Building, Scale, Lightbulb, Flag,
  // Action icons
  Send, Calculator, ClipboardCheck, FileText, Activity, BookOpen,
  // Sub-action / fallback
  Lock, Mail, Calendar, TrendingUp, FileSpreadsheet, Database,
  Layers, Shield, PenLine, DollarSign, Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PURPLE = '#6B21A8';
const ORANGE = '#C2410C';

// ─── Data ─────────────────────────────────────────────────────────────────────
const CLIENTS = [
  'Northstar Inc.',
  'Meridian Energy Corp.',
  'Atlas Financial Group',
  'Cascade Technologies Ltd.',
  'Vantage Capital Partners',
  'Solaris Group',
  'Pinnacle Holdings',
  'Redwood Industries',
];

type IconComponent = React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;

const SERVICE_LINES: { id: string; label: string; subtitle: string; icon: IconComponent }[] = [
  { id: 'ict', label: 'ICT',               subtitle: 'International Corporate Tax', icon: Globe },
  { id: 'ma',  label: 'M&A',               subtitle: 'Mergers & Acquisitions',       icon: Handshake },
  { id: 'ind', label: 'Indirect Tax',       subtitle: 'GST/HST & Customs',           icon: Receipt },
  { id: 'pe',  label: 'Private Enterprise', subtitle: 'Owner-managed business',       icon: Building },
  { id: 'tp',  label: 'Transfer Pricing',   subtitle: 'OECD-aligned pricing',         icon: Scale },
  { id: 'ti',  label: 'Tax Incentives',     subtitle: 'SR&ED, Credits',               icon: Lightbulb },
  { id: 'us',  label: 'US Tax',             subtitle: 'Cross-border US matters',      icon: Flag },
];

const ACTIONS: Record<string, { id: string; label: string; subtitle: string; icon: IconComponent }[]> = {
  ict: [
    { id: 'request',   label: 'Request',   subtitle: 'IRL, Engagement',      icon: Send },
    { id: 'calculate', label: 'Calculate', subtitle: 'FAPI, Surplus, EIFEL', icon: Calculator },
    { id: 'comply',    label: 'Comply',    subtitle: 'T1134, T106, Pillar 2', icon: ClipboardCheck },
    { id: 'advise',    label: 'Advise',    subtitle: 'Memos & decks',          icon: FileText },
    { id: 'analyze',   label: 'Analyze',   subtitle: 'Dashboards',             icon: Activity },
    { id: 'research',  label: 'Research',  subtitle: 'ITA, rulings, treaties', icon: BookOpen },
  ],
  ma:  [
    { id: 'diligence', label: 'Diligence', subtitle: 'Tax due diligence',  icon: Search },
    { id: 'structure', label: 'Structure', subtitle: 'Deal structuring',   icon: Layers },
    { id: 'model',     label: 'Model',     subtitle: 'Tax modelling',      icon: Calculator },
    { id: 'memo',      label: 'Memo',      subtitle: 'Advisory memos',     icon: FileText },
  ],
  ind: [
    { id: 'gst',      label: 'GST/HST',  subtitle: 'Compliance & planning', icon: ClipboardCheck },
    { id: 'customs',  label: 'Customs',  subtitle: 'Import/export duties',  icon: Package },
    { id: 'excise',   label: 'Excise',   subtitle: 'Excise tax matters',    icon: Receipt },
    { id: 'recovery', label: 'Recovery', subtitle: 'Input tax credits',     icon: TrendingUp },
  ],
  pe:  [
    { id: 'compliance', label: 'Compliance', subtitle: 'Corporate returns',      icon: ClipboardCheck },
    { id: 'planning',   label: 'Planning',   subtitle: 'Owner remuneration',     icon: FileText },
    { id: 'estate',     label: 'Estate',     subtitle: 'Succession planning',    icon: Building },
    { id: 'reorg',      label: 'Reorg',      subtitle: 'Corporate restructuring', icon: Layers },
  ],
  tp:  [
    { id: 'benchmark', label: 'Benchmark', subtitle: 'Comparables analysis', icon: Scale },
    { id: 'document',  label: 'Document',  subtitle: 'TP documentation',     icon: FileText },
    { id: 'defend',    label: 'Defend',    subtitle: 'Audit defence',         icon: Shield },
    { id: 'plan',      label: 'Plan',      subtitle: 'TP planning',           icon: Activity },
  ],
  ti:  [
    { id: 'sred',    label: 'SR&ED',   subtitle: 'R&D tax credits',          icon: Lightbulb },
    { id: 'credits', label: 'Credits', subtitle: 'Investment tax credits',   icon: DollarSign },
    { id: 'grants',  label: 'Grants',  subtitle: 'Government incentives',    icon: Globe },
    { id: 'review',  label: 'Review',  subtitle: 'Eligibility review',       icon: ClipboardCheck },
  ],
  us:  [
    { id: 'compliance',  label: 'Compliance',  subtitle: 'US tax returns',        icon: FileSpreadsheet },
    { id: 'planning',    label: 'Planning',    subtitle: 'Cross-border planning', icon: Activity },
    { id: 'treaty',      label: 'Treaty',      subtitle: 'Treaty positions',      icon: Scale },
    { id: 'withholding', label: 'Withholding', subtitle: 'WHT compliance',        icon: PenLine },
  ],
};

const SUB_ACTIONS: Record<string, { id: string; label: string; subtitle: string; icon?: IconComponent; route?: string; overflow?: boolean }[]> = {
  request: [
    { id: 'irl',        label: 'IRL',         subtitle: 'Info request letter',  icon: Mail },
    { id: 'engagement', label: 'Eng. Letter',  subtitle: 'Engagement letter',    icon: FileText },
    { id: 'mfe',        label: 'MFE',          subtitle: 'Multi-firm engagement', icon: Handshake },
    { id: 'billing',    label: 'Billing',      subtitle: 'Fee arrangements',     icon: DollarSign },
    { id: 'meeting',    label: 'Meeting',      subtitle: 'Client meetings',      icon: Calendar },
  ],
  calculate: [
    { id: 'fapi',        label: 'FAPI',        subtitle: 'FAPI calculator',      route: '/fapi' },
    { id: 'surplus',     label: 'Surplus',     subtitle: 'Surplus accounts',    route: '/surplus' },
    { id: 'eifel',       label: 'EIFEL',       subtitle: 'Interest limitation' },
    { id: 'safe-income', label: 'Safe Income', subtitle: 'Safe income calc' },
    { id: 'tcp',         label: 'TCP',         subtitle: 'Thin cap planning' },
    { id: 'ep-analysis', label: 'EP Analysis', subtitle: 'E&P analysis',          overflow: true },
    { id: 'ul-analysis', label: 'UL Analysis', subtitle: 'UL analysis',            overflow: true },
    { id: 'fixed-assets',label: 'Fixed Assets',subtitle: 'Fixed assets continuity', overflow: true },
  ],
  comply: [
    { id: 't1134-comply', label: 'T1134',    subtitle: 'Foreign affiliate filing', route: '/t1134' },
    { id: 't106',         label: 'T106',     subtitle: 'Related-party transactions' },
    { id: 'pillar2',      label: 'Pillar 2', subtitle: 'Global minimum tax' },
    { id: 'rollover',     label: 'Rollover', subtitle: 'Section 85 rollover',         overflow: true },
    { id: 'nr4',          label: 'NR4',      subtitle: 'Non-resident withholding',    overflow: true },
    { id: 't1135',        label: 'T1135',    subtitle: 'Foreign income verification', overflow: true },
  ],
  advise: [
    { id: 'asset-deck',  label: 'Asset Deck',  subtitle: 'Asset sale analysis' },
    { id: 'shares-deck', label: 'Shares Deck', subtitle: 'Share sale analysis' },
    { id: 'hybrid-deck', label: 'Hybrid Deck', subtitle: 'Hybrid structure' },
    { id: 'memo-advise', label: 'Memo',         subtitle: 'Advisory memo' },
  ],
  analyze: [
    { id: 'client-workspace', label: 'Client Workspace', subtitle: 'Active workflows & team', route: '/client/northstar' },
    { id: 'my-engagements',   label: 'My Engagements',   subtitle: 'LOS overview & pipeline', route: '/dashboard' },
    { id: 'tax-attributes',   label: 'Tax Attributes',   subtitle: 'Coming soon' },
  ],
};

// ─── Animated InScope logo ────────────────────────────────────────────────────
function InScopeLogo({ clientName, level, levelLabel, onClick }: {
  clientName: string;
  level: number;
  levelLabel: string;
  onClick: () => void;
}) {
  const SIZE = 170;  // larger to fit longer client names
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const OUTER_R = 57;
  const INNER_R = 43;
  const outerDots = 40;
  const innerDots = 26;

  return (
    <>
      <style>{`
        @keyframes logo-cw  { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
        @keyframes logo-ccw { from { transform: rotate(0deg);   } to { transform: rotate(-360deg); } }
        .logo-cw  { animation: logo-cw  9s linear infinite; transform-origin: ${CX}px ${CY}px; }
        .logo-ccw { animation: logo-ccw 6s linear infinite; transform-origin: ${CX}px ${CY}px; }
      `}</style>
      <button
        onClick={onClick}
        className="relative z-10 select-none"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          width: SIZE,
          height: SIZE,
          // Override global active scale for this button
          transition: 'transform 150ms cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Flat center disc behind the logo */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: '#eaeaef',
          }}
        />

        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ position: 'absolute', inset: 0 }}>
          {/* Purple outer ring — clockwise, fixed fade spots */}
          <g className="logo-cw">
            {Array.from({ length: outerDots }, (_, i) => {
              const a = (i / outerDots) * Math.PI * 2;
              const animDur = 22;
              const begin = -(i / outerDots) * animDur;
              const kt = "0;0.02;0.07;0.93;0.98;1";
              const ks = "0 0 1 1;0.42 0 1 1;0 0 1 1;0 0 0.58 1;0 0 1 1";
              return (
                <circle key={i} cx={CX + OUTER_R * Math.cos(a)} cy={CY + OUTER_R * Math.sin(a)} r={0} fill={PURPLE}>
                  <animate attributeName="r" values="0;0;0.15;2.0;0;0" keyTimes={kt} dur={`${animDur}s`} begin={`${begin}s`} repeatCount="indefinite" calcMode="spline" keySplines={ks} />
                  <animate attributeName="opacity" values="0;0;0.85;0.85;0;0" keyTimes={kt} dur={`${animDur}s`} begin={`${begin}s`} repeatCount="indefinite" calcMode="spline" keySplines={ks} />
                </circle>
              );
            })}
          </g>
          {/* Orange inner ring — counter-clockwise, fixed fade spots */}
          <g className="logo-ccw">
            {Array.from({ length: innerDots }, (_, i) => {
              const a = (i / innerDots) * Math.PI * 2;
              const animDur = 15;
              const begin = -((innerDots - i) / innerDots) * animDur;
              const kt = "0;0.02;0.07;0.93;0.98;1";
              const ks = "0 0 1 1;0.42 0 1 1;0 0 1 1;0 0 0.58 1;0 0 1 1";
              return (
                <circle key={i} cx={CX + INNER_R * Math.cos(a)} cy={CY + INNER_R * Math.sin(a)} r={0} fill={ORANGE}>
                  <animate attributeName="r" values="0;0;0.15;1.7;0;0" keyTimes={kt} dur={`${animDur}s`} begin={`${begin}s`} repeatCount="indefinite" calcMode="spline" keySplines={ks} />
                  <animate attributeName="opacity" values="0;0;0.85;0.85;0;0" keyTimes={kt} dur={`${animDur}s`} begin={`${begin}s`} repeatCount="indefinite" calcMode="spline" keySplines={ks} />
                </circle>
              );
            })}
          </g>
        </svg>

        {/* Center label — context-aware:
             level 0: client name + "tap to switch"
             level 1+: context label (service/action) + "← back"
             Client name at level 1+ is rendered OUTSIDE the ring by the parent.
        */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ pointerEvents: 'none', gap: 2 }}
        >
          {levelLabel ? (
            // Level 1+: context label fills the orange ring, bold
            <>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#111827',
                  lineHeight: 1.15,
                  textAlign: 'center',
                  maxWidth: INNER_R * 2 - 10,
                  display: 'block',
                  wordBreak: 'break-word',
                }}
              >
                {levelLabel}
              </span>
              <span style={{ fontSize: 7, color: '#9CA3AF', marginTop: 4 }}>← back</span>
            </>
          ) : (
            // Level 0: client name fills the orange ring
            <>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#111827',
                  lineHeight: 1.15,
                  textAlign: 'center',
                  maxWidth: INNER_R * 2 - 10,
                  display: 'block',
                  wordBreak: 'break-word',
                }}
              >
                {clientName}
              </span>
              <span style={{ fontSize: 7, color: '#9CA3AF', marginTop: 4 }}>tap to switch</span>
            </>
          )}
        </div>
      </button>
    </>
  );
}

// ─── Client switcher overlay ──────────────────────────────────────────────────
function ClientSwitcher({
  currentClient,
  onSelect,
  onClose,
}: {
  currentClient: string;
  onSelect: (c: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const filtered = CLIENTS.filter((c) => c.toLowerCase().includes(query.toLowerCase()));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backdropFilter: 'blur(14px)', background: 'rgba(244,244,246,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl w-80 overflow-hidden"
        style={{
          boxShadow: '0 20px 56px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.07)',
          border: '1px solid rgba(0,0,0,0.07)',
          animation: 'fadeScaleIn 0.16s cubic-bezier(0.23,1,0.32,1)',
        }}
      >
        <style>{`@keyframes fadeScaleIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }`}</style>
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
          <Search size={13} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients…"
            className="flex-1 text-[13px] outline-none bg-transparent text-gray-700 placeholder-gray-400"
          />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={13} />
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto py-1">
          {filtered.map((client) => (
            <button
              key={client}
              onClick={() => onSelect(client)}
              className={cn(
                'w-full text-left px-4 py-2.5 text-[12.5px] flex items-center gap-2 transition-colors hover:bg-gray-50',
                client === currentClient ? 'font-600 text-gray-900' : 'font-400 text-gray-600',
              )}
            >
              <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-[10px] font-600 shrink-0">
                {client.charAt(0)}
              </span>
              {client}
              {client === currentClient && (
                <span className="ml-auto text-[10px] text-gray-400">active</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Skeuomorphic orbital node ────────────────────────────────────────────────
function OrbitalNode({
  label,
  subtitle,
  angle,
  radius,
  onClick,
  highlighted,
  onHover,
  hasOverflow,
  overflowItems,
  staggerIndex = 0,
  exiting = false,
}: {
  label: string;
  subtitle: string;
  angle: number;
  radius: number;
  onClick: () => void;
  highlighted: boolean;
  onHover: (label: string | null) => void;
  hasOverflow?: boolean;
  overflowItems?: { id: string; label: string; subtitle: string }[];
  staggerIndex?: number;
  exiting?: boolean;
}) {
  const [showOverflow, setShowOverflow] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  // Neumorphic orb style — flat extruded look, same color as background
  const NEU_BG = '#eaeaef';
  const NEU_SHADOW_DARK = 'rgba(158,158,178,0.42)';
  const NEU_SHADOW_LIGHT = 'rgba(255,255,255,0.86)';
  const transition = [
    'background 180ms ease-out',
    'box-shadow 180ms ease-out',
    'transform 180ms cubic-bezier(0.34,1.56,0.64,1)',
  ].join(', ');

  const orbStyle: React.CSSProperties = isPressed
    ? {
        width: 110,
        height: 110,
        borderRadius: '50%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        background: '#e2e2e9',
        boxShadow: [
          `inset 5px 5px 12px ${NEU_SHADOW_DARK}`,
          `inset -5px -5px 12px ${NEU_SHADOW_LIGHT}`,
        ].join(', '),
        border: 'none',
        transform: 'scale(0.96)',
        transition,
      }
    : highlighted
    ? {
        width: 110,
        height: 110,
        borderRadius: '50%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        background: NEU_BG,
        boxShadow: [
          `11px 11px 24px ${NEU_SHADOW_DARK}`,
          `-11px -11px 24px ${NEU_SHADOW_LIGHT}`,
          '0 0 0 2px rgba(168,139,250,0.30)',
        ].join(', '),
        border: 'none',
        transform: 'scale(1.05)',
        transition,
      }
    : {
        width: 110,
        height: 110,
        borderRadius: '50%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        background: NEU_BG,
        boxShadow: [
          `8px 8px 18px ${NEU_SHADOW_DARK}`,
          `-8px -8px 18px ${NEU_SHADOW_LIGHT}`,
        ].join(', '),
        border: 'none',
        transform: 'scale(1)',
        transition,
      };

  return (
    <div
      className="absolute"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className="relative flex flex-col items-center"
        style={{
          animationName: exiting ? 'nodeExit' : 'nodeEnter',
          animationDuration: exiting ? '260ms' : '460ms',
          animationTimingFunction: exiting ? 'ease-in' : 'cubic-bezier(0.34,1.56,0.64,1)',
          animationFillMode: 'both' as const,
          animationDelay: `${staggerIndex * (exiting ? 22 : 48)}ms`,
        }}
      >
        <button
          onClick={() => { if (hasOverflow) setShowOverflow((v) => !v); else onClick(); }}
          onMouseEnter={() => onHover(label)}
          onMouseLeave={() => { setIsPressed(false); onHover(null); }}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'block',
            // Prevent the global button:active scale from stacking
            transform: 'none',
          }}
        >
          <div style={orbStyle}>
            {/* LED indicator dot — small inset circle */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: highlighted
                  ? 'linear-gradient(135deg, #e879f9 0%, #a855f7 100%)'
                  : 'linear-gradient(135deg, #d1d1da 0%, #c4c4cf 100%)',
                boxShadow: highlighted
                  ? '0 0 5px rgba(168,85,247,0.55)'
                  : 'inset 1px 1px 2px rgba(255,255,255,0.7), inset -1px -1px 2px rgba(158,158,178,0.3)',
                animation: 'ledPulse 3s ease-in-out infinite',
                transition: 'background 300ms ease-out, box-shadow 300ms ease-out',
              }}
            />

            {/* Lock icon */}
            <Lock
              size={17}
              style={{
                color: highlighted ? '#9333ea' : '#a0a0b8',
                transition: 'color 200ms ease-out',
                marginTop: 8,
                flexShrink: 0,
              }}
            />

            {/* Label */}
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                lineHeight: 1.2,
                textAlign: 'center',
                padding: '0 8px',
                color: highlighted ? '#6b21a8' : '#5c5c7a',
                transition: 'color 200ms ease-out',
                maxWidth: 94,
              }}
            >
              {label}
            </span>

            {/* Subtitle */}
            <span
              style={{
                fontSize: 9,
                lineHeight: 1.2,
                textAlign: 'center',
                padding: '0 8px',
                color: highlighted ? '#a855f7' : '#9898b2',
                transition: 'color 200ms ease-out',
                maxWidth: 94,
              }}
            >
              {subtitle}
            </span>

            {hasOverflow && (
              <ChevronDown
                size={9}
                style={{ color: highlighted ? '#a855f7' : '#9898b2', marginTop: -1 }}
              />
            )}
          </div>
        </button>

        {hasOverflow && showOverflow && overflowItems && (
          <div
            className="absolute top-full mt-2 z-50 bg-white rounded-xl overflow-hidden min-w-35"
            style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.11)', border: '1px solid rgba(0,0,0,0.06)' }}
          >
            {overflowItems.map((item, idx) => (
              <button
                key={item.id}
                className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors"
                style={{ borderBottom: idx < overflowItems.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
                onClick={() => { setShowOverflow(false); onClick(); }}
              >
                <div className="text-[11px] font-600 text-gray-700">{item.label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{item.subtitle}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dotted orbit ring ────────────────────────────────────────────────────────
function DottedOrbitRing({ radius }: { radius: number }) {
  const size = (radius + 20) * 2;
  const cx = size / 2;
  const cy = size / 2;
  const dotCount = 80;
  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="absolute pointer-events-none"
      style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
    >
      {Array.from({ length: dotCount }, (_, i) => {
        const a = (i / dotCount) * Math.PI * 2;
        const large = i % 10 === 0;
        return (
          <circle
            key={i}
            cx={cx + radius * Math.cos(a)}
            cy={cy + radius * Math.sin(a)}
            r={large ? 2 : 1.2}
            fill={large ? '#b8b8c8' : '#d0d0da'}
            opacity={large ? 0.55 : 0.32}
          />
        );
      })}
    </svg>
  );
}

// ─── AI Chat Bar ──────────────────────────────────────────────────────────────
function AIChatBar({ clientName }: { clientName: string }) {
  const [active, setActive] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePillClick = () => {
    if (!active) {
      setActive(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleBlur = () => { if (!value) setActive(false); };

  const handleSend = () => { if (value.trim()) setValue(''); setActive(false); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
    if (e.key === 'Escape') { setValue(''); setActive(false); }
  };

  return (
    <div
      onClick={handlePillClick}
      className="flex items-center gap-2.5 w-full rounded-full px-3.5 py-2.5 cursor-text transition-shadow"
      style={{
        background: '#eaeaef',
        border: 'none',
        boxShadow: active
          ? 'inset 4px 4px 10px rgba(158,158,178,0.38), inset -4px -4px 10px rgba(255,255,255,0.84)'
          : '6px 6px 14px rgba(158,158,178,0.38), -6px -6px 14px rgba(255,255,255,0.84)',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0">
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <circle key={i} cx={9 + 6.5 * Math.cos(a)} cy={9 + 6.5 * Math.sin(a)} r={1.1} fill={ORANGE} opacity={0.9} />;
        })}
      </svg>

      {active ? (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={`Ask anything about ${clientName}…`}
          className="flex-1 text-[12px] text-gray-700 outline-none bg-transparent placeholder:text-gray-300"
        />
      ) : (
        <span className="flex-1 text-[12px] text-gray-400 truncate select-none">
          Click on an action item or ask me anything about {clientName}
        </span>
      )}

      <button
        onMouseDown={(e) => { e.preventDefault(); handleSend(); }}
        className="flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition-all"
        style={{
          background: active ? '#111827' : '#E5E7EB',
          opacity: active ? 1 : 0.4,
          cursor: active ? 'pointer' : 'default',
          pointerEvents: active ? 'auto' : 'none',
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={active ? 'white' : '#9CA3AF'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Main OrbitalStage ────────────────────────────────────────────────────────
export default function OrbitalStage() {
  const [, navigate] = useLocation();

  const [level, setLevel] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [flyingNode, setFlyingNode] = useState<{ id: string; x: number; y: number; label: string } | null>(null);
  const [selectedClient, setSelectedClient] = useState('Northstar Inc.');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [showClientSwitcher, setShowClientSwitcher] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const [stageSize, setStageSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onResize = () => setStageSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  type SimpleNode = { id: string; label: string; subtitle: string; icon?: IconComponent; route?: string; overflow?: boolean };

  const currentNodes: SimpleNode[] = (() => {
    if (level === 0) return SERVICE_LINES.map((s) => ({ id: s.id, label: s.label, subtitle: s.subtitle, icon: s.icon }));
    if (level === 1 && selectedService) return (ACTIONS[selectedService] || []).map(a => ({ ...a }));
    if (level === 2 && selectedAction) return (SUB_ACTIONS[selectedAction] || []).filter((s) => !s.overflow);
    return [];
  })();

  const overflowItems = (() => {
    if (level === 2 && selectedAction) return (SUB_ACTIONS[selectedAction] || []).filter((s) => s.overflow);
    return [];
  })();

  const nodeCount = currentNodes.length + (overflowItems.length > 0 ? 1 : 0);
  const RADIUS = Math.min(340, Math.max(190, Math.min(stageSize.w, stageSize.h) * 0.28));

  const handleNodeClick = (nodeId: string, nodeX: number, nodeY: number, nodeLabel: string) => {
    if (level === 2) {
      const sub = (SUB_ACTIONS[selectedAction!] || []).find((s) => s.id === nodeId);
      if (sub?.route) navigate(sub.route);
      return;
    }
    setExiting(true);
    setFlyingNode({ id: nodeId, x: nodeX, y: nodeY, label: nodeLabel });
    setTimeout(() => {
      if (level === 0) { setSelectedService(nodeId); setLevel(1); }
      else if (level === 1) { setSelectedAction(nodeId); setLevel(2); }
      setAnimKey((k) => k + 1);
      setFlyingNode(null);
      setExiting(false);
    }, 310);
  };

  const handleCenterClick = () => {
    if (level === 0) { setShowClientSwitcher(true); return; }
    setExiting(true);
    setTimeout(() => {
      if (level === 1) { setLevel(0); setSelectedService(null); }
      else if (level === 2) { setLevel(1); setSelectedAction(null); }
      setAnimKey((k) => k + 1);
      setExiting(false);
    }, 240);
  };

  // Returns the current drill-down context label shown inside the scope at level 1+
  const getCenterContextLabel = () => {
    if (level === 1) return SERVICE_LINES.find((s) => s.id === selectedService)?.label || '';
    if (level === 2) return (ACTIONS[selectedService!] || []).find((a) => a.id === selectedAction)?.label || '';
    return '';
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div
      className="relative w-full h-screen overflow-hidden flex flex-col"
      style={{ background: '#eaeaef' }}
    >
      {/* ── Top bar ── */}
      <div className="flex flex-col px-8 pt-5 pb-2 z-20 shrink-0">
        <div className="flex justify-center mb-3">
          <div className="flex items-baseline gap-1 select-none">
            <span style={{ fontSize: 22, fontWeight: 700, color: '#1F2937', letterSpacing: '-0.01em' }}>Sinaxe</span>
            <span style={{ fontSize: 11, color: '#9CA3AF', verticalAlign: 'super' }}>™</span>
            <span style={{ fontSize: 22, fontWeight: 400, color: '#6B7280', marginLeft: 2, letterSpacing: '-0.01em' }}>InScope</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span style={{ fontSize: 32, fontWeight: 700, color: '#1F2937', lineHeight: 1.1, letterSpacing: '-0.02em' }}>{greeting}, Sophia</span>
            <span style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>What is in scope today?</span>
          </div>

          <button
            onClick={() => navigate('/builder')}
            className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0"
            style={{
              background: 'transparent',
              border: '1px solid #E5E7EB',
              borderRadius: 10,
              padding: '8px 14px',
              color: '#6B7280',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="4" r="2.2" />
              <circle cx="4.5" cy="18" r="2.2" />
              <circle cx="19.5" cy="18" r="2.2" />
              <line x1="12" y1="6.2" x2="5.5" y2="15.8" />
              <line x1="12" y1="6.2" x2="18.5" y2="15.8" />
              <line x1="6.7" y1="18" x2="17.3" y2="18" />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 500 }}>Workflow Builder</span>
          </button>
        </div>
      </div>

      {/* ── Breadcrumb nav — shown when drilling into level 1 or 2 ── */}
      {level > 0 && (
        <div className="flex items-center gap-1.5 px-8 pb-1 z-20 shrink-0" style={{ fontSize: 12 }}>
          <button
            onClick={() => { setLevel(0); setSelectedService(null); setSelectedAction(null); setAnimKey(k => k + 1); }}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            InScope
          </button>
          {level >= 1 && selectedService && (
            <>
              <span style={{ color: '#D1D5DB' }}>›</span>
              <button
                onClick={() => { if (level === 2) { setLevel(1); setSelectedAction(null); setAnimKey(k => k + 1); } }}
                className={level === 2 ? 'text-gray-400 hover:text-gray-700 transition-colors' : 'text-gray-700 font-600 cursor-default'}
              >
                {SERVICE_LINES.find(s => s.id === selectedService)?.label}
              </button>
            </>
          )}
          {level === 2 && selectedAction && (
            <>
              <span style={{ color: '#D1D5DB' }}>›</span>
              <span className="text-gray-700 font-600">
                {(ACTIONS[selectedService!] || []).find(a => a.id === selectedAction)?.label}
              </span>
            </>
          )}
        </div>
      )}

      {/* ── Orbital stage ── */}
      <div ref={stageRef} className="flex-1 relative flex items-center justify-center">

        <DottedOrbitRing radius={RADIUS} />

        <div className="relative flex flex-col items-center" style={{ zIndex: 10 }}>
          <InScopeLogo
            clientName={selectedClient}
            level={level}
            levelLabel={getCenterContextLabel()}
            onClick={handleCenterClick}
          />
          {/* Client name outside the ring — visible at level 1+ */}
          {level > 0 && (
            <div
              style={{
                marginTop: 6,
                animation: 'fadeIn 220ms ease-out both',
                pointerEvents: 'none',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#374151',
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                }}
              >
                {selectedClient}
              </span>
            </div>
          )}
        </div>

        {/* Orbital nodes */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: exiting ? 'none' : 'auto',
          }}
        >
          {currentNodes.map((node, i) => {
            const angle = (i / nodeCount) * Math.PI * 2 - Math.PI / 2;
            const nx = Math.cos(angle) * RADIUS;
            const ny = Math.sin(angle) * RADIUS;
            return (
              <OrbitalNode
                key={`${animKey}-${node.id}`}
                label={node.label}
                subtitle={node.subtitle}
                angle={angle}
                radius={RADIUS}
                onClick={() => handleNodeClick(node.id, nx, ny, node.label)}
                highlighted={hoveredNode === node.label}
                onHover={setHoveredNode}
                staggerIndex={i}
                exiting={exiting}
              />
            );
          })}

          {overflowItems.length > 0 && (() => {
            const angle = (currentNodes.length / nodeCount) * Math.PI * 2 - Math.PI / 2;
            return (
              <OrbitalNode
                key={`${animKey}-overflow`}
                label="More"
                subtitle="Additional tools"
                angle={angle}
                radius={RADIUS}
                onClick={() => {}}
                highlighted={hoveredNode === 'More'}
                onHover={setHoveredNode}
                hasOverflow
                overflowItems={overflowItems}
                staggerIndex={currentNodes.length}
                exiting={exiting}
              />
            );
          })()}
        </div>

        {/* Flying node ghost — skeuomorphic purple orb */}
        {flyingNode && (
          <div
            style={{
              position: 'absolute',
              left: `calc(50% + ${flyingNode.x}px)`,
              top: `calc(50% + ${flyingNode.y}px)`,
              transform: 'translate(-50%, -50%)',
              '--fly-dx': `${-flyingNode.x}px`,
              '--fly-dy': `${-flyingNode.y}px`,
              animation: 'flyToCenter 340ms cubic-bezier(0.4,0,0.2,1) both',
              pointerEvents: 'none',
              zIndex: 50,
            } as React.CSSProperties}
          >
            <div
              style={{
                width: 94,
                height: 94,
                borderRadius: '50%',
                background: '#eaeaef',
                boxShadow: [
                  '10px 10px 22px rgba(158,158,178,0.44)',
                  '-10px -10px 22px rgba(255,255,255,0.88)',
                  '0 0 0 2.5px rgba(168,85,247,0.32)',
                ].join(', '),
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <Lock size={15} style={{ color: '#9333ea' }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: '#6b21a8', textAlign: 'center', maxWidth: 78, padding: '0 8px' }}>
                {flyingNode.label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── AI chat bar ── */}
      <div className="shrink-0 flex justify-center px-6 pb-6 pt-1">
        <div className="w-full max-w-md">
          <AIChatBar clientName={selectedClient} />
        </div>
      </div>

      {/* ── Client switcher overlay ── */}
      {showClientSwitcher && (
        <ClientSwitcher
          currentClient={selectedClient}
          onSelect={(c) => { setSelectedClient(c); setShowClientSwitcher(false); }}
          onClose={() => setShowClientSwitcher(false)}
        />
      )}
    </div>
  );
}
