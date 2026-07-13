/**
 * InScopeHome — calm chat-first home page
 *
 * Layout:
 *  - Top: Sinaxe · InScope logo centred, user avatar top-right
 *  - Scope bar: floating neumorphic pill with animated Scope button
 *  - Chat composer: large centred neumorphic input
 *  - Two-column cards: Recent Activity (left) + Attention Summary (right)
 *
 * Design: soft cool-grey neumorphic, muted lilac accent, no bright colours
 */

import { useState, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import {
  Send, Clock, ChevronRight, User,
  AlertCircle, Loader2, CheckCircle2, XCircle,
  ArrowUpRight,
} from 'lucide-react';
import { useAgentChat } from '@/contexts/AgentChatContext';
import ScopeMapOverlay from '@/components/ScopeMapOverlay';

const PURPLE = '#6B21A8';
const ORANGE = '#C2410C';

// ─── Scope button (animated dotted rings) ─────────────────────────────────────

function ScopeButton({ onClick }: { onClick: () => void }) {
  const SIZE = 80;
  const CX = SIZE / 2;
  const CY = SIZE / 2;

  return (
    <button
      onClick={onClick}
      aria-label="Open Scope Map"
      title="Open Scope Map"
      style={{
        width: SIZE, height: SIZE, borderRadius: '50%',
        background: 'var(--is-surface)',
        boxShadow: 'var(--is-shadow-out)',
        border: 'none', cursor: 'pointer', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'box-shadow 180ms var(--is-ease-out)',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `var(--is-shadow-out), 0 0 0 2px var(--is-accent-ring)`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--is-shadow-out)'; }}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <style>{`
          @keyframes sb-cw  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes sb-ccw { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
          .sb-cw  { animation: sb-cw  14s linear infinite; transform-origin: ${CX}px ${CY}px; }
          .sb-ccw { animation: sb-ccw 9s  linear infinite; transform-origin: ${CX}px ${CY}px; }
          @media (prefers-reduced-motion: reduce) { .sb-cw, .sb-ccw { animation: none; } }
        `}</style>
        {/* Outer purple dots */}
        <g className="sb-cw">
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const dur = 22; const begin = -(i / 24) * dur;
            const kt = "0;0.02;0.07;0.93;0.98;1";
            const ks = "0 0 1 1;0.42 0 1 1;0 0 1 1;0 0 0.58 1;0 0 1 1";
            return (
              <circle key={i} cx={CX + 34 * Math.cos(a)} cy={CY + 34 * Math.sin(a)} r={0} fill={PURPLE}>
                <animate attributeName="r" values="0;0;0.1;1.4;0;0" keyTimes={kt} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" calcMode="spline" keySplines={ks} />
                <animate attributeName="opacity" values="0;0;0.7;0.7;0;0" keyTimes={kt} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" calcMode="spline" keySplines={ks} />
              </circle>
            );
          })}
        </g>
        {/* Inner orange dots */}
        <g className="sb-ccw">
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const dur = 15; const begin = -((16 - i) / 16) * dur;
            const kt = "0;0.02;0.07;0.93;0.98;1";
            const ks = "0 0 1 1;0.42 0 1 1;0 0 1 1;0 0 0.58 1;0 0 1 1";
            return (
              <circle key={i} cx={CX + 24 * Math.cos(a)} cy={CY + 24 * Math.sin(a)} r={0} fill={ORANGE}>
                <animate attributeName="r" values="0;0;0.1;1.2;0;0" keyTimes={kt} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" calcMode="spline" keySplines={ks} />
                <animate attributeName="opacity" values="0;0;0.7;0.7;0;0" keyTimes={kt} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" calcMode="spline" keySplines={ks} />
              </circle>
            );
          })}
        </g>
      </svg>
      <span style={{ position: 'relative', zIndex: 1, fontSize: 11, fontWeight: 700, color: 'var(--is-text-primary)', letterSpacing: '0.02em' }}>
        Scope
      </span>
    </button>
  );
}

// ─── Scope bar ────────────────────────────────────────────────────────────────

function ScopeBar({ onScopeClick }: { onScopeClick: () => void }) {
  const SCOPE_DIMS = [
    { label: '18 clients' },
    { label: '47 affiliates' },
    { label: 'FY 2025' },
    { label: 'FAPI · T1134' },
    { label: 'Exceptions only' },
  ];

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 0,
        background: 'var(--is-surface)',
        borderRadius: 'var(--is-radius-pill)',
        boxShadow: 'var(--is-shadow-out)',
        border: '1px solid var(--is-border)',
        padding: '10px 18px 10px 10px',
        maxWidth: 680, width: '100%',
      }}
    >
      <ScopeButton onClick={onScopeClick} />

      <div style={{ width: 1, height: 28, background: 'var(--is-border)', margin: '0 14px', flexShrink: 0 }} />

      {SCOPE_DIMS.map((dim, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {i > 0 && <span style={{ color: 'var(--is-border)', margin: '0 10px', fontSize: 14 }}>·</span>}
          <button
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '3px 6px', borderRadius: 8, fontSize: 12, fontWeight: 500, color: 'var(--is-text-secondary)', transition: 'color 140ms ease-out' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--is-text-primary)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--is-text-secondary)'; }}
          >
            {dim.label}
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Chat composer ────────────────────────────────────────────────────────────

function ChatComposer({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue('');
  }, [value, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--is-surface)',
        borderRadius: 'var(--is-radius-pill)',
        boxShadow: focused
          ? 'var(--is-shadow-in), 0 0 0 2px var(--is-accent-ring)'
          : 'var(--is-shadow-out)',
        border: '1px solid var(--is-border)',
        padding: '14px 14px 14px 22px',
        maxWidth: 680, width: '100%',
        cursor: 'text',
        transition: 'box-shadow 200ms var(--is-ease-out)',
      }}
    >
      {/* Mini scope icon */}
      <svg width={18} height={18} viewBox="0 0 18 18" style={{ flexShrink: 0, opacity: 0.5 }}>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <circle key={i} cx={9 + 6 * Math.cos(a)} cy={9 + 6 * Math.sin(a)} r={1.1} fill={PURPLE} />;
        })}
        <circle cx={9} cy={9} r={2.5} fill={PURPLE} opacity={0.7} />
      </svg>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder="Ask, find, open or run anything in your tax workspace…"
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          fontSize: 14, color: 'var(--is-text-primary)', fontFamily: 'inherit',
          fontWeight: 400,
        }}
      />

      <button
        onMouseDown={(e) => { e.preventDefault(); handleSend(); }}
        aria-label="Submit"
        style={{
          width: 36, height: 36, borderRadius: 14, flexShrink: 0,
          background: value.trim() ? 'var(--is-text-primary)' : 'var(--is-surface-2)',
          boxShadow: value.trim() ? '0 4px 12px rgba(32,39,53,0.18)' : 'var(--is-shadow-in)',
          border: 'none', cursor: value.trim() ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 160ms var(--is-ease-out)',
          color: value.trim() ? '#fff' : 'var(--is-text-tertiary)',
        }}
      >
        <Send size={13} />
      </button>
    </div>
  );
}

// ─── Recent activity ──────────────────────────────────────────────────────────

const RECENT_ITEMS = [
  { id: '1', title: 'FAPI Readiness',                 context: 'SAS Paris',        time: '2m ago',    route: '/fapi' },
  { id: '2', title: 'Q2 Provision Review',             context: 'Meridian Energy',  time: '18m ago',   route: '/chat' },
  { id: '3', title: 'Intercompany Reconciliation',     context: 'Atlas Financial',  time: '1h ago',    route: '/chat' },
  { id: '4', title: 'Transfer Pricing Benchmark',      context: 'Northstar Inc.',   time: '2h ago',    route: '/chat' },
  { id: '5', title: 'T1134 Compliance Review',         context: 'Cascade Tech',     time: 'Yesterday', route: '/t1134' },
];

function RecentActivityCard() {
  const [, navigate] = useLocation();

  return (
    <div
      style={{
        background: 'var(--is-surface)',
        borderRadius: 'var(--is-radius-lg)',
        boxShadow: 'var(--is-shadow-card)',
        border: '1px solid var(--is-border)',
        padding: '20px 22px',
        flex: 1, minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={14} style={{ color: 'var(--is-text-secondary)' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--is-text-primary)' }}>Recent Activity</span>
        </div>
        <button
          onClick={() => navigate('/library')}
          style={{ fontSize: 11, color: 'var(--is-text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
        >
          View all
          <ArrowUpRight size={10} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {RECENT_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.route)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 10px', borderRadius: 12, background: 'transparent',
              border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'background 140ms ease-out',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--is-surface-2)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--is-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.title}
              </div>
              <div style={{ fontSize: 11, color: 'var(--is-text-secondary)', marginTop: 1 }}>{item.context}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 12 }}>
              <span style={{ fontSize: 10, color: 'var(--is-text-tertiary)', whiteSpace: 'nowrap' }}>{item.time}</span>
              <ChevronRight size={11} style={{ color: 'var(--is-text-tertiary)' }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Attention summary ────────────────────────────────────────────────────────

const ATTENTION_ROWS = [
  { id: 'input',     icon: AlertCircle,   label: 'Need your input', count: 4,  tint: true,  route: '/dashboard' },
  { id: 'running',   icon: Loader2,       label: 'Running',         count: 7,  tint: false, route: '/dashboard' },
  { id: 'completed', icon: CheckCircle2,  label: 'Completed',       count: 12, tint: false, route: '/dashboard' },
  { id: 'blocked',   icon: XCircle,       label: 'Blocked',         count: 2,  tint: false, route: '/dashboard' },
];

function AttentionSummaryCard() {
  const [, navigate] = useLocation();

  return (
    <div
      style={{
        background: 'var(--is-surface)',
        borderRadius: 'var(--is-radius-lg)',
        boxShadow: 'var(--is-shadow-card)',
        border: '1px solid var(--is-border)',
        padding: '20px 22px',
        width: 280, flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--is-text-primary)' }}>Attention</span>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ fontSize: 11, color: 'var(--is-text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
        >
          View all
          <ArrowUpRight size={10} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {ATTENTION_ROWS.map((row) => {
          const Icon = row.icon;
          return (
            <button
              key={row.id}
              onClick={() => navigate(row.route)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 10px', borderRadius: 12,
                background: row.tint ? 'var(--is-accent-soft)' : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                transition: 'background 140ms ease-out',
              }}
              onMouseEnter={(e) => { if (!row.tint) (e.currentTarget as HTMLElement).style.background = 'var(--is-surface-2)'; }}
              onMouseLeave={(e) => { if (!row.tint) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={14} style={{ color: row.tint ? 'var(--is-accent)' : 'var(--is-text-secondary)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: row.tint ? 600 : 500, color: row.tint ? 'var(--is-accent)' : 'var(--is-text-primary)' }}>
                  {row.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: row.tint ? 'var(--is-accent)' : 'var(--is-text-primary)' }}>
                  {row.count}
                </span>
                <ChevronRight size={11} style={{ color: 'var(--is-text-tertiary)' }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── InScopeHome ──────────────────────────────────────────────────────────────

export default function InScopeHome() {
  const [, navigate] = useLocation();
  const { openChat } = useAgentChat();
  const [scopeMapOpen, setScopeMapOpen] = useState(false);

  const handleChatSubmit = (text: string) => {
    openChat(text);
    navigate('/chat');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--is-bg)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingLeft: 88, // offset for the left nav rail (60px + 16px gap + 12px breathing room)
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          width: '100%', maxWidth: 760,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          paddingTop: 28, paddingBottom: 0, position: 'relative',
        }}
      >
        {/* Logo centred */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, userSelect: 'none' }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--is-text-primary)', letterSpacing: '-0.01em' }}>Sinaxe</span>
          <span style={{ fontSize: 10, color: 'var(--is-text-tertiary)', verticalAlign: 'super' }}>™</span>
          <span style={{ fontSize: 20, fontWeight: 400, color: 'var(--is-text-secondary)', marginLeft: 3, letterSpacing: '-0.01em' }}>InScope</span>
        </div>

        {/* User avatar — top right */}
        <button
          aria-label="User profile"
          style={{
            position: 'absolute', right: 0,
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--is-surface)',
            boxShadow: 'var(--is-shadow-sm)',
            border: '1px solid var(--is-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--is-text-secondary)',
          }}
        >
          <User size={14} />
        </button>
      </div>

      {/* ── Main content ── */}
      <div
        style={{
          width: '100%', maxWidth: 760,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 28, paddingTop: 48, paddingBottom: 60,
        }}
      >
        {/* Scope bar */}
        <ScopeBar onScopeClick={() => setScopeMapOpen(true)} />

        {/* Chat composer */}
        <ChatComposer onSubmit={handleChatSubmit} />

        {/* Two-column cards */}
        <div style={{ display: 'flex', gap: 16, width: '100%', alignItems: 'flex-start' }}>
          <RecentActivityCard />
          <AttentionSummaryCard />
        </div>
      </div>

      {/* Scope map overlay */}
      {scopeMapOpen && <ScopeMapOverlay onClose={() => setScopeMapOpen(false)} />}
    </div>
  );
}
