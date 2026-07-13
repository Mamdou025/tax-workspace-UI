/**
 * ScopeMapOverlay — workstream-centred orbital scope map
 * Preserves: neumorphic node style, dotted ring, purple/orange brand dots
 * Centre: selected workstream (not client)
 * Nodes: contextual to the workstream
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { X, Lock, ChevronDown } from 'lucide-react';
import { useAgentChat } from '@/contexts/AgentChatContext';

const PURPLE = '#6B21A8';
const ORANGE = '#C2410C';
const NEU_BG = '#F4F5F8';
const NEU_SHADOW_DARK = 'rgba(158,158,178,0.40)';
const NEU_SHADOW_LIGHT = 'rgba(255,255,255,0.84)';

// ─── Workstream definitions ───────────────────────────────────────────────────

export interface WorkstreamNode {
  id: string;
  label: string;
  subtitle: string;
  route?: string;
  action?: string;
}

export interface Workstream {
  id: string;
  label: string;
  clients: number;
  affiliates: number;
  period: string;
  status: string;
  nodes: WorkstreamNode[];
}

export const WORKSTREAMS: Workstream[] = [
  {
    id: 'fapi',
    label: 'FAPI Readiness',
    clients: 3,
    affiliates: 12,
    period: 'FY 2025',
    status: '4 items need input',
    nodes: [
      { id: 'open-fapi',    label: 'Open FAPI Workpaper',   subtitle: 'Full workpaper',        route: '/fapi' },
      { id: 'exceptions',   label: 'Review Exceptions',     subtitle: '4 flagged items',       action: 'fapi-exceptions' },
      { id: 'request-data', label: 'Request Missing Data',  subtitle: 'IRL workflow',          action: 'fapi-irl' },
      { id: 'coverage',     label: 'Source Coverage',       subtitle: 'Mapping status',        action: 'fapi-coverage' },
      { id: 'prior-year',   label: 'Compare Prior Year',    subtitle: 'FY2024 vs FY2025',      action: 'fapi-compare' },
      { id: 'export',       label: 'Export Status Report',  subtitle: 'PDF / Excel',           action: 'fapi-export' },
    ],
  },
  {
    id: 't1134',
    label: 'T1134 Compliance',
    clients: 2,
    affiliates: 8,
    period: 'FY 2025',
    status: '2 forms in progress',
    nodes: [
      { id: 'open-t1134',   label: 'Open T1134 Workpaper', subtitle: 'Full workpaper',         route: '/t1134' },
      { id: 'review-forms', label: 'Review Forms',          subtitle: '2 in progress',          action: 't1134-review' },
      { id: 'entity-info',  label: 'Entity Information',   subtitle: 'FA details',             action: 't1134-entities' },
      { id: 'request-info', label: 'Request Missing Info', subtitle: 'IRL workflow',           action: 't1134-irl' },
      { id: 'source-docs',  label: 'Source Documents',     subtitle: 'Uploaded files',         action: 't1134-sources' },
      { id: 'export-pkg',   label: 'Export Package',       subtitle: 'CRA-ready package',      action: 't1134-export' },
    ],
  },
  {
    id: 'surplus',
    label: 'Surplus Accounts',
    clients: 2,
    affiliates: 6,
    period: 'FY 2025',
    status: 'On track',
    nodes: [
      { id: 'open-surplus', label: 'Open Surplus Workpaper', subtitle: 'Full workpaper',       route: '/surplus' },
      { id: 'exempt',       label: 'Exempt Surplus',         subtitle: 'Account balances',     action: 'surplus-exempt' },
      { id: 'taxable',      label: 'Taxable Surplus',        subtitle: 'Account balances',     action: 'surplus-taxable' },
      { id: 'dividends',    label: 'Dividend Tracking',      subtitle: 'Paid & received',      action: 'surplus-dividends' },
      { id: 'prior-year-s', label: 'Compare Prior Year',     subtitle: 'FY2024 vs FY2025',     action: 'surplus-compare' },
      { id: 'export-s',     label: 'Export Report',          subtitle: 'PDF / Excel',          action: 'surplus-export' },
    ],
  },
  {
    id: 'provision',
    label: 'Q2 Tax Provision Review',
    clients: 5,
    affiliates: 0,
    period: 'Q2 2025',
    status: 'Running',
    nodes: [
      { id: 'current-tax',  label: 'Current Tax',           subtitle: 'Provision calc',       action: 'prov-current' },
      { id: 'deferred',     label: 'Deferred Tax',          subtitle: 'Temp differences',     action: 'prov-deferred' },
      { id: 'rate-rec',     label: 'Rate Reconciliation',   subtitle: 'ETR analysis',         action: 'prov-rate' },
      { id: 'review-prov',  label: 'Review Entries',        subtitle: 'Journal entries',      action: 'prov-review' },
      { id: 'exceptions-p', label: 'Exceptions',            subtitle: '1 flagged',            action: 'prov-exceptions' },
      { id: 'export-prov',  label: 'Export Package',        subtitle: 'Board-ready',          action: 'prov-export' },
    ],
  },
];

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
      style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1 }}
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

// ─── Orbital node ─────────────────────────────────────────────────────────────

function OrbitalNode({
  label, subtitle, angle, radius, highlighted, onHover, onClick, staggerIndex = 0,
}: {
  label: string; subtitle: string; angle: number; radius: number;
  highlighted: boolean; onHover: (v: string | null) => void; onClick: () => void;
  staggerIndex?: number;
}) {
  const [isPressed, setIsPressed] = useState(false);
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  const transition = ['background 180ms ease-out', 'box-shadow 180ms ease-out', 'transform 180ms var(--is-ease-spring)'].join(', ');

  const orbStyle: React.CSSProperties = isPressed
    ? { width: 110, height: 110, borderRadius: '50%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: '#e2e2e9', boxShadow: [`inset 5px 5px 12px ${NEU_SHADOW_DARK}`, `inset -5px -5px 12px ${NEU_SHADOW_LIGHT}`].join(', '), border: 'none', transform: 'scale(0.96)', transition }
    : highlighted
    ? { width: 110, height: 110, borderRadius: '50%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: NEU_BG, boxShadow: [`11px 11px 24px ${NEU_SHADOW_DARK}`, `-11px -11px 24px ${NEU_SHADOW_LIGHT}`, '0 0 0 2px rgba(124,110,174,0.28)'].join(', '), border: 'none', transform: 'scale(1.05)', transition }
    : { width: 110, height: 110, borderRadius: '50%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: NEU_BG, boxShadow: [`8px 8px 18px ${NEU_SHADOW_DARK}`, `-8px -8px 18px ${NEU_SHADOW_LIGHT}`].join(', '), border: 'none', transform: 'scale(1)', transition };

  return (
    <div
      className="absolute"
      style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: 'translate(-50%, -50%)', zIndex: 2 }}
    >
      <div style={{ animationName: 'scopeNodeEnter', animationDuration: '460ms', animationTimingFunction: 'var(--is-ease-spring)', animationFillMode: 'both', animationDelay: `${staggerIndex * 48}ms` }}>
        <button
          onClick={onClick}
          onMouseEnter={() => onHover(label)}
          onMouseLeave={() => { setIsPressed(false); onHover(null); }}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'block', transform: 'none' }}
        >
          <div style={orbStyle}>
            <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', width: 6, height: 6, borderRadius: '50%', background: highlighted ? 'linear-gradient(135deg, #c4b5fd 0%, #7c6eae 100%)' : 'linear-gradient(135deg, #d1d1da 0%, #c4c4cf 100%)', boxShadow: highlighted ? '0 0 5px rgba(124,110,174,0.55)' : 'inset 1px 1px 2px rgba(255,255,255,0.7)', animation: 'ledPulse 3s ease-in-out infinite', transition: 'background 300ms ease-out' }} />
            <Lock size={17} style={{ color: highlighted ? '#7c6eae' : '#a0a0b8', transition: 'color 200ms ease-out', marginTop: 8, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.2, textAlign: 'center', padding: '0 8px', color: highlighted ? '#5b4d8a' : '#5c5c7a', transition: 'color 200ms ease-out', maxWidth: 94 }}>{label}</span>
            <span style={{ fontSize: 9, lineHeight: 1.2, textAlign: 'center', padding: '0 8px', color: highlighted ? '#7c6eae' : '#9898b2', transition: 'color 200ms ease-out', maxWidth: 94 }}>{subtitle}</span>
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── Centre workstream orb ────────────────────────────────────────────────────

function CentreOrb({ ws }: { ws: Workstream }) {
  const SIZE = 160;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  return (
    <div style={{ width: SIZE, height: SIZE, borderRadius: '50%', background: NEU_BG, boxShadow: [`10px 10px 22px ${NEU_SHADOW_DARK}`, `-10px -10px 22px ${NEU_SHADOW_LIGHT}`].join(', '), position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <style>{`
          @keyframes scope-cw  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes scope-ccw { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
          .scope-cw  { animation: scope-cw  12s linear infinite; transform-origin: ${CX}px ${CY}px; }
          .scope-ccw { animation: scope-ccw 8s linear infinite;  transform-origin: ${CX}px ${CY}px; }
          @media (prefers-reduced-motion: reduce) { .scope-cw, .scope-ccw { animation: none; } }
        `}</style>
        <g className="scope-cw">
          {Array.from({ length: 30 }, (_, i) => {
            const a = (i / 30) * Math.PI * 2;
            const dur = 22; const begin = -(i / 30) * dur;
            const kt = "0;0.02;0.07;0.93;0.98;1";
            const ks = "0 0 1 1;0.42 0 1 1;0 0 1 1;0 0 0.58 1;0 0 1 1";
            return (
              <circle key={i} cx={CX + 66 * Math.cos(a)} cy={CY + 66 * Math.sin(a)} r={0} fill={PURPLE}>
                <animate attributeName="r" values="0;0;0.1;1.6;0;0" keyTimes={kt} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" calcMode="spline" keySplines={ks} />
                <animate attributeName="opacity" values="0;0;0.8;0.8;0;0" keyTimes={kt} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" calcMode="spline" keySplines={ks} />
              </circle>
            );
          })}
        </g>
        <g className="scope-ccw">
          {Array.from({ length: 20 }, (_, i) => {
            const a = (i / 20) * Math.PI * 2;
            const dur = 15; const begin = -((20 - i) / 20) * dur;
            const kt = "0;0.02;0.07;0.93;0.98;1";
            const ks = "0 0 1 1;0.42 0 1 1;0 0 1 1;0 0 0.58 1;0 0 1 1";
            return (
              <circle key={i} cx={CX + 50 * Math.cos(a)} cy={CY + 50 * Math.sin(a)} r={0} fill={ORANGE}>
                <animate attributeName="r" values="0;0;0.1;1.4;0;0" keyTimes={kt} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" calcMode="spline" keySplines={ks} />
                <animate attributeName="opacity" values="0;0;0.8;0.8;0;0" keyTimes={kt} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" calcMode="spline" keySplines={ks} />
              </circle>
            );
          })}
        </g>
      </svg>
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 16px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--is-text-primary)', lineHeight: 1.3, marginBottom: 4 }}>{ws.label}</div>
        <div style={{ fontSize: 9, color: 'var(--is-text-secondary)', lineHeight: 1.5 }}>
          {ws.clients > 0 && <div>{ws.clients} client{ws.clients !== 1 ? 's' : ''}</div>}
          {ws.affiliates > 0 && <div>{ws.affiliates} affiliates</div>}
          <div>{ws.period}</div>
        </div>
      </div>
    </div>
  );
}

// ─── ScopeMapOverlay ──────────────────────────────────────────────────────────

export default function ScopeMapOverlay({ onClose }: { onClose: () => void }) {
  const [, navigate] = useLocation();
  const { openChat } = useAgentChat();
  const [activeWsId, setActiveWsId] = useState('fapi');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [showWsSelector, setShowWsSelector] = useState(false);
  const [stageSize, setStageSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const onResize = () => setStageSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const ws = WORKSTREAMS.find((w) => w.id === activeWsId) ?? WORKSTREAMS[0];
  const RADIUS = Math.min(280, Math.max(180, Math.min(stageSize.w * 0.38, stageSize.h * 0.38)));
  const nodeCount = ws.nodes.length;

  const handleNodeClick = (node: WorkstreamNode) => {
    if (node.route) {
      onClose();
      navigate(node.route);
    } else if (node.action) {
      onClose();
      openChat(`Run ${node.label} for ${ws.label}`);
      navigate('/chat');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Scope Map"
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(32,39,53,0.45)',
        backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'scopeOverlayIn 260ms var(--is-ease-out) both',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: Math.min(stageSize.w - 80, 860),
          height: Math.min(stageSize.h - 80, 720),
          background: 'var(--is-bg)',
          borderRadius: 28,
          boxShadow: '0 32px 80px rgba(32,39,53,0.22)',
          border: '1px solid var(--is-border)',
          position: 'relative',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px 0', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--is-text-primary)', letterSpacing: '-0.01em' }}>Scope Map</div>
            <div style={{ fontSize: 11, color: 'var(--is-text-secondary)', marginTop: 2 }}>Select a workstream to explore its context and actions</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Scope Map"
            style={{ width: 34, height: 34, borderRadius: 12, background: 'var(--is-surface-2)', boxShadow: 'var(--is-shadow-in)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--is-text-secondary)' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Orbital stage */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <DottedOrbitRing radius={RADIUS} />

          <CentreOrb ws={ws} />

          <div style={{ position: 'absolute', inset: 0 }}>
            {ws.nodes.map((node, i) => {
              const angle = (i / nodeCount) * Math.PI * 2 - Math.PI / 2;
              return (
                <OrbitalNode
                  key={`${ws.id}-${node.id}`}
                  label={node.label}
                  subtitle={node.subtitle}
                  angle={angle}
                  radius={RADIUS}
                  highlighted={hoveredNode === node.label}
                  onHover={setHoveredNode}
                  onClick={() => handleNodeClick(node)}
                  staggerIndex={i}
                />
              );
            })}
          </div>
        </div>

        {/* Workstream selector */}
        <div style={{ padding: '0 22px 20px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowWsSelector((v) => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--is-surface)', borderRadius: 14,
                boxShadow: 'var(--is-shadow-sm)', border: '1px solid var(--is-border)',
                padding: '9px 14px', cursor: 'pointer', color: 'var(--is-text-primary)',
                fontSize: 12, fontWeight: 600,
              }}
            >
              <span style={{ color: 'var(--is-text-secondary)', fontWeight: 400 }}>Centred on:</span>
              <span>{ws.label}</span>
              <ChevronDown size={12} style={{ color: 'var(--is-text-secondary)' }} />
            </button>

            {showWsSelector && (
              <div
                style={{
                  position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--is-surface)', borderRadius: 16,
                  boxShadow: '0 12px 32px rgba(32,39,53,0.12)', border: '1px solid var(--is-border)',
                  minWidth: 220, overflow: 'hidden',
                  animation: 'scopeNodeEnter 180ms var(--is-ease-out) both',
                }}
              >
                {WORKSTREAMS.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => { setActiveWsId(w.id); setShowWsSelector(false); }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '10px 14px',
                      background: w.id === activeWsId ? 'var(--is-accent-soft)' : 'transparent',
                      border: 'none', cursor: 'pointer', display: 'block',
                      borderBottom: '1px solid var(--is-border-soft)',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600, color: w.id === activeWsId ? 'var(--is-accent)' : 'var(--is-text-primary)' }}>{w.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--is-text-secondary)', marginTop: 1 }}>{w.period} · {w.status}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scopeOverlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scopeNodeEnter {
          from { opacity: 0; transform: scale(0.82) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes ledPulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
      `}</style>
    </div>
  );
}
