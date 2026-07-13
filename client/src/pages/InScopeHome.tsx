/**
 * InScopeHome — AI-first workspace home
 *
 * States:
 *  1. EMPTY SCOPE  — greeting + composer centred, suggestion chips, bottom cards
 *  2. SCOPE ACTIVE — scope bar populated, composer + thread expand in-place
 *                    (no route navigation — thread lives right here)
 *
 * The chat bar morphs into the full timeline thread on first submit.
 * Greeting slides out. Thread grows from the composer position.
 * "New Scope" in sidebar clears thread and resets to empty state.
 */

import React, {
  useState, useRef, useCallback, useEffect,
} from 'react';
import { useLocation } from 'wouter';
import {
  Send, Clock, ChevronRight,
  AlertCircle, Loader2, CheckCircle2, XCircle,
  ArrowUpRight, LayoutGrid, Play, AlertTriangle,
  Zap, Mail, Flag, Sparkles, Trash2,
} from 'lucide-react';

import { useAgentChat } from '@/contexts/AgentChatContext';
import type { AgentMessage, EventKind } from '@/contexts/AgentChatContext';
import { AgentToolCard } from '@/components/AgentCards';
import ScopeMapOverlay from '@/components/ScopeMapOverlay';
import InScopeSidebar from '@/components/InScopeSidebar';

// ─── Design tokens (local) ────────────────────────────────────────────────────
const PURPLE = '#6B21A8';
const ORANGE = '#C2410C';

// ─── Time-aware greeting ──────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Scope inference ──────────────────────────────────────────────────────────
interface ScopeData { client: string; year: string; workstream: string; extra: string; }

function inferScope(prompt: string): ScopeData {
  const lower = prompt.toLowerCase();
  const yearMatch = prompt.match(/\b(20\d{2})\b/);
  const year = yearMatch ? yearMatch[1] : 'FY 2025';

  let workstream = 'FAPI';
  if (lower.includes('t1134') || lower.includes('t 1134')) workstream = 'T1134';
  else if (lower.includes('surplus')) workstream = 'Surplus';
  else if (lower.includes('provision') || lower.includes('q2') || lower.includes('q1')) workstream = 'Provision';
  else if (lower.includes('transfer pricing') || lower.includes('tp')) workstream = 'Transfer Pricing';

  let client = '';
  const forMatch = prompt.match(/\bfor\s+([A-Za-z][A-Za-z0-9\s&'-]{1,30}?)(?:\s+\d{4}|\s*$|,)/i);
  if (forMatch) client = forMatch[1].trim();
  else {
    const caps = prompt.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g);
    if (caps && caps.length > 0) client = caps[caps.length - 1];
  }
  if (!client) client = '1 client';

  let extra = 'All affiliates';
  if (lower.includes('exception')) extra = 'Exceptions only';

  return { client, year, workstream, extra };
}

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
        {/* Outer purple dots — breathing + rotating */}
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
        {/* Inner orange dots — breathing + counter-rotating */}
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
function ScopeBar({ onScopeClick, scope, empty }: {
  onScopeClick: () => void; scope: ScopeData | null; empty: boolean;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      background: 'var(--is-surface)', borderRadius: 'var(--is-radius-pill)',
      boxShadow: 'var(--is-shadow-out)', border: '1px solid var(--is-border)',
      padding: '10px 20px 10px 10px', width: '100%',
    }}>
      <ScopeButton onClick={onScopeClick} />
      <div style={{ width: 1, height: 26, background: 'var(--is-border)', margin: '0 18px', flexShrink: 0 }} />
      {empty || !scope ? (
        <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--is-text-tertiary)', letterSpacing: '-0.01em' }}>
          No scope defined — type a prompt below to get started
        </span>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0 4px' }}>
          {[scope.client, scope.year, scope.workstream, scope.extra].map((dim, i) => (
            <span key={i} style={{
              fontSize: 12, fontWeight: 600, color: 'var(--is-text-primary)',
              background: 'var(--is-surface-2)', borderRadius: 8,
              padding: '3px 9px', border: '1px solid var(--is-border)',
            }}>{dim}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Thread helpers (same visual language as AgentChatPage) ───────────────────

function TypingIndicator() {
  return (
    <div className="thread-item" style={{ marginBottom: 14 }}>
      <div className="node-dot node-dot--assistant" />
      <div style={{ paddingTop: 6 }}>
        <div style={{
          background: '#ffffff', border: '1px solid #e1e7ef',
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '10px 14px', borderRadius: 22,
          boxShadow: '0 2px 8px rgba(15,23,42,.04)',
        }}>
          <span className="typing-dot" style={{ animationDelay: '0ms' }} />
          <span className="typing-dot" style={{ animationDelay: '200ms' }} />
          <span className="typing-dot" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    </div>
  );
}

function SimpleMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}

const EVENT_CONFIG: Record<EventKind, {
  icon: React.ReactNode; dotClass: string; iconStyle: React.CSSProperties;
}> = {
  surface_opened: { icon: <LayoutGrid size={13} />, dotClass: 'node-dot--event', iconStyle: { background: '#e8f0ff', color: '#2563eb' } },
  task_run:       { icon: <Play size={13} />,       dotClass: 'node-dot--event', iconStyle: { background: '#e9fbf4', color: '#059669' } },
  warning:        { icon: <AlertTriangle size={13} />, dotClass: 'node-dot--warning', iconStyle: { background: '#fff7e6', color: '#b45309' } },
  proposal:       { icon: <Zap size={13} />,        dotClass: 'node-dot--event', iconStyle: { background: '#f2eaff', color: '#7c3aed' } },
  irl_sent:       { icon: <Mail size={13} />,       dotClass: 'node-dot--event', iconStyle: { background: '#e9fbf4', color: '#059669' } },
  approved:       { icon: <CheckCircle2 size={13} />, dotClass: 'node-dot--event', iconStyle: { background: '#e9fbf4', color: '#059669' } },
  flagged:        { icon: <Flag size={13} />,       dotClass: 'node-dot--warning', iconStyle: { background: '#fff7e6', color: '#b45309' } },
};

function EventCard({ msg }: { msg: AgentMessage }) {
  const kind = msg.eventKind ?? 'task_run';
  const cfg = EVENT_CONFIG[kind];
  const time = new Date(msg.timestamp).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="thread-item" style={{ marginBottom: 10 }}>
      <div className={`node-dot ${cfg.dotClass}`} />
      <div style={{
        border: '1px solid #dce6ef', background: 'rgba(255,255,255,0.85)',
        borderRadius: 16, padding: '9px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        boxShadow: '0 3px 10px rgba(15,23,42,.035)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{ ...cfg.iconStyle, width: 28, height: 28, borderRadius: 10, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            {cfg.icon}
          </div>
          <div style={{ minWidth: 0 }}>
            <strong style={{ fontSize: 13, display: 'block', color: '#273142' }}>{msg.eventTitle}</strong>
            <span style={{ fontSize: 12, color: '#7a8492', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 600 }}>
              {msg.eventDetail}
            </span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#98a2b3', whiteSpace: 'nowrap', marginLeft: 12 }}>{time}</div>
      </div>
    </div>
  );
}

// ─── Recent activity card ─────────────────────────────────────────────────────
const RECENT_ITEMS = [
  { id: '1', title: 'FAPI Readiness',             context: 'SAS Paris',       time: '2m ago',    route: '/fapi' },
  { id: '2', title: 'Q2 Provision Review',         context: 'Meridian Energy', time: '18m ago',   route: '/chat' },
  { id: '3', title: 'Intercompany Reconciliation', context: 'Atlas Financial', time: '1h ago',    route: '/chat' },
  { id: '4', title: 'T1134 Compliance Review',     context: 'Cascade Tech',    time: 'Yesterday', route: '/t1134' },
];

function RecentActivityCard() {
  const [, navigate] = useLocation();
  return (
    <div style={{ background: 'var(--is-surface)', borderRadius: 'var(--is-radius)', boxShadow: 'var(--is-shadow-card)', border: '1px solid var(--is-border)', padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Clock size={13} style={{ color: 'var(--is-text-secondary)' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--is-text-primary)', letterSpacing: '-0.01em' }}>Recent Activity</span>
        </div>
        <button onClick={() => navigate('/library')} style={{ fontSize: 11, color: 'var(--is-text-tertiary)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
          View all <ArrowUpRight size={10} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {RECENT_ITEMS.map((item) => (
          <button key={item.id} onClick={() => navigate(item.route)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '7px 10px', borderRadius: 10, background: 'transparent',
            border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
            transition: 'background 130ms ease-out',
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--is-surface-2)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--is-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
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

const ATTENTION_ROWS = [
  { id: 'input',     icon: AlertCircle,  label: 'Need your input', count: 4,  tint: true  },
  { id: 'running',   icon: Loader2,      label: 'Running',         count: 7,  tint: false },
  { id: 'completed', icon: CheckCircle2, label: 'Completed',       count: 12, tint: false },
  { id: 'blocked',   icon: XCircle,      label: 'Blocked',         count: 2,  tint: false },
];

function AttentionCard() {
  const [, navigate] = useLocation();
  return (
    <div style={{ background: 'var(--is-surface)', borderRadius: 'var(--is-radius)', boxShadow: 'var(--is-shadow-card)', border: '1px solid var(--is-border)', padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--is-text-primary)', letterSpacing: '-0.01em' }}>Attention</span>
        <button onClick={() => navigate('/dashboard')} style={{ fontSize: 11, color: 'var(--is-text-tertiary)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
          View all <ArrowUpRight size={10} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {ATTENTION_ROWS.map((row) => {
          const Icon = row.icon;
          return (
            <button key={row.id} onClick={() => navigate('/dashboard')} style={{
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
                <span style={{ fontSize: 12, fontWeight: row.tint ? 600 : 500, color: row.tint ? 'var(--is-accent)' : 'var(--is-text-primary)' }}>{row.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: row.tint ? 'var(--is-accent)' : 'var(--is-text-primary)' }}>{row.count}</span>
                <ChevronRight size={10} style={{ color: 'var(--is-text-tertiary)' }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Persist scope across navigations ────────────────────────────────────────
let _persistedScope: ScopeData | null = null;

// ─── InScopeHome ─────────────────────────────────────────────────────────────
export default function InScopeHome() {
  const { state, sendMessage, approveCard, cancelCard, clearThread, openChat } = useAgentChat();
  const [scopeMapOpen, setScopeMapOpen] = useState(false);
  const [scope, setScope] = useState<ScopeData | null>(_persistedScope);
  // threadOpen: false = home view, true = thread expanded in place
  const [threadOpen, setThreadOpen] = useState(false);
  // composerInput for the home bar
  const [homeInput, setHomeInput] = useState('');
  // composerInput for the thread bar
  const [threadInput, setThreadInput] = useState('');
  const homeInputRef = useRef<HTMLInputElement>(null);
  const threadInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll thread
  useEffect(() => {
    if (threadOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.messages, state.isAgentTyping, threadOpen]);

  // Focus home input on mount
  useEffect(() => {
    if (!threadOpen) setTimeout(() => homeInputRef.current?.focus(), 80);
  }, [threadOpen]);

  // Focus thread input when thread opens
  useEffect(() => {
    if (threadOpen) setTimeout(() => threadInputRef.current?.focus(), 300);
  }, [threadOpen]);

  const handleNewScope = useCallback(() => {
    _persistedScope = null;
    setScope(null);
    setThreadOpen(false);
    clearThread();
  }, [clearThread]);

  // First prompt from home bar: populate scope, clear old thread, expand thread
  const handleHomeSubmit = useCallback((text: string) => {
    if (!text.trim()) return;
    const inferred = inferScope(text);
    _persistedScope = inferred;
    setScope(inferred);
    // Clear any previous thread so we start fresh
    clearThread();
    // Brief delay so user sees scope bar populate, then expand thread
    setTimeout(() => {
      setThreadOpen(true);
      openChat(text);
    }, 380);
    setHomeInput('');
  }, [clearThread, openChat]);

  const handleHomeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleHomeSubmit(homeInput);
  };

  // Thread composer send
  const handleThreadSend = useCallback(() => {
    if (!threadInput.trim() || state.isAgentTyping) return;
    sendMessage(threadInput.trim());
    setThreadInput('');
    threadInputRef.current?.focus();
  }, [threadInput, sendMessage, state.isAgentTyping]);

  const handleThreadKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleThreadSend(); }
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });

  const SUGGESTIONS = ['Calculate 2025 FAPI for Northstar', 'Open T1134 for Cascade', 'Review FAPI exceptions'];

  return (
    <div style={{
      height: '100vh', background: 'var(--is-bg)',
      display: 'flex', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      overflow: 'hidden',
    }}>
      <InScopeSidebar onNewScope={handleNewScope} />

      {/* ── Main content ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

        {/* ── Top bar (logo only) ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 32px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, userSelect: 'none' }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--is-text-primary)', letterSpacing: '-0.01em' }}>Sinaxe</span>
            <span style={{ fontSize: 10, color: 'var(--is-text-tertiary)', verticalAlign: 'super' }}>™</span>
            <span style={{ fontSize: 20, fontWeight: 400, color: 'var(--is-text-secondary)', marginLeft: 4, letterSpacing: '-0.01em' }}>InScope</span>
          </div>
        </div>

        {/* ── Greeting (empty scope only) ── */}
        <div style={{
          padding: '32px 48px 0', flexShrink: 0,
          overflow: 'hidden',
          maxHeight: !scope ? 120 : 0,
          opacity: !scope ? 1 : 0,
          transition: 'max-height 380ms cubic-bezier(0.23,1,0.32,1), opacity 280ms ease-out',
        }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 700, color: 'var(--is-text-primary)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            {getGreeting()}, Sophia
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 'clamp(13px, 1.4vw, 16px)', color: 'var(--is-text-secondary)', fontWeight: 400, letterSpacing: '-0.01em' }}>
            How can I help you drive impact today?
          </p>
        </div>

        {/* ── Scope bar ── */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '28px 40px 0', flexShrink: 0 }}>
          <div style={{ width: '100%', maxWidth: 820 }}>
            <ScopeBar onScopeClick={() => setScopeMapOpen(true)} scope={scope} empty={!scope} />
          </div>
        </div>

        {/* ── HOME VIEW: composer centred + bottom cards ── */}
        {!threadOpen && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {/* Centred composer */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px', gap: 16, minHeight: 0 }}>
              <div style={{ width: '100%', maxWidth: 820 }}>
                {/* Composer bar */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: 'var(--is-surface)', borderRadius: 'var(--is-radius-pill)',
                  boxShadow: 'var(--is-shadow-out)', border: '1px solid var(--is-border)',
                  padding: '18px 18px 18px 28px', width: '100%', cursor: 'text',
                  transition: 'box-shadow 200ms var(--is-ease-out)',
                }}>
                  <input
                    ref={homeInputRef}
                    type="text"
                    value={homeInput}
                    onChange={(e) => setHomeInput(e.target.value)}
                    onKeyDown={handleHomeKeyDown}
                    placeholder="e.g. Calculate 2025 FAPI for Northstar Inc…"
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 16, color: 'var(--is-text-primary)', fontFamily: 'inherit', fontWeight: 400 }}
                  />
                  <button
                    onMouseDown={(e) => { e.preventDefault(); handleHomeSubmit(homeInput); }}
                    aria-label="Submit"
                    style={{
                      width: 44, height: 44, borderRadius: 18, flexShrink: 0,
                      background: homeInput.trim() ? 'var(--is-text-primary)' : 'var(--is-surface-2)',
                      boxShadow: homeInput.trim() ? '0 4px 14px rgba(32,39,53,0.22)' : 'var(--is-shadow-in)',
                      border: 'none', cursor: homeInput.trim() ? 'pointer' : 'default',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 160ms var(--is-ease-out)',
                      color: homeInput.trim() ? '#fff' : 'var(--is-text-tertiary)',
                    }}
                  >
                    <Send size={15} />
                  </button>
                </div>
                {/* Suggestion chips */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => handleHomeSubmit(s)} style={{
                      background: 'var(--is-surface)', border: '1px solid var(--is-border)',
                      borderRadius: 20, padding: '6px 14px', fontSize: 12,
                      color: 'var(--is-text-secondary)', cursor: 'pointer',
                      boxShadow: 'var(--is-shadow-sm)', transition: 'all 140ms ease-out', whiteSpace: 'nowrap',
                    }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--is-text-primary)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--is-shadow-out)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--is-text-secondary)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--is-shadow-sm)'; }}
                    >{s}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom cards */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, padding: '0 40px 32px', flexShrink: 0 }}>
              <div style={{ width: 380 }}><RecentActivityCard /></div>
              <div style={{ width: 260 }}><AttentionCard /></div>
            </div>
          </div>
        )}

        {/* ── THREAD VIEW: expands in place ── */}
        {threadOpen && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
            animation: 'threadExpand 340ms cubic-bezier(0.23,1,0.32,1) both',
          }}>
            {/* Thread header bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 40px', borderBottom: '1px solid #edf1f5',
              background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
              flexShrink: 0,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 14, flexShrink: 0,
                background: 'linear-gradient(135deg, #111827, #4f46e5)',
                display: 'grid', placeItems: 'center',
              }}>
                <Sparkles size={14} style={{ color: '#fff' }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  Workflow Copilot
                </div>
                <div style={{ fontSize: 11, color: '#7a8492', marginTop: 2 }}>
                  {scope?.client} · {scope?.workstream} · {scope?.year}
                </div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                {state.messages.length > 0 && (
                  <button onClick={() => { clearThread(); setThreadOpen(false); setScope(null); _persistedScope = null; }}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9ca3af', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#6b7280'; (e.currentTarget as HTMLElement).style.background = '#f9fafb'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#9ca3af'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <Trash2 size={11} /> New scope
                  </button>
                )}
              </div>
            </div>

            {/* Thread scroll area with timeline line */}
            <div className="chat-scroll" style={{
              flex: 1, overflowY: 'auto',
              background: `linear-gradient(90deg, transparent 0 33px, #e2e8f0 33px 34px, transparent 34px 100%), #fbfdff`,
              padding: '24px 40px 24px 18px',
            }}>
              <div style={{ maxWidth: 820, margin: '0 auto' }}>

                {/* Empty thread state */}
                {state.messages.length === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg,#111827,#4f46e5)', display: 'grid', placeItems: 'center', marginBottom: 16, boxShadow: '0 8px 24px rgba(79,70,229,0.22)' }}>
                      <Sparkles size={20} style={{ color: '#fff' }} />
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 6px', letterSpacing: '-0.02em' }}>Starting workflow…</p>
                    <p style={{ fontSize: 12, color: '#7a8492', textAlign: 'center', maxWidth: 320, lineHeight: 1.5, margin: 0 }}>
                      The agent is preparing your {scope?.workstream} workflow for {scope?.client}.
                    </p>
                  </div>
                )}

                {/* Messages */}
                {state.messages.map((msg) => {
                  if (msg.role === 'event') return <EventCard key={msg.id} msg={msg} />;

                  const isUser = msg.role === 'user';
                  if (isUser) {
                    return (
                      <div key={msg.id} className="thread-item" style={{ marginBottom: 14 }}>
                        <div className="node-dot node-dot--user" />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <div style={{
                            background: '#111827', color: '#fff', border: '1px solid #111827',
                            borderRadius: 22, borderBottomRightRadius: 6,
                            padding: '10px 14px', maxWidth: '70%', width: 'max-content',
                            boxShadow: '0 4px 14px rgba(17,24,39,.18)',
                          }}>
                            <p style={{ margin: 0, color: '#fff', fontSize: 14, lineHeight: 1.5 }}>{msg.text}</p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className="thread-item" style={{ marginBottom: 16 }}>
                      <div className="node-dot node-dot--assistant" />
                      <div style={{ paddingTop: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8b95a4', fontSize: 12, fontWeight: 650, marginBottom: 7 }}>
                          <span style={{ color: '#111827', fontWeight: 700 }}>Workflow Copilot</span>
                          <span style={{ width: 4, height: 4, background: '#cbd5e1', borderRadius: '50%', display: 'inline-block' }} />
                          <span>{formatTime(msg.timestamp)}</span>
                        </div>
                        {msg.text && (
                          <div style={{
                            border: '1px solid #e1e7ef', borderRadius: 22, borderTopLeftRadius: 6,
                            background: '#ffffff', padding: '12px 16px',
                            boxShadow: '0 4px 16px rgba(15,23,42,.05)',
                            marginBottom: msg.toolCard ? 10 : 0, maxWidth: 600,
                          }}>
                            <p style={{ margin: 0, color: '#374151', fontSize: 14, lineHeight: 1.55 }}>
                              <SimpleMarkdown text={msg.text} />
                            </p>
                          </div>
                        )}
                        {msg.toolCard && (
                          <AgentToolCard card={msg.toolCard} messageId={msg.id} onApprove={approveCard} onCancel={cancelCard} />
                        )}
                      </div>
                    </div>
                  );
                })}

                {state.isAgentTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Thread composer */}
            <div style={{
              flexShrink: 0, borderTop: '1px solid #edf1f5',
              background: 'linear-gradient(180deg, rgba(251,253,255,0.72), #fff 28%)',
              padding: '14px 40px 18px 63px',
            }}>
              <div style={{
                height: 52, border: '1px solid #d7e2ec', background: '#fff',
                borderRadius: 18, display: 'grid',
                gridTemplateColumns: '1fr auto auto', alignItems: 'center',
                gap: 10, padding: '0 10px 0 16px',
                boxShadow: '0 8px 28px rgba(15,23,42,.07)',
              }}>
                <textarea
                  ref={threadInputRef}
                  value={threadInput}
                  onChange={(e) => setThreadInput(e.target.value)}
                  onKeyDown={handleThreadKeyDown}
                  placeholder="Ask about this workflow, open a surface, run a task…"
                  rows={1}
                  style={{
                    resize: 'none', fontSize: 14, color: '#374151',
                    background: 'transparent', outline: 'none', border: 'none',
                    lineHeight: 1.5, maxHeight: 72, overflowY: 'auto', fontFamily: 'inherit',
                  }}
                />
                <button style={{
                  height: 28, borderRadius: 9, border: '1px solid #dce6ef', background: '#fff',
                  padding: '0 10px', color: '#596274', fontWeight: 650, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap',
                }}>
                  Act mode
                </button>
                <button onClick={handleThreadSend} disabled={!threadInput.trim() || state.isAgentTyping} style={{
                  width: 36, height: 36, borderRadius: 13,
                  background: threadInput.trim() && !state.isAgentTyping ? '#111827' : '#e5e7eb',
                  color: threadInput.trim() && !state.isAgentTyping ? '#fff' : '#9ca3af',
                  display: 'grid', placeItems: 'center', border: 'none',
                  cursor: threadInput.trim() && !state.isAgentTyping ? 'pointer' : 'default',
                  transition: 'all 0.15s ease',
                }}>
                  <Send size={13} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scope map overlay */}
      {scopeMapOpen && <ScopeMapOverlay onClose={() => setScopeMapOpen(false)} />}

      <style>{`
        @keyframes threadExpand {
          from { opacity: 0; transform: translateY(18px) scale(0.985); }
          to   { opacity: 1; transform: translateY(0)    scale(1);     }
        }
        .thread-item {
          display: grid;
          grid-template-columns: 32px 1fr;
          gap: 13px;
          position: relative;
        }
        .node-dot {
          width: 18px; height: 18px; border-radius: 50%;
          margin-left: 24px; margin-top: 10px; transform: translateX(-50%);
          background: #fff; border: 2px solid #cbd5e1;
          display: grid; place-items: center; z-index: 1; flex-shrink: 0;
        }
        .node-dot::after {
          content: ""; width: 7px; height: 7px; border-radius: 50%;
          background: #94a3b8; display: block;
        }
        .node-dot--user::after      { background: #111827; }
        .node-dot--assistant::after { background: #6B21A8; }
        .node-dot--event::after     { background: #10b981; }
        .node-dot--warning::after   { background: #f59e0b; }
        .chat-scroll::-webkit-scrollbar { width: 8px; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #d8e1eb; border: 2px solid #fbfdff; border-radius: 999px; }
        .chat-scroll::-webkit-scrollbar-track { background: #fbfdff; }
        .typing-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #94a3b8;
          animation: typingBounce 1.2s infinite; display: inline-block;
        }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%           { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
