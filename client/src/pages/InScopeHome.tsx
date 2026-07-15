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
  Zap, Mail, Flag, Trash2,
  GitFork, BarChart2, FileText, ExternalLink, X,
} from 'lucide-react';

import { useAgentChat } from '@/contexts/AgentChatContext';
import type { AgentMessage, EventKind } from '@/contexts/AgentChatContext';
import { AgentToolCard } from '@/components/AgentCards';
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

// ─── Scope popover menu ──────────────────────────────────────────────────────
function ScopePopover({ onClose }: { onClose: () => void }) {
  const [, navigate] = useLocation();
  const items = [
    { icon: GitFork,    label: 'Workflow Builder', sub: 'Design & manage workflows',  route: '/builder' },
    { icon: BarChart2,  label: 'Dashboards',        sub: 'Analytics & KPI overview',   route: '/dashboard' },
  ];
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 49 }}
      />
      {/* Popover panel */}
      <div style={{
        position: 'absolute', bottom: 'calc(100% + 12px)', left: 0,
        zIndex: 50, width: 260,
        background: 'var(--is-surface)', borderRadius: 18,
        boxShadow: '0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)',
        border: '1px solid var(--is-border)',
        padding: '8px 0',
        animation: 'popoverIn 180ms cubic-bezier(0.23,1,0.32,1) both',
      }}>
        <div style={{ padding: '6px 16px 10px', borderBottom: '1px solid var(--is-border)', marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--is-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Quick Access</span>
        </div>
        {items.map(({ icon: Icon, label, sub, route }) => (
          <button
            key={route}
            onClick={() => { onClose(); navigate(route); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 16px', background: 'transparent', border: 'none',
              cursor: 'pointer', textAlign: 'left', borderRadius: 0,
              transition: 'background 120ms ease-out',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--is-surface-2)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: 'var(--is-surface-2)', boxShadow: 'var(--is-shadow-in)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--is-text-secondary)',
            }}>
              <Icon size={16} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--is-text-primary)' }}>{label}</div>
              <div style={{ fontSize: 11, color: 'var(--is-text-tertiary)', marginTop: 1 }}>{sub}</div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

// ─── Contextual workflow action chips ────────────────────────────────────────
function WorkflowActions({ workstream, onAction }: { workstream: string; onAction: (label: string) => void }) {
  const actions: Record<string, { label: string; icon: typeof FileText }[]> = {
    FAPI:     [
      { label: 'Open Worksheet',    icon: FileText },
      { label: 'Send IRL',          icon: Mail },
      { label: 'Review Exceptions', icon: AlertTriangle },
      { label: 'Export PDF',        icon: ExternalLink },
    ],
    T1134:    [
      { label: 'Open T1134 Form',   icon: FileText },
      { label: 'Review Part II',    icon: AlertCircle },
      { label: 'Send to Partner',   icon: Mail },
    ],
    Surplus:  [
      { label: 'Open Surplus Calc', icon: FileText },
      { label: 'Review Adjustments', icon: AlertTriangle },
    ],
    Provision: [
      { label: 'Open Provision Model', icon: FileText },
      { label: 'Review Estimates',     icon: AlertCircle },
    ],
  };
  const items = actions[workstream] ?? [
    { label: 'View Documents', icon: FileText },
    { label: 'Add Note',       icon: Flag },
    { label: 'Export',         icon: ExternalLink },
  ];
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 8,
      marginLeft: 32, marginTop: 16, marginBottom: 8,
      animation: 'stepFadeIn 280ms cubic-bezier(0.23,1,0.32,1) both',
    }}>
      {items.map(({ label, icon: Icon }) => (
        <button
          key={label}
          onClick={() => onAction(label)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 20,
            background: 'var(--is-surface)', border: '1px solid var(--is-border)',
            boxShadow: 'var(--is-shadow-sm)', cursor: 'pointer',
            fontSize: 12, fontWeight: 500, color: 'var(--is-text-secondary)',
            fontFamily: 'inherit',
            transition: 'all 140ms ease-out',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.color = 'var(--is-text-primary)';
            el.style.boxShadow = 'var(--is-shadow-out)';
            el.style.borderColor = 'rgba(107,33,168,0.25)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.color = 'var(--is-text-secondary)';
            el.style.boxShadow = 'var(--is-shadow-sm)';
            el.style.borderColor = 'var(--is-border)';
          }}
        >
          <Icon size={12} />
          {label}
        </button>
      ))}
    </div>
  );
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

// ─── Unified composer bar (scope logo + chips + input + send) ────────────────
function UnifiedBar({
  onScopeClick, scope, input, onInputChange, onKeyDown, onSubmit, inputRef, isThread, isTyping,
}: {
  onScopeClick: () => void;
  scope: ScopeData | null;
  input: string;
  onInputChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSubmit: () => void;
  inputRef: React.Ref<HTMLInputElement & HTMLTextAreaElement>;
  isThread?: boolean;
  isTyping?: boolean;
}) {
  const hasInput = input.trim().length > 0;
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: 'var(--is-surface)', borderRadius: 'var(--is-radius-pill)',
      boxShadow: 'var(--is-shadow-out)', border: '1px solid var(--is-border)',
      padding: '8px 10px 8px 8px', width: '100%', gap: 0,
      transition: 'box-shadow 200ms var(--is-ease-out)',
    }}
      onFocus={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--is-shadow-out), 0 0 0 2px var(--is-accent-ring)'; }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) (e.currentTarget as HTMLElement).style.boxShadow = 'var(--is-shadow-out)'; }}
    >
      {/* Scope logo */}
      <div style={{ flexShrink: 0 }}>
        <ScopeButton onClick={onScopeClick} />
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 26, background: 'var(--is-border)', margin: '0 14px', flexShrink: 0 }} />

      {/* Scope chips (when active) */}
      {scope && (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', gap: 4, marginRight: 10, flexShrink: 0, maxWidth: '40%', overflow: 'hidden' }}>
          {[scope.client, scope.year, scope.workstream].map((dim, i) => (
            <span key={i} style={{
              fontSize: 11, fontWeight: 600, color: 'var(--is-text-primary)',
              background: 'var(--is-surface-2)', borderRadius: 6,
              padding: '2px 8px', border: '1px solid var(--is-border)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{dim}</span>
          ))}
        </div>
      )}

      {/* Input */}
      {isThread ? (
        <textarea
          ref={inputRef as React.Ref<HTMLTextAreaElement>}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown as React.KeyboardEventHandler<HTMLTextAreaElement>}
          placeholder={scope ? `Ask about ${scope.workstream} for ${scope.client}…` : 'Ask about this workflow…'}
          rows={1}
          style={{
            flex: 1, resize: 'none', fontSize: 15, color: 'var(--is-text-primary)',
            background: 'transparent', outline: 'none', border: 'none',
            lineHeight: 1.5, maxHeight: 72, overflowY: 'auto', fontFamily: 'inherit', fontWeight: 400,
          }}
        />
      ) : (
        <input
          ref={inputRef as React.Ref<HTMLInputElement>}
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown as React.KeyboardEventHandler<HTMLInputElement>}
          placeholder={scope ? `Ask about ${scope.workstream} for ${scope.client}…` : 'e.g. Calculate 2025 FAPI for Northstar Inc…'}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontSize: 15, color: 'var(--is-text-primary)', fontFamily: 'inherit', fontWeight: 400,
          }}
        />
      )}

      {/* Send button */}
      <button
        onMouseDown={(e) => { e.preventDefault(); onSubmit(); }}
        disabled={!hasInput || isTyping}
        aria-label="Send"
        style={{
          width: 44, height: 44, borderRadius: 18, flexShrink: 0,
          background: hasInput && !isTyping ? 'var(--is-text-primary)' : 'var(--is-surface-2)',
          boxShadow: hasInput && !isTyping ? '0 4px 14px rgba(32,39,53,0.22)' : 'var(--is-shadow-in)',
          border: 'none', cursor: hasInput && !isTyping ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 160ms var(--is-ease-out)',
          color: hasInput && !isTyping ? '#fff' : 'var(--is-text-tertiary)',
        }}
      >
        <Send size={15} />
      </button>
    </div>
  );
}

// ─── Thread helpers — Aside AI style ─────────────────────────────────────────

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

// Icon map for event kinds
const EVENT_ICON_MAP: Record<EventKind, React.ReactNode> = {
  surface_opened: <LayoutGrid size={18} />,
  task_run:       <Play size={18} />,
  warning:        <AlertTriangle size={18} />,
  proposal:       <Zap size={18} />,
  irl_sent:       <Mail size={18} />,
  approved:       <CheckCircle2 size={18} />,
  flagged:        <Flag size={18} />,
};

// Aside-style step item: icon + large title + optional detail + optional time
function StepItem({ icon, title, detail, time, isActive, children }: {
  icon: React.ReactNode;
  title: string;
  detail?: string;
  time?: string;
  isActive?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="aside-step" style={{ marginBottom: 48 }}>
      {/* Spine dot */}
      <div className={`aside-dot${isActive ? ' aside-dot--active' : ''}`} />
      {/* Content */}
      <div style={{ paddingLeft: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: detail || children ? 12 : 0 }}>
          <span style={{ color: '#9ca3af', flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon}</span>
          <span style={{ fontSize: 22, fontWeight: 500, color: '#111827', letterSpacing: '-0.025em', lineHeight: 1.3, flex: 1 }}>{title}</span>
          {time && <span style={{ fontSize: 13, color: '#9ca3af', whiteSpace: 'nowrap', marginLeft: 8 }}>{time}</span>}
        </div>
        {detail && (
          <p style={{ margin: '0 0 0 32px', fontSize: 16, color: '#374151', lineHeight: 1.6, maxWidth: 640 }}>{detail}</p>
        )}
        {children && (
          <div style={{ marginLeft: 32, marginTop: 12 }}>{children}</div>
        )}
      </div>
    </div>
  );
}

function EventCard({ msg, isActive }: { msg: AgentMessage; isActive?: boolean }) {
  const kind = msg.eventKind ?? 'task_run';
  const icon = EVENT_ICON_MAP[kind];
  const time = new Date(msg.timestamp).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });
  return (
    <StepItem icon={icon} title={msg.eventTitle ?? ''} detail={msg.eventDetail} time={time} isActive={isActive} />
  );
}

// Typing indicator — Aside style: animated dots inline below a step title
function TypingIndicator() {
  return (
    <div className="aside-step" style={{ marginBottom: 48 }}>
      <div className="aside-dot aside-dot--active" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ color: '#9ca3af', flexShrink: 0, display: 'flex', alignItems: 'center' }}><Loader2 size={18} className="sofi-spin" /></span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingTop: 2 }}>
          <span className="typing-dot" style={{ animationDelay: '0ms' }} />
          <span className="typing-dot" style={{ animationDelay: '180ms' }} />
          <span className="typing-dot" style={{ animationDelay: '360ms' }} />
        </div>
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
  const [scopePopoverOpen, setScopePopoverOpen] = useState(false);
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

        {/* ── HOME VIEW: greeting above bar, cards below ── */}
        {!threadOpen && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {/* Centred composer group */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px', gap: 0, minHeight: 0 }}>
              <div style={{ width: '100%', maxWidth: 860 }}>

                {/* Greeting — directly above bar, fades out when scope active */}
                <div style={{
                  overflow: 'hidden',
                  maxHeight: !scope ? 100 : 0,
                  opacity: !scope ? 1 : 0,
                  marginBottom: !scope ? 20 : 0,
                  transition: 'max-height 380ms cubic-bezier(0.23,1,0.32,1), opacity 280ms ease-out, margin-bottom 380ms ease-out',
                }}>
                  <h1 style={{ margin: 0, fontSize: 'clamp(24px, 2.8vw, 36px)', fontWeight: 700, color: 'var(--is-text-primary)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                    {getGreeting()}, Sophia
                  </h1>
                  <p style={{ margin: '5px 0 0', fontSize: 'clamp(13px, 1.2vw, 15px)', color: 'var(--is-text-secondary)', fontWeight: 400, letterSpacing: '-0.01em' }}>
                    How can I help you drive impact today?
                  </p>
                </div>

                {/* Unified bar */}
                <div style={{ position: 'relative' }}>
                  {scopePopoverOpen && <ScopePopover onClose={() => setScopePopoverOpen(false)} />}
                  <UnifiedBar
                    onScopeClick={() => setScopePopoverOpen(v => !v)}
                    scope={scope}
                    input={homeInput}
                    onInputChange={setHomeInput}
                    onKeyDown={handleHomeKeyDown as React.KeyboardEventHandler}
                    onSubmit={() => handleHomeSubmit(homeInput)}
                    inputRef={homeInputRef as React.Ref<HTMLInputElement & HTMLTextAreaElement>}
                  />
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

                {/* Cards — same width, directly below chips */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 28 }}>
                  <div style={{ flex: '0 0 380px' }}><RecentActivityCard /></div>
                  <div style={{ flex: '0 0 380px' }}><AttentionCard /></div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ── THREAD VIEW: Aside AI style — slides up from chat bar ── */}
        {threadOpen && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
            animation: 'threadSlideUp 420ms cubic-bezier(0.23,1,0.32,1) both',
          }}>

            {/* Spine + messages */}
            <div className="chat-scroll" style={{
              flex: 1, overflowY: 'auto',
              background: '#ffffff',
              padding: '40px 0 8px 0',
            }}>
              {/* Spine line container — fixed left column */}
              <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 40px', position: 'relative' }}>
                {/* Vertical spine line */}
                <div style={{
                  position: 'absolute', left: 40 + 14, top: 0, bottom: 0,
                  width: 1, background: '#e5e7eb', zIndex: 0,
                }} />

                {/* Empty state */}
                {state.messages.length === 0 && (
                  <div className="aside-step" style={{ marginBottom: 48 }}>
                    <div className="aside-dot aside-dot--active" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ color: '#9ca3af' }}><Loader2 size={18} className="sofi-spin" /></span>
                      <span style={{ fontSize: 16, color: '#9ca3af', fontStyle: 'italic' }}>
                        Starting {scope?.workstream} workflow for {scope?.client}…
                      </span>
                    </div>
                  </div>
                )}

                {/* Messages */}
                {state.messages.map((msg, idx) => {
                  const isLast = idx === state.messages.length - 1 && !state.isAgentTyping;

                  if (msg.role === 'event') {
                    return <EventCard key={msg.id} msg={msg} isActive={isLast} />;
                  }

                  if (msg.role === 'user') {
                    return (
                      <div key={msg.id} className="aside-step" style={{ marginBottom: 48 }}>
                        <div className="aside-dot" />
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', paddingTop: 4 }}>You</span>
                          <span style={{ fontSize: 20, fontWeight: 500, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.4 }}>{msg.text}</span>
                        </div>
                      </div>
                    );
                  }

                  // Assistant message — Aside style: step title + body paragraph
                  const firstLine = msg.text?.split('\n')[0] ?? '';
                  const rest = msg.text?.split('\n').slice(1).join('\n').trim() ?? '';
                  return (
                    <div key={msg.id} className="aside-step" style={{ marginBottom: 48 }}>
                      <div className={`aside-dot${isLast ? ' aside-dot--active' : ''}`} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: (rest || msg.toolCard) ? 14 : 0 }}>
                          <span style={{ color: '#9ca3af', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                            <Play size={18} />
                          </span>
                          <span style={{ fontSize: 22, fontWeight: 500, color: '#111827', letterSpacing: '-0.025em', lineHeight: 1.3, flex: 1 }}>
                            <SimpleMarkdown text={firstLine} />
                          </span>
                          <span style={{ fontSize: 13, color: '#9ca3af', whiteSpace: 'nowrap' }}>{formatTime(msg.timestamp)}</span>
                        </div>
                        {rest && (
                          <p style={{ margin: '0 0 12px 32px', fontSize: 16, color: '#374151', lineHeight: 1.65, maxWidth: 640 }}>
                            <SimpleMarkdown text={rest} />
                          </p>
                        )}
                        {msg.toolCard && (
                          <div style={{ marginLeft: 32, marginTop: 4 }}>
                            <AgentToolCard card={msg.toolCard} messageId={msg.id} onApprove={approveCard} onCancel={cancelCard} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {state.isAgentTyping && <TypingIndicator />}

                {/* Contextual workflow actions — shown after last agent message when not typing */}
                {!state.isAgentTyping && state.messages.length > 0 && scope && (() => {
                  const lastMsg = state.messages[state.messages.length - 1];
                  if (lastMsg.role === 'agent') {
                    return (
                      <WorkflowActions
                        workstream={scope.workstream}
                        onAction={(label) => {
                          sendMessage(label);
                        }}
                      />
                    );
                  }
                  return null;
                })()}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Thread composer — unified bar with scope logo */}
            <div style={{ flexShrink: 0, background: '#ffffff', padding: '12px 40px 24px' }}>
              <div style={{ width: '100%', maxWidth: 860, margin: '0 auto', position: 'relative' }}>
                {scopePopoverOpen && <ScopePopover onClose={() => setScopePopoverOpen(false)} />}
                <UnifiedBar
                  onScopeClick={() => setScopePopoverOpen(v => !v)}
                  scope={scope}
                  input={threadInput}
                  onInputChange={setThreadInput}
                  onKeyDown={handleThreadKeyDown as React.KeyboardEventHandler}
                  onSubmit={handleThreadSend}
                  inputRef={threadInputRef as React.Ref<HTMLInputElement & HTMLTextAreaElement>}
                  isThread
                  isTyping={state.isAgentTyping}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scope map overlay removed — scope button now opens popover menu */}

      <style>{`
        /* ─ Slide-up transition ─────────────────────────────────────────── */
        @keyframes popoverIn {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes threadSlideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ─ Aside AI step layout ─────────────────────────────────────── */
        .aside-step {
          display: grid;
          grid-template-columns: 28px 1fr;
          gap: 16px;
          position: relative;
          animation: stepFadeIn 320ms cubic-bezier(0.23,1,0.32,1) both;
        }
        @keyframes stepFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ─ Spine dot ───────────────────────────────────────────────────── */
        .aside-dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: #d1d5db;
          margin-top: 8px;
          justify-self: center;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
          transition: background 300ms ease;
        }
        /* Active dot: solid blue + pulsing halo */
        .aside-dot--active {
          background: #2563eb;
          box-shadow: 0 0 0 0 rgba(37,99,235,0.5);
          animation: dotPulse 1.8s ease-out infinite;
        }
        @keyframes dotPulse {
          0%   { box-shadow: 0 0 0 0   rgba(37,99,235,0.45); }
          70%  { box-shadow: 0 0 0 10px rgba(37,99,235,0);   }
          100% { box-shadow: 0 0 0 0   rgba(37,99,235,0);    }
        }

        /* ─ Scrollbar ────────────────────────────────────────────────── */
        .chat-scroll::-webkit-scrollbar { width: 6px; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 999px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }

        /* ─ Typing dots ───────────────────────────────────────────────── */
        .typing-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #9ca3af;
          animation: typingBounce 1.2s infinite; display: inline-block;
        }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%           { transform: translateY(-5px); }
        }

        /* ─ Sofi spinner ──────────────────────────────────────────────── */
        .sofi-spin { animation: spin 1.2s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
