/**
 * InScopeHome — calm chat-first home page
 *
 * Two states:
 *  1. EMPTY SCOPE  — scope bar shows greeting "Hi Sophia, what is in scope today?"
 *                    chat composer is centred; suggestion chips shown
 *  2. ACTIVE SCOPE — scope bar populated from the first prompt (client, year, workstream)
 *                    thread opens in AgentChatPage
 *
 * "New Scope" button in sidebar calls onNewScope → resets to empty state.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  Send, Clock, ChevronRight,
  AlertCircle, Loader2, CheckCircle2, XCircle,
  ArrowUpRight,
} from 'lucide-react';

import { useAgentChat } from '@/contexts/AgentChatContext';
import ScopeMapOverlay from '@/components/ScopeMapOverlay';
import InScopeSidebar from '@/components/InScopeSidebar';

// Time-aware greeting
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const PURPLE = '#6B21A8';
const ORANGE = '#C2410C';

// ─── Scope inference from prompt ─────────────────────────────────────────────
// Very lightweight — extracts year, client name, workstream from free text.

interface ScopeData {
  client: string;
  year: string;
  workstream: string;
  extra: string;
}

function inferScope(prompt: string): ScopeData {
  const lower = prompt.toLowerCase();

  // Year: 4-digit number
  const yearMatch = prompt.match(/\b(20\d{2})\b/);
  const year = yearMatch ? yearMatch[1] : 'FY 2025';

  // Workstream keywords
  let workstream = 'FAPI';
  if (lower.includes('t1134') || lower.includes('t 1134')) workstream = 'T1134';
  else if (lower.includes('surplus')) workstream = 'Surplus';
  else if (lower.includes('provision') || lower.includes('q2') || lower.includes('q1') || lower.includes('q3') || lower.includes('q4')) workstream = 'Provision';
  else if (lower.includes('transfer pricing') || lower.includes('tp benchmark')) workstream = 'Transfer Pricing';
  else if (lower.includes('fapi') || lower.includes('foreign accrual')) workstream = 'FAPI';

  // Client: word(s) after "for", "of", or at the end — capitalised
  let client = '';
  const forMatch = prompt.match(/\bfor\s+([A-Za-z][A-Za-z0-9\s&'-]{1,30}?)(?:\s+\d{4}|\s*$|,)/i);
  if (forMatch) {
    client = forMatch[1].trim();
  } else {
    // Fallback: last capitalised word sequence
    const caps = prompt.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g);
    if (caps && caps.length > 0) client = caps[caps.length - 1];
  }
  if (!client) client = '1 client';

  // Extra: exceptions / all / specific
  let extra = 'All affiliates';
  if (lower.includes('exception')) extra = 'Exceptions only';
  if (lower.includes('all')) extra = 'All affiliates';

  return { client, year, workstream, extra };
}

// ─── Scope button (animated dotted rings) ─────────────────────────────────────

function ScopeButton({ onClick }: { onClick: () => void }) {
  const SIZE = 72;
  const CX = SIZE / 2;
  const CY = SIZE / 2;

  return (
    <button
      onClick={onClick}
      aria-label="Open Scope Map"
      style={{
        width: SIZE, height: SIZE, borderRadius: '50%',
        background: 'var(--is-surface)',
        boxShadow: 'var(--is-shadow-out)',
        border: 'none', cursor: 'pointer', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'box-shadow 180ms var(--is-ease-out)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          'var(--is-shadow-out), 0 0 0 2px var(--is-accent-ring)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--is-shadow-out)';
      }}
    >
      <svg
        width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <style>{`
          @keyframes sb-cw  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes sb-ccw { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
          .sb-cw  { animation: sb-cw  14s linear infinite; transform-origin: ${CX}px ${CY}px; }
          .sb-ccw { animation: sb-ccw 9s  linear infinite; transform-origin: ${CX}px ${CY}px; }
          @media (prefers-reduced-motion: reduce) { .sb-cw, .sb-ccw { animation: none; } }
        `}</style>
        <g className="sb-cw">
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const dur = 22; const begin = -(i / 24) * dur;
            const kt = '0;0.02;0.07;0.93;0.98;1';
            const ks = '0 0 1 1;0.42 0 1 1;0 0 1 1;0 0 0.58 1;0 0 1 1';
            return (
              <circle key={i} cx={CX + 30 * Math.cos(a)} cy={CY + 30 * Math.sin(a)} r={0} fill={PURPLE}>
                <animate attributeName="r" values="0;0;0.1;1.4;0;0" keyTimes={kt} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" calcMode="spline" keySplines={ks} />
                <animate attributeName="opacity" values="0;0;0.7;0.7;0;0" keyTimes={kt} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" calcMode="spline" keySplines={ks} />
              </circle>
            );
          })}
        </g>
        <g className="sb-ccw">
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const dur = 15; const begin = -((16 - i) / 16) * dur;
            const kt = '0;0.02;0.07;0.93;0.98;1';
            const ks = '0 0 1 1;0.42 0 1 1;0 0 1 1;0 0 0.58 1;0 0 1 1';
            return (
              <circle key={i} cx={CX + 20 * Math.cos(a)} cy={CY + 20 * Math.sin(a)} r={0} fill={ORANGE}>
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

function ScopeBar({
  onScopeClick,
  scope,
  empty,
}: {
  onScopeClick: () => void;
  scope: ScopeData | null;
  empty: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center',
        background: 'var(--is-surface)',
        borderRadius: 'var(--is-radius-pill)',
        boxShadow: 'var(--is-shadow-out)',
        border: '1px solid var(--is-border)',
        padding: '8px 24px 8px 8px',
        width: '100%',
        transition: 'all 300ms ease-out',
      }}
    >
      <ScopeButton onClick={onScopeClick} />
      <div style={{ width: 1, height: 26, background: 'var(--is-border)', margin: '0 18px', flexShrink: 0 }} />

      {empty || !scope ? (
        /* ── Empty state: subtle placeholder ── */
        <span
          style={{
            fontSize: 13, fontWeight: 400,
            color: 'var(--is-text-tertiary)',
            letterSpacing: '-0.01em',
          }}
        >
          No scope defined — type a prompt below to get started
        </span>
      ) : (
        /* ── Active state: populated chips ── */
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0 4px' }}>
          {[scope.client, scope.year, scope.workstream, scope.extra].map((dim, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && <span style={{ color: 'rgba(0,0,0,0.18)', margin: '0 8px', fontSize: 14 }}>·</span>}
              <button
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '4px 6px', borderRadius: 8,
                  fontSize: 13, fontWeight: 500, color: 'var(--is-text-secondary)',
                  transition: 'color 140ms ease-out', whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--is-text-primary)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--is-text-secondary)'; }}
              >
                {dim}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Chat composer ────────────────────────────────────────────────────────────

function ChatComposer({ onSubmit, empty }: { onSubmit: (text: string) => void; empty: boolean }) {
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

  // Auto-focus when in empty scope state
  useEffect(() => {
    if (empty) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [empty]);

  const SUGGESTIONS = empty
    ? ['Calculate 2025 FAPI for Northstar', 'Open T1134 for Cascade', 'Review FAPI exceptions']
    : ['Add another client', 'Change year', 'Open worksheet'];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          background: 'var(--is-surface)',
          borderRadius: 'var(--is-radius-pill)',
          boxShadow: focused
            ? 'var(--is-shadow-in), 0 0 0 2px var(--is-accent-ring)'
            : 'var(--is-shadow-out)',
          border: '1px solid var(--is-border)',
          padding: '18px 18px 18px 28px',
          width: '100%',
          cursor: 'text',
          transition: 'box-shadow 200ms var(--is-ease-out)',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={
            empty
              ? 'e.g. Calculate 2025 FAPI for Northstar Inc…'
              : 'Ask, find, open or run anything in your tax workspace…'
          }
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontSize: 16, color: 'var(--is-text-primary)', fontFamily: 'inherit',
            fontWeight: 400,
          }}
        />

        <button
          onMouseDown={(e) => { e.preventDefault(); handleSend(); }}
          aria-label="Submit"
          style={{
            width: 44, height: 44, borderRadius: 18, flexShrink: 0,
            background: value.trim() ? 'var(--is-text-primary)' : 'var(--is-surface-2)',
            boxShadow: value.trim() ? '0 4px 14px rgba(32,39,53,0.22)' : 'var(--is-shadow-in)',
            border: 'none', cursor: value.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 160ms var(--is-ease-out)',
            color: value.trim() ? '#fff' : 'var(--is-text-tertiary)',
          }}
        >
          <Send size={15} />
        </button>
      </div>

      {/* Quick suggestions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSubmit(s)}
            style={{
              background: 'var(--is-surface)', border: '1px solid var(--is-border)',
              borderRadius: 20, padding: '6px 14px',
              fontSize: 12, color: 'var(--is-text-secondary)', cursor: 'pointer',
              boxShadow: 'var(--is-shadow-sm)',
              transition: 'all 140ms ease-out',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--is-text-primary)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'var(--is-shadow-out)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--is-text-secondary)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'var(--is-shadow-sm)';
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Recent activity (compact) ────────────────────────────────────────────────

const RECENT_ITEMS = [
  { id: '1', title: 'FAPI Readiness',             context: 'SAS Paris',       time: '2m ago',    route: '/fapi' },
  { id: '2', title: 'Q2 Provision Review',         context: 'Meridian Energy', time: '18m ago',   route: '/chat' },
  { id: '3', title: 'Intercompany Reconciliation', context: 'Atlas Financial', time: '1h ago',    route: '/chat' },
  { id: '4', title: 'T1134 Compliance Review',     context: 'Cascade Tech',    time: 'Yesterday', route: '/t1134' },
];

function RecentActivityCard() {
  const [, navigate] = useLocation();

  return (
    <div
      style={{
        background: 'var(--is-surface)',
        borderRadius: 'var(--is-radius)',
        boxShadow: 'var(--is-shadow-card)',
        border: '1px solid var(--is-border)',
        padding: '16px 20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Clock size={13} style={{ color: 'var(--is-text-secondary)' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--is-text-primary)', letterSpacing: '-0.01em' }}>Recent Activity</span>
        </div>
        <button
          onClick={() => navigate('/library')}
          style={{ fontSize: 11, color: 'var(--is-text-tertiary)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
        >
          View all <ArrowUpRight size={10} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {RECENT_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.route)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '7px 10px', borderRadius: 10, background: 'transparent',
              border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
              transition: 'background 130ms ease-out',
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
              <ChevronRight size={10} style={{ color: 'var(--is-text-tertiary)' }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Attention summary (compact) ──────────────────────────────────────────────

const ATTENTION_ROWS = [
  { id: 'input',     icon: AlertCircle,  label: 'Need your input', count: 4,  tint: true  },
  { id: 'running',   icon: Loader2,      label: 'Running',         count: 7,  tint: false },
  { id: 'completed', icon: CheckCircle2, label: 'Completed',       count: 12, tint: false },
  { id: 'blocked',   icon: XCircle,      label: 'Blocked',         count: 2,  tint: false },
];

function AttentionCard() {
  const [, navigate] = useLocation();

  return (
    <div
      style={{
        background: 'var(--is-surface)',
        borderRadius: 'var(--is-radius)',
        boxShadow: 'var(--is-shadow-card)',
        border: '1px solid var(--is-border)',
        padding: '16px 20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--is-text-primary)', letterSpacing: '-0.01em' }}>Attention</span>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ fontSize: 11, color: 'var(--is-text-tertiary)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
        >
          View all <ArrowUpRight size={10} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {ATTENTION_ROWS.map((row) => {
          const Icon = row.icon;
          return (
            <button
              key={row.id}
              onClick={() => navigate('/dashboard')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '7px 10px', borderRadius: 10,
                background: row.tint ? 'var(--is-accent-soft)' : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                transition: 'background 130ms ease-out',
              }}
              onMouseEnter={(e) => { if (!row.tint) (e.currentTarget as HTMLElement).style.background = 'var(--is-surface-2)'; }}
              onMouseLeave={(e) => { if (!row.tint) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <Icon size={13} style={{ color: row.tint ? 'var(--is-accent)' : 'var(--is-text-secondary)', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: row.tint ? 600 : 500, color: row.tint ? 'var(--is-accent)' : 'var(--is-text-primary)' }}>
                  {row.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: row.tint ? 'var(--is-accent)' : 'var(--is-text-primary)' }}>
                  {row.count}
                </span>
                <ChevronRight size={10} style={{ color: 'var(--is-text-tertiary)' }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── InScopeHome ──────────────────────────────────────────────────────────────

// Persist scope across navigations (back from chat → home still shows scope)
let _persistedScope: ScopeData | null = null;

export default function InScopeHome() {
  const [, navigate] = useLocation();
  const { openChat } = useAgentChat();
  const [scopeMapOpen, setScopeMapOpen] = useState(false);

  // null = empty scope (greeting), non-null = active scope
  const [scope, setScope] = useState<ScopeData | null>(_persistedScope);

  const handleNewScope = useCallback(() => {
    _persistedScope = null;
    setScope(null);
  }, []);

  const handleChatSubmit = useCallback((text: string) => {
    // Infer scope from the first prompt and populate the bar
    const inferred = inferScope(text);
    _persistedScope = inferred;
    setScope(inferred);

    // Brief visual delay so the user sees the scope bar populate, then open thread
    setTimeout(() => {
      openChat(text);
      navigate('/chat');
    }, 420);
  }, [openChat, navigate]);

  return (
    <div
      style={{
        height: '100vh',
        background: 'var(--is-bg)',
        display: 'flex',
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* ── Sidebar ── */}
      <InScopeSidebar onNewScope={handleNewScope} />

      {/* ── Main content — fills all remaining width ── */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* ── Top bar ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 32px 0',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, userSelect: 'none' }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--is-text-primary)', letterSpacing: '-0.01em' }}>Sinaxe</span>
            <span style={{ fontSize: 10, color: 'var(--is-text-tertiary)', verticalAlign: 'super' }}>™</span>
            <span style={{ fontSize: 20, fontWeight: 400, color: 'var(--is-text-secondary)', marginLeft: 4, letterSpacing: '-0.01em' }}>InScope</span>
          </div>
        </div>

        {/* ── Greeting — large, left-aligned, below top bar ── */}
        {!scope && (
          <div style={{ padding: '32px 48px 0', flexShrink: 0 }}>
            <h1 style={{
              margin: 0,
              fontSize: 'clamp(28px, 3.5vw, 42px)',
              fontWeight: 700,
              color: 'var(--is-text-primary)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}>
              {getGreeting()}, Sophia
            </h1>
            <p style={{
              margin: '6px 0 0',
              fontSize: 'clamp(13px, 1.4vw, 16px)',
              color: 'var(--is-text-secondary)',
              fontWeight: 400,
              letterSpacing: '-0.01em',
            }}>
              How can I help you drive impact today?
            </p>
          </div>
        )}

        {/* ── Scope bar — pinned near top ── */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '28px 40px 0', flexShrink: 0 }}>
          <div style={{ width: '100%', maxWidth: 760 }}>
            <ScopeBar
              onScopeClick={() => setScopeMapOpen(true)}
              scope={scope}
              empty={!scope}
            />
          </div>
        </div>

        {/* ── Centred zone: chat composer ── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 40px',
            gap: 16,
            minHeight: 0,
          }}
        >
          <div style={{ width: '100%', maxWidth: 760 }}>
            <ChatComposer onSubmit={handleChatSubmit} empty={!scope} />
          </div>
        </div>

        {/* ── Bottom zone: medium-sized cards, centred ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            padding: '0 40px 32px',
            flexShrink: 0,
          }}
        >
          <div style={{ width: 380 }}>
            <RecentActivityCard />
          </div>
          <div style={{ width: 260 }}>
            <AttentionCard />
          </div>
        </div>
      </div>

      {/* Scope map overlay */}
      {scopeMapOpen && <ScopeMapOverlay onClose={() => setScopeMapOpen(false)} />}
    </div>
  );
}
