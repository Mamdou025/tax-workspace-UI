// OrbitalStage.tsx — Sinaxe InScope v2.0
// Design philosophy:
// - Full greyscale UI — no colour anywhere except the animated InScope logo
// - Animated logo: small, orange inner ring + purple outer ring of tapering dots
//   directly surrounding the client name (no separate white circle)
// - Circular nodes: lock icon + label + subtitle inside the circle
// - Dotted orbit ring (small spaced dots, greyscale)
// - Top bar: greeting left, wordmark center, triangle Workflow Builder right
// - No Sophia button
// - Client dropdown: plain greyscale, no colours

import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Lock, Search, X, ChevronDown } from 'lucide-react';
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

const SERVICE_LINES = [
  { id: 'ict', label: 'ICT',               subtitle: 'International Corporate Tax' },
  { id: 'ma',  label: 'M&A',               subtitle: 'Mergers & Acquisitions' },
  { id: 'ind', label: 'Indirect Tax',       subtitle: 'GST/HST & Customs' },
  { id: 'pe',  label: 'Private Enterprise', subtitle: 'Owner-managed business' },
  { id: 'tp',  label: 'Transfer Pricing',   subtitle: 'OECD-aligned pricing' },
  { id: 'ti',  label: 'Tax Incentives',     subtitle: 'SR&ED, Credits' },
  { id: 'us',  label: 'US Tax',             subtitle: 'Cross-border US matters' },
];

const ACTIONS: Record<string, { id: string; label: string; subtitle: string }[]> = {
  ict: [
    { id: 'request',   label: 'Request',   subtitle: 'IRL, Engagement' },
    { id: 'calculate', label: 'Calculate', subtitle: 'FAPI, T1134, EIFEL' },
    { id: 'comply',    label: 'Comply',    subtitle: 'T1134, T106, Pillar 2' },
    { id: 'advise',    label: 'Advise',    subtitle: 'Memos & decks' },
  ],
  ma:  [
    { id: 'diligence', label: 'Diligence', subtitle: 'Tax due diligence' },
    { id: 'structure', label: 'Structure', subtitle: 'Deal structuring' },
    { id: 'model',     label: 'Model',     subtitle: 'Tax modelling' },
    { id: 'memo',      label: 'Memo',      subtitle: 'Advisory memos' },
  ],
  ind: [
    { id: 'gst',      label: 'GST/HST',  subtitle: 'Compliance & planning' },
    { id: 'customs',  label: 'Customs',  subtitle: 'Import/export duties' },
    { id: 'excise',   label: 'Excise',   subtitle: 'Excise tax matters' },
    { id: 'recovery', label: 'Recovery', subtitle: 'Input tax credits' },
  ],
  pe:  [
    { id: 'compliance', label: 'Compliance', subtitle: 'Corporate returns' },
    { id: 'planning',   label: 'Planning',   subtitle: 'Owner remuneration' },
    { id: 'estate',     label: 'Estate',     subtitle: 'Succession planning' },
    { id: 'reorg',      label: 'Reorg',      subtitle: 'Corporate restructuring' },
  ],
  tp:  [
    { id: 'benchmark', label: 'Benchmark', subtitle: 'Comparables analysis' },
    { id: 'document',  label: 'Document',  subtitle: 'TP documentation' },
    { id: 'defend',    label: 'Defend',    subtitle: 'Audit defence' },
    { id: 'plan',      label: 'Plan',      subtitle: 'TP planning' },
  ],
  ti:  [
    { id: 'sred',    label: 'SR&ED',   subtitle: 'R&D tax credits' },
    { id: 'credits', label: 'Credits', subtitle: 'Investment tax credits' },
    { id: 'grants',  label: 'Grants',  subtitle: 'Government incentives' },
    { id: 'review',  label: 'Review',  subtitle: 'Eligibility review' },
  ],
  us:  [
    { id: 'compliance',  label: 'Compliance',  subtitle: 'US tax returns' },
    { id: 'planning',    label: 'Planning',    subtitle: 'Cross-border planning' },
    { id: 'treaty',      label: 'Treaty',      subtitle: 'Treaty positions' },
    { id: 'withholding', label: 'Withholding', subtitle: 'WHT compliance' },
  ],
};

const SUB_ACTIONS: Record<string, { id: string; label: string; subtitle: string; route?: string; overflow?: boolean }[]> = {
  request: [
    { id: 'irl',        label: 'IRL',         subtitle: 'Info request letter' },
    { id: 'engagement', label: 'Eng. Letter',  subtitle: 'Engagement letter' },
    { id: 'mfe',        label: 'MFE',          subtitle: 'Multi-firm engagement' },
    { id: 'billing',    label: 'Billing',      subtitle: 'Fee arrangements' },
    { id: 'meeting',    label: 'Meeting',      subtitle: 'Client meetings' },
  ],
  calculate: [
    { id: 'fapi',        label: 'FAPI',        subtitle: 'FAPI calculator',     route: '/fapi' },
    { id: 't1134',       label: 'T1134',        subtitle: 'Foreign affiliate' },
    { id: 'eifel',       label: 'EIFEL',        subtitle: 'Interest limitation' },
    { id: 'safe-income', label: 'Safe Income',  subtitle: 'Safe income calc',    overflow: true },
    { id: 'surplus',     label: 'Surplus',      subtitle: 'Surplus accounts',    overflow: true },
    { id: 'ep-analysis', label: 'EP Analysis',  subtitle: 'E&P analysis',        overflow: true },
  ],
  comply: [
    { id: 't1134-comply', label: 'T1134',    subtitle: 'Annual filing' },
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
};

// ─── Animated InScope logo ────────────────────────────────────────────────────
// Small SVG: orange inner ring + purple outer ring of tapering dots
// Client name sits at the center, directly surrounded by the orange ring
// CSS-animated rings — uniform small dots, smooth rotation
function InScopeLogo({ clientName, level, levelLabel, onClick }: {
  clientName: string;
  level: number;
  levelLabel: string;
  onClick: () => void;
}) {
  const SIZE = 130;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const OUTER_R = 58;
  const INNER_R = 38;
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
        className="relative z-10 select-none transition-transform duration-200 hover:scale-105 active:scale-95"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, width: SIZE, height: SIZE }}
      >
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ position: 'absolute', inset: 0 }}>
          {/* Purple outer ring — clockwise, comet tail baked into dot positions */}
          <g className="logo-cw">
            {Array.from({ length: outerDots }, (_, i) => {
              const a = (i / outerDots) * Math.PI * 2;
              // i=0 is the head dot; trailing dots fade and shrink
              const t = i / (outerDots - 1); // 0 = head, 1 = tail
              // Cubic ease-in: slow fade near head, accelerates toward tail
              const ease = t * t * t;
              const opacity = 1 - ease;
              const r = Math.max(0.2, 2.2 * (1 - ease));
              return (
                <circle key={i} cx={CX + OUTER_R * Math.cos(a)} cy={CY + OUTER_R * Math.sin(a)} r={r} fill={PURPLE} opacity={opacity} />
              );
            })}
          </g>
          {/* Orange inner ring — counter-clockwise, comet tail baked into dot positions */}
          <g className="logo-ccw">
            {Array.from({ length: innerDots }, (_, i) => {
              const a = (i / innerDots) * Math.PI * 2;
              const t = i / (innerDots - 1);
              const ease = t * t * t;
              const opacity = 1 - ease;
              const r = Math.max(0.2, 2.0 * (1 - ease));
              return (
                <circle key={i} cx={CX + INNER_R * Math.cos(a)} cy={CY + INNER_R * Math.sin(a)} r={r} fill={ORANGE} opacity={opacity} />
              );
            })}
          </g>
        </svg>

        {/* Client name / level label — centered over the SVG */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          {level === 0 ? (
            <>
              <span className="text-[10px] font-700 text-gray-800 leading-tight text-center px-3">{clientName}</span>
              <span className="text-[7.5px] text-gray-400 mt-0.5">tap to switch</span>
            </>
          ) : (
            <>
              <span className="text-[9px] font-600 text-gray-700 leading-tight text-center px-3">{levelLabel}</span>
              <span className="text-[7.5px] text-gray-400 mt-0.5">← back</span>
            </>
          )}
        </div>
      </button>
    </>
  );
}

// ─── Client switcher overlay — plain greyscale ────────────────────────────────
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
        {/* Search */}
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
        {/* List — greyscale only */}
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
              {/* Plain greyscale initial badge */}
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

// ─── Circular orbital node ────────────────────────────────────────────────────
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
}) {
  const [showOverflow, setShowOverflow] = useState(false);
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  return (
    <div
      className="absolute"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Entrance animation on inner wrapper — keeps position stable */}
      <div
        className="relative flex flex-col items-center"
        style={{
          animation: 'nodeEnter 420ms cubic-bezier(0.34,1.56,0.64,1) both',
          animationDelay: `${staggerIndex * 45}ms`,
        }}
      >
        <button
          onClick={() => { if (hasOverflow) setShowOverflow((v) => !v); else onClick(); }}
          onMouseEnter={() => onHover(label)}
          onMouseLeave={() => onHover(null)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <div
            className="flex flex-col items-center justify-center"
            style={{
              width: 110,
              height: 110,
              borderRadius: '50%',
              background: highlighted ? 'rgba(124,58,237,0.08)' : '#FFFFFF',
              boxShadow: highlighted
                ? '0 6px 24px rgba(124,58,237,0.18), 0 2px 8px rgba(124,58,237,0.10), 0 0 0 1.5px rgba(124,58,237,0.20)'
                : '0 3px 12px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)',
              transform: highlighted ? 'scale(1.08)' : 'scale(1)',
              transition: 'background 200ms ease-out, box-shadow 200ms ease-out, transform 200ms cubic-bezier(0.23,1,0.32,1)',
              gap: 4,
            }}
          >
            <Lock size={18} style={{ color: highlighted ? '#7C3AED' : '#9CA3AF', transition: 'color 200ms ease-out', flexShrink: 0 }} />
            <span className="text-[11px] font-700 leading-tight text-center px-2" style={{ color: highlighted ? '#5B21B6' : '#374151', transition: 'color 200ms ease-out', maxWidth: 96 }}>
              {label}
            </span>
            <span className="text-[9px] leading-tight text-center px-2" style={{ color: highlighted ? '#8B5CF6' : '#9CA3AF', transition: 'color 200ms ease-out', maxWidth: 96 }}>
              {subtitle}
            </span>
            {hasOverflow && <ChevronDown size={10} style={{ color: highlighted ? '#7C3AED' : '#9CA3AF' }} />}
          </div>
        </button>

        {hasOverflow && showOverflow && overflowItems && (
          <div
            className="absolute top-full mt-2 z-50 bg-white rounded-xl overflow-hidden min-w-[140px]"
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
            fill={large ? '#ADADB5' : '#C8C8CE'}
            opacity={large ? 0.7 : 0.4}
          />
        );
      })}
    </svg>
  );
}


// ─── AI Chat Bar ──────────────────────────────────────────────────────────────
function AIChatBar({ clientName }: { clientName: string }) {
  const [active, setActive] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePillClick = () => {
    if (!active) {
      setActive(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleBlur = () => {
    if (!value) setActive(false);
  };

  const handleSend = () => {
    if (value.trim()) setValue("");
    setActive(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
    if (e.key === "Escape") { setValue(""); setActive(false); }
  };

  return (
    <div
      onClick={handlePillClick}
      className="flex items-center gap-2.5 w-full rounded-full px-3.5 py-2.5 cursor-text transition-shadow"
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: active ? "0 2px 12px rgba(0,0,0,0.10)" : "0 1px 6px rgba(0,0,0,0.06)",
      }}
    >
      {/* Static InScope logo — single orange dotted ring, well-spaced dots */}
      <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0">
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <circle key={i} cx={9 + 6.5 * Math.cos(a)} cy={9 + 6.5 * Math.sin(a)} r={1.1} fill={ORANGE} opacity={0.9} />;
        })}
      </svg>

      {/* Instruction text OR input */}
      {active ? (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={"Ask anything about " + clientName + "…"}
          className="flex-1 text-[12px] text-gray-700 outline-none bg-transparent placeholder:text-gray-300"
        />
      ) : (
        <span className="flex-1 text-[12px] text-gray-400 truncate select-none">
          Click on an action item or ask me anything about {clientName}
        </span>
      )}

      {/* Send button — solid black circle with white upward arrow (Manus style) */}
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
  const [transitioning, setTransitioning] = useState(false);
  const [flyingNode, setFlyingNode] = useState<{ id: string; x: number; y: number; label: string } | null>(null);
  const [selectedClient, setSelectedClient] = useState('Northstar Inc.');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [showClientSwitcher, setShowClientSwitcher] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  // Dynamic radius: scales with the smaller of viewport width/height
  // Laptop (~1280–1440px wide): ~210px  |  Wide screen (1920px+): ~300px
  const [stageSize, setStageSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onResize = () => setStageSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  type SimpleNode = { id: string; label: string; subtitle: string; route?: string; overflow?: boolean };

  const currentNodes: SimpleNode[] = (() => {
    if (level === 0) return SERVICE_LINES.map((s) => ({ id: s.id, label: s.label, subtitle: s.subtitle }));
    if (level === 1 && selectedService) return ACTIONS[selectedService] || [];
    if (level === 2 && selectedAction) return (SUB_ACTIONS[selectedAction] || []).filter((s) => !s.overflow);
    return [];
  })();

  const overflowItems = (() => {
    if (level === 2 && selectedAction) return (SUB_ACTIONS[selectedAction] || []).filter((s) => s.overflow);
    return [];
  })();

  const nodeCount = currentNodes.length + (overflowItems.length > 0 ? 1 : 0);
  // Orbit radius: 28% of the shorter viewport dimension, clamped between 190px (small laptop) and 340px (ultra-wide)
  const RADIUS = Math.min(340, Math.max(190, Math.min(stageSize.w, stageSize.h) * 0.28));

  const handleNodeClick = (nodeId: string, nodeX: number, nodeY: number, nodeLabel: string) => {
    if (level === 2) {
      const sub = (SUB_ACTIONS[selectedAction!] || []).find((s) => s.id === nodeId);
      if (sub?.route) navigate(sub.route);
      return;
    }
    // Phase 1: fly clicked node to center
    setTransitioning(true);
    setFlyingNode({ id: nodeId, x: nodeX, y: nodeY, label: nodeLabel });
    setTimeout(() => {
      // Phase 2: commit level change, burst new nodes out
      if (level === 0) { setSelectedService(nodeId); setLevel(1); }
      else if (level === 1) { setSelectedAction(nodeId); setLevel(2); }
      setAnimKey((k) => k + 1);
      setFlyingNode(null);
      setTransitioning(false);
    }, 320);
  };

  const handleCenterClick = () => {
    if (level === 0) { setShowClientSwitcher(true); return; }
    setTransitioning(true);
    setTimeout(() => {
      if (level === 1) { setLevel(0); setSelectedService(null); }
      else if (level === 2) { setLevel(1); setSelectedAction(null); }
      setAnimKey((k) => k + 1);
      setTransitioning(false);
    }, 200);
  };

  const getCenterLevelLabel = () => {
    if (level === 1) return SERVICE_LINES.find((s) => s.id === selectedService)?.label || '';
    if (level === 2) return (ACTIONS[selectedService!] || []).find((a) => a.id === selectedAction)?.label || '';
    return '';
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div
      className="relative w-full h-screen overflow-hidden flex flex-col"
      style={{ background: '#F4F4F6' }}
    >
      {/* ── Top section: row 1 = wordmark centered | row 2 = greeting left + workflow builder right ── */}
      <div className="flex flex-col px-8 pt-5 pb-2 z-20 shrink-0">
        {/* Row 1 — wordmark centered */}
        <div className="flex justify-center mb-3">
          <div className="flex items-baseline gap-1 select-none">
            <span style={{ fontSize: 22, fontWeight: 700, color: '#1F2937', letterSpacing: '-0.01em' }}>Sinaxe</span>
            <span style={{ fontSize: 11, color: '#9CA3AF', verticalAlign: 'super' }}>™</span>
            <span style={{ fontSize: 22, fontWeight: 400, color: '#6B7280', marginLeft: 2, letterSpacing: '-0.01em' }}>InScope</span>
          </div>
        </div>

        {/* Row 2 — greeting left, workflow builder right */}
        <div className="flex items-center justify-between">
          {/* Greeting */}
          <div className="flex flex-col">
            <span style={{ fontSize: 32, fontWeight: 700, color: '#1F2937', lineHeight: 1.1, letterSpacing: '-0.02em' }}>{greeting}, Sophia</span>
            <span style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>What is in scope today?</span>
          </div>

          {/* Workflow Builder — icon + label with light grey border */}
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

        {/* Dotted orbit ring */}
        <DottedOrbitRing radius={RADIUS} />

        {/* Animated InScope logo with client name at center */}
        <InScopeLogo
          clientName={selectedClient}
          level={level}
          levelLabel={getCenterLevelLabel()}
          onClick={handleCenterClick}
        />

        {/* Orbital nodes — staggered entrance on level change, fade out during transition */}
        <div
          style={{
            opacity: transitioning ? 0 : 1,
            transition: 'opacity 200ms ease-out',
            position: 'absolute', inset: 0, pointerEvents: transitioning ? 'none' : 'auto',
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
              />
            );
          })}

          {/* Overflow node */}
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
              />
            );
          })()}
        </div>

        {/* Flying node ghost — animates from orbit position toward center, then fades */}
        {flyingNode && (
          <div
            style={{
              position: 'absolute',
              left: `calc(50% + ${flyingNode.x}px)`,
              top: `calc(50% + ${flyingNode.y}px)`,
              transform: 'translate(-50%, -50%)',
              // fly-dx/dy = offset needed to reach center from current position
              '--fly-dx': `${-flyingNode.x}px`,
              '--fly-dy': `${-flyingNode.y}px`,
              animation: 'flyToCenter 300ms cubic-bezier(0.4,0,0.2,1) both',
              pointerEvents: 'none',
              zIndex: 50,
            } as React.CSSProperties}
          >
            <div
              style={{
                width: 88, height: 88, borderRadius: '50%',
                background: 'rgba(124,58,237,0.12)',
                boxShadow: '0 0 0 2px rgba(124,58,237,0.3)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
              }}
            >
              <Lock size={15} style={{ color: '#7C3AED' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#5B21B6', textAlign: 'center', maxWidth: 76, padding: '0 8px' }}>
                {flyingNode.label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── AI chat bar — centered, shorter, sits just below orbital ── */}
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
