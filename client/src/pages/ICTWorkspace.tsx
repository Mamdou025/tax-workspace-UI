/**
 * ICTWorkspace — AI-first orbital workspace for ICT practitioners
 *
 * Design:
 *  - Chatbot input sits at the exact center of the orbital stage (replaces the animated logo)
 *  - ICT workflow nodes orbit around it at the same radius as the existing OrbitalStage
 *  - Typing a prompt detects the relevant node → that node flies smoothly to the center
 *  - The chat thread expands from the center (scale + opacity) and fills the page
 *  - Back arrow collapses the thread and returns to the orbital stage
 *  - Same neumorphic style (#eaeaef background, purple/orange brand colours)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft, Send, Calculator, ClipboardCheck, FileText,
  Activity, BookOpen, Lock, ChevronDown, Trash2,
  LayoutGrid, AlertTriangle, CheckCircle2, Mail, Play, Flag,
} from 'lucide-react';
import { useAgentChat } from '@/contexts/AgentChatContext';
import type { AgentMessage, EventKind } from '@/contexts/AgentChatContext';
import { AgentToolCard } from '@/components/AgentCards';

const PURPLE = '#6B21A8';
const ORANGE = '#C2410C';
const NEU_BG = '#eaeaef';
const NEU_SHADOW_DARK = 'rgba(158,158,178,0.42)';
const NEU_SHADOW_LIGHT = 'rgba(255,255,255,0.86)';

// ─── ICT workflow nodes ───────────────────────────────────────────────────────

const ICT_NODES = [
  { id: 'calculate', label: 'Calculate', subtitle: 'FAPI, Surplus, EIFEL', icon: Calculator,      keywords: ['fapi', 'surplus', 'eifel', 'calculate', 'calc', 'computation'] },
  { id: 'comply',    label: 'Comply',    subtitle: 'T1134, T106, Pillar 2', icon: ClipboardCheck, keywords: ['t1134', 't106', 'pillar', 'comply', 'filing', 'return'] },
  { id: 'advise',    label: 'Advise',    subtitle: 'Memos & decks',          icon: FileText,       keywords: ['memo', 'deck', 'advise', 'advice', 'structure'] },
  { id: 'analyze',   label: 'Analyze',   subtitle: 'Dashboards',             icon: Activity,       keywords: ['analyze', 'dashboard', 'report', 'overview'] },
  { id: 'research',  label: 'Research',  subtitle: 'ITA, rulings, treaties', icon: BookOpen,       keywords: ['research', 'ita', 'ruling', 'treaty', 'provision'] },
  { id: 'request',   label: 'Request',   subtitle: 'IRL, Engagement',        icon: Mail,           keywords: ['irl', 'request', 'letter', 'engagement'] },
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

// ─── Orbital node (same neumorphic style as OrbitalStage) ─────────────────────

function OrbitalNode({
  label, subtitle, angle, radius,
  highlighted, onHover, onClick,
  staggerIndex = 0, exiting = false, dimmed = false,
}: {
  label: string; subtitle: string; angle: number; radius: number;
  highlighted: boolean; onHover: (v: string | null) => void; onClick: () => void;
  staggerIndex?: number; exiting?: boolean; dimmed?: boolean;
}) {
  const [isPressed, setIsPressed] = useState(false);
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  const transition = [
    'background 180ms ease-out',
    'box-shadow 180ms ease-out',
    'transform 180ms cubic-bezier(0.34,1.56,0.64,1)',
    'opacity 200ms ease-out',
  ].join(', ');

  const orbStyle: React.CSSProperties = isPressed
    ? {
        width: 110, height: 110, borderRadius: '50%', position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
        background: '#e2e2e9',
        boxShadow: [`inset 5px 5px 12px ${NEU_SHADOW_DARK}`, `inset -5px -5px 12px ${NEU_SHADOW_LIGHT}`].join(', '),
        border: 'none', transform: 'scale(0.96)', transition, opacity: dimmed ? 0.35 : 1,
      }
    : highlighted
    ? {
        width: 110, height: 110, borderRadius: '50%', position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
        background: NEU_BG,
        boxShadow: [`11px 11px 24px ${NEU_SHADOW_DARK}`, `-11px -11px 24px ${NEU_SHADOW_LIGHT}`, '0 0 0 2px rgba(168,139,250,0.30)'].join(', '),
        border: 'none', transform: 'scale(1.05)', transition, opacity: dimmed ? 0.35 : 1,
      }
    : {
        width: 110, height: 110, borderRadius: '50%', position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
        background: NEU_BG,
        boxShadow: [`8px 8px 18px ${NEU_SHADOW_DARK}`, `-8px -8px 18px ${NEU_SHADOW_LIGHT}`].join(', '),
        border: 'none', transform: 'scale(1)', transition, opacity: dimmed ? 0.35 : 1,
      };

  return (
    <div
      className="absolute"
      style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: 'translate(-50%, -50%)', zIndex: 2 }}
    >
      <div
        style={{
          animationName: exiting ? 'nodeExit' : 'nodeEnter',
          animationDuration: exiting ? '260ms' : '460ms',
          animationTimingFunction: exiting ? 'ease-in' : 'cubic-bezier(0.34,1.56,0.64,1)',
          animationFillMode: 'both',
          animationDelay: `${staggerIndex * (exiting ? 22 : 48)}ms`,
        }}
      >
        <button
          onClick={onClick}
          onMouseEnter={() => onHover(label)}
          onMouseLeave={() => { setIsPressed(false); onHover(null); }}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'block', transform: 'none' }}
        >
          <div style={orbStyle}>
            {/* LED dot */}
            <div style={{
              position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
              width: 6, height: 6, borderRadius: '50%',
              background: highlighted ? 'linear-gradient(135deg, #e879f9 0%, #a855f7 100%)' : 'linear-gradient(135deg, #d1d1da 0%, #c4c4cf 100%)',
              boxShadow: highlighted ? '0 0 5px rgba(168,85,247,0.55)' : 'inset 1px 1px 2px rgba(255,255,255,0.7), inset -1px -1px 2px rgba(158,158,178,0.3)',
              animation: 'ledPulse 3s ease-in-out infinite',
              transition: 'background 300ms ease-out, box-shadow 300ms ease-out',
            }} />
            <Lock size={17} style={{ color: highlighted ? '#9333ea' : '#a0a0b8', transition: 'color 200ms ease-out', marginTop: 8, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.2, textAlign: 'center', padding: '0 8px', color: highlighted ? '#6b21a8' : '#5c5c7a', transition: 'color 200ms ease-out', maxWidth: 94 }}>
              {label}
            </span>
            <span style={{ fontSize: 9, lineHeight: 1.2, textAlign: 'center', padding: '0 8px', color: highlighted ? '#a855f7' : '#9898b2', transition: 'color 200ms ease-out', maxWidth: 94 }}>
              {subtitle}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── Center chatbot input ─────────────────────────────────────────────────────

function CenterChatInput({
  value, onChange, onSend, onKeyDown, inputRef, active, onFocus, onBlur, client,
}: {
  value: string; onChange: (v: string) => void; onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  active: boolean; onFocus: () => void; onBlur: () => void; client: string;
}) {
  const SIZE = 200;

  return (
    <div
      style={{
        width: SIZE, height: SIZE, borderRadius: '50%', position: 'relative',
        background: NEU_BG,
        boxShadow: active
          ? [`inset 6px 6px 14px ${NEU_SHADOW_DARK}`, `inset -6px -6px 14px ${NEU_SHADOW_LIGHT}`, `0 0 0 2.5px rgba(107,33,168,0.22)`].join(', ')
          : [`10px 10px 22px ${NEU_SHADOW_DARK}`, `-10px -10px 22px ${NEU_SHADOW_LIGHT}`].join(', '),
        transition: 'box-shadow 220ms ease-out',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'text', zIndex: 10,
      }}
      onClick={() => { onFocus(); inputRef.current?.focus(); }}
    >
      {/* Animated dot ring (mini version of InScope logo) */}
      <svg
        width={SIZE} height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <style>{`
          @keyframes ict-cw  { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
          @keyframes ict-ccw { from { transform: rotate(0deg);   } to { transform: rotate(-360deg); } }
          .ict-cw  { animation: ict-cw  9s linear infinite; transform-origin: ${SIZE/2}px ${SIZE/2}px; }
          .ict-ccw { animation: ict-ccw 6s linear infinite; transform-origin: ${SIZE/2}px ${SIZE/2}px; }
        `}</style>
        {/* Purple outer ring */}
        <g className="ict-cw">
          {Array.from({ length: 36 }, (_, i) => {
            const a = (i / 36) * Math.PI * 2;
            const dur = 22; const begin = -(i / 36) * dur;
            const kt = "0;0.02;0.07;0.93;0.98;1";
            const ks = "0 0 1 1;0.42 0 1 1;0 0 1 1;0 0 0.58 1;0 0 1 1";
            return (
              <circle key={i} cx={SIZE/2 + 78 * Math.cos(a)} cy={SIZE/2 + 78 * Math.sin(a)} r={0} fill={PURPLE}>
                <animate attributeName="r" values="0;0;0.15;1.8;0;0" keyTimes={kt} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" calcMode="spline" keySplines={ks} />
                <animate attributeName="opacity" values="0;0;0.85;0.85;0;0" keyTimes={kt} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" calcMode="spline" keySplines={ks} />
              </circle>
            );
          })}
        </g>
        {/* Orange inner ring */}
        <g className="ict-ccw">
          {Array.from({ length: 22 }, (_, i) => {
            const a = (i / 22) * Math.PI * 2;
            const dur = 15; const begin = -((22 - i) / 22) * dur;
            const kt = "0;0.02;0.07;0.93;0.98;1";
            const ks = "0 0 1 1;0.42 0 1 1;0 0 1 1;0 0 0.58 1;0 0 1 1";
            return (
              <circle key={i} cx={SIZE/2 + 58 * Math.cos(a)} cy={SIZE/2 + 58 * Math.sin(a)} r={0} fill={ORANGE}>
                <animate attributeName="r" values="0;0;0.15;1.5;0;0" keyTimes={kt} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" calcMode="spline" keySplines={ks} />
                <animate attributeName="opacity" values="0;0;0.85;0.85;0;0" keyTimes={kt} dur={`${dur}s`} begin={`${begin}s`} repeatCount="indefinite" calcMode="spline" keySplines={ks} />
              </circle>
            );
          })}
        </g>
      </svg>

      {/* Input area */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', padding: '0 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        {active ? (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            placeholder="Type a workflow…"
            style={{
              width: '100%', textAlign: 'center', fontSize: 12, color: '#374151',
              background: 'transparent', border: 'none', outline: 'none',
              fontFamily: 'inherit', fontWeight: 500,
            }}
          />
        ) : (
          <>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#374151', textAlign: 'center', lineHeight: 1.3 }}>
              {client}
            </span>
            <span style={{ fontSize: 9, color: '#9CA3AF', textAlign: 'center', lineHeight: 1.3 }}>
              tap to prompt
            </span>
          </>
        )}

        {/* Send button — only when active and has value */}
        {active && value.trim() && (
          <button
            onMouseDown={(e) => { e.preventDefault(); onSend(); }}
            style={{
              width: 28, height: 28, borderRadius: '50%', background: '#111827',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)', transition: 'transform 120ms ease-out',
            }}
          >
            <Send size={11} color="#fff" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Flying node ghost ────────────────────────────────────────────────────────

function FlyingNodeGhost({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)',
        '--fly-dx': `${-x}px`,
        '--fly-dy': `${-y}px`,
        animation: 'flyToCenter 360ms cubic-bezier(0.4,0,0.2,1) both',
        pointerEvents: 'none',
        zIndex: 50,
      } as React.CSSProperties}
    >
      <div style={{
        width: 100, height: 100, borderRadius: '50%',
        background: NEU_BG,
        boxShadow: ['10px 10px 22px rgba(158,158,178,0.44)', '-10px -10px 22px rgba(255,255,255,0.88)', '0 0 0 2.5px rgba(168,85,247,0.32)'].join(', '),
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
      }}>
        <Lock size={15} style={{ color: '#9333ea' }} />
        <span style={{ fontSize: 10, fontWeight: 600, color: '#6b21a8', textAlign: 'center', maxWidth: 78, padding: '0 8px' }}>
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── Thread panel (expands from center) ──────────────────────────────────────

const EVENT_CONFIG: Record<EventKind, { icon: React.ReactNode; dotClass: string; iconStyle: React.CSSProperties }> = {
  surface_opened: { icon: <LayoutGrid size={13} />, dotClass: 'ict-dot--event',   iconStyle: { background: '#e8f0ff', color: '#2563eb' } },
  task_run:       { icon: <Play size={13} />,        dotClass: 'ict-dot--event',   iconStyle: { background: '#e9fbf4', color: '#059669' } },
  warning:        { icon: <AlertTriangle size={13} />, dotClass: 'ict-dot--warn', iconStyle: { background: '#fff7e6', color: '#b45309' } },
  proposal:       { icon: <CheckCircle2 size={13} />, dotClass: 'ict-dot--event',  iconStyle: { background: '#f2eaff', color: '#7c3aed' } },
  irl_sent:       { icon: <Mail size={13} />,         dotClass: 'ict-dot--event',  iconStyle: { background: '#e9fbf4', color: '#059669' } },
  approved:       { icon: <CheckCircle2 size={13} />, dotClass: 'ict-dot--event',  iconStyle: { background: '#e9fbf4', color: '#059669' } },
  flagged:        { icon: <Flag size={13} />,         dotClass: 'ict-dot--warn',   iconStyle: { background: '#fff7e6', color: '#b45309' } },
};

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

function ThreadPanel({
  messages, isTyping, onApprove, onCancel, messagesEndRef, onBack, onClear, client,
}: {
  messages: AgentMessage[];
  isTyping: boolean;
  onApprove: (id: string) => void;
  onCancel: (id: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onBack: () => void;
  onClear: () => void;
  client: string;
}) {
  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });

  const eventCount = messages.filter((m) => m.role === 'event').length;
  const warningCount = messages.filter((m) => m.eventKind === 'warning' || m.eventKind === 'flagged').length;

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 100,
        background: '#fbfdff',
        animation: 'threadExpand 380ms cubic-bezier(0.23,1,0.32,1) both',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Thread header */}
      <div style={{
        height: 70, display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px',
        borderBottom: '1px solid #edf1f5',
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, background: NEU_BG, border: 'none',
            borderRadius: 12, padding: '7px 12px', cursor: 'pointer', color: '#5c5c7a',
            fontSize: 12, fontWeight: 600,
            boxShadow: [`4px 4px 10px ${NEU_SHADOW_DARK}`, `-4px -4px 10px ${NEU_SHADOW_LIGHT}`].join(', '),
          }}
        >
          <ArrowLeft size={13} />
          <span>Orbital</span>
        </button>

        <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />

        {/* Mini animated logo */}
        <svg width={28} height={28} viewBox="0 0 28 28" style={{ flexShrink: 0 }}>
          <circle cx={14} cy={14} r={13} fill={NEU_BG} />
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return <circle key={i} cx={14 + 9 * Math.cos(a)} cy={14 + 9 * Math.sin(a)} r={1.2} fill={PURPLE} opacity={0.7} />;
          })}
        </svg>

        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1 }}>
            AI Agent Thread
          </div>
          <div style={{ fontSize: 11, color: '#7a8492', marginTop: 2 }}>{client} · ICT Workflow</div>
        </div>

        {/* Status chips */}
        <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
          {eventCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: '#e9fbf4', color: '#047857', border: '1px solid #b7f0d7' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              {eventCount} event{eventCount !== 1 ? 's' : ''}
            </span>
          )}
          {warningCount > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: '#fff7e6', color: '#b45309', border: '1px solid #fde2a3' }}>
              <AlertTriangle size={9} />
              {warningCount} warning{warningCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClear}
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9ca3af', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}
          >
            <Trash2 size={11} />
            Clear
          </button>
        )}
      </div>

      {/* Thread scroll with timeline line */}
      <div
        className="ict-chat-scroll"
        style={{
          flex: 1, overflowY: 'auto',
          background: `linear-gradient(90deg, transparent 0 33px, #e2e8f0 33px 34px, transparent 34px 100%), #fbfdff`,
          padding: '20px 24px 120px 18px',
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          {messages.length === 0 && (
            <div style={{ paddingTop: 60, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center' }}>Thread started. The agent is working…</p>
            </div>
          )}

          {messages.map((msg) => {
            if (msg.role === 'event') {
              const kind = msg.eventKind ?? 'task_run';
              const cfg = EVENT_CONFIG[kind];
              const time = new Date(msg.timestamp).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={msg.id} className="ict-thread-item" style={{ marginBottom: 10 }}>
                  <div className={`ict-node-dot ${cfg.dotClass}`} />
                  <div style={{ border: '1px solid #dce6ef', background: 'rgba(255,255,255,0.85)', borderRadius: 14, minHeight: 44, padding: '9px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, boxShadow: '0 3px 10px rgba(15,23,42,.035)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div style={{ ...cfg.iconStyle, width: 28, height: 28, borderRadius: 10, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{cfg.icon}</div>
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ fontSize: 13, display: 'block', color: '#273142' }}>{msg.eventTitle}</strong>
                        <span style={{ fontSize: 12, color: '#7a8492', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 560 }}>{msg.eventDetail}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#98a2b3', whiteSpace: 'nowrap', marginLeft: 12 }}>{time}</div>
                  </div>
                </div>
              );
            }

            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className="ict-thread-item" style={{ marginBottom: isUser ? 14 : 16 }}>
                <div className={`ict-node-dot ${isUser ? 'ict-dot--user' : 'ict-dot--assistant'}`} />
                <div style={{ paddingTop: isUser ? 0 : 4 }}>
                  {isUser ? (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ background: '#111827', color: '#fff', border: '1px solid #111827', borderRadius: 22, borderBottomRightRadius: 6, padding: '10px 14px', maxWidth: '70%', width: 'max-content', boxShadow: '0 4px 14px rgba(17,24,39,.18)', fontSize: 14, lineHeight: 1.5 }}>
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8b95a4', fontSize: 12, fontWeight: 650, marginBottom: 7 }}>
                        <span style={{ color: '#111827', fontWeight: 700 }}>Workflow Copilot</span>
                        <span style={{ width: 4, height: 4, background: '#cbd5e1', borderRadius: '50%', display: 'inline-block' }} />
                        <span>{formatTime(msg.timestamp)}</span>
                      </div>
                      {msg.text && (
                        <div style={{ border: '1px solid #e1e7ef', borderRadius: 22, borderTopLeftRadius: 6, background: '#ffffff', padding: '12px 16px', boxShadow: '0 4px 16px rgba(15,23,42,.05)', marginBottom: msg.toolCard ? 10 : 0, maxWidth: 560 }}>
                          <p style={{ margin: 0, color: '#374151', fontSize: 14, lineHeight: 1.55 }}>
                            <SimpleMarkdown text={msg.text} />
                          </p>
                        </div>
                      )}
                      {msg.toolCard && (
                        <AgentToolCard card={msg.toolCard} messageId={msg.id} onApprove={onApprove} onCancel={onCancel} />
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="ict-thread-item" style={{ marginBottom: 14 }}>
              <div className="ict-node-dot ict-dot--assistant" />
              <div style={{ paddingTop: 6 }}>
                <div style={{ background: '#ffffff', border: '1px solid #e1e7ef', display: 'inline-flex', alignItems: 'center', gap: 4, padding: '10px 14px', borderRadius: 22, borderTopLeftRadius: 6, boxShadow: '0 2px 8px rgba(15,23,42,.04)' }}>
                  {[0, 200, 400].map((delay) => (
                    <span key={delay} style={{ width: 6, height: 6, borderRadius: '50%', background: '#94a3b8', display: 'inline-block', animation: 'ictTyping 1.2s infinite', animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}

// ─── Main ICTWorkspace ────────────────────────────────────────────────────────

export default function ICTWorkspace() {
  const [, navigate] = useLocation();
  const { state, sendMessage, openChat, approveCard, cancelCard, clearThread } = useAgentChat();

  const [inputValue, setInputValue] = useState('');
  const [inputActive, setInputActive] = useState(false);
  const [threadOpen, setThreadOpen] = useState(false);
  const [flyingNode, setFlyingNode] = useState<{ id: string; x: number; y: number; label: string } | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const [stageSize, setStageSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const onResize = () => setStageSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const RADIUS = Math.min(300, Math.max(180, Math.min(stageSize.w, stageSize.h) * 0.26));

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, state.isAgentTyping]);

  // If thread already has messages, open it immediately on mount
  useEffect(() => {
    if (state.messages.length > 0) setThreadOpen(true);
  }, []);

  // Detect which node the prompt relates to
  const detectNode = useCallback((text: string) => {
    const lower = text.toLowerCase();
    for (const node of ICT_NODES) {
      if (node.keywords.some((kw) => lower.includes(kw))) return node;
    }
    return null;
  }, []);

  const handleSend = useCallback(() => {
    const prompt = inputValue.trim();
    if (!prompt) return;

    const matched = detectNode(prompt);

    if (matched) {
      // Compute node position
      const nodeIndex = ICT_NODES.indexOf(matched);
      const angle = (nodeIndex / ICT_NODES.length) * Math.PI * 2 - Math.PI / 2;
      const nx = Math.cos(angle) * RADIUS;
      const ny = Math.sin(angle) * RADIUS;

      setHighlightedNodeId(matched.id);
      setFlyingNode({ id: matched.id, x: nx, y: ny, label: matched.label });

      setTimeout(() => {
        setFlyingNode(null);
        setHighlightedNodeId(null);
        setInputValue('');
        setInputActive(false);
        openChat(prompt);
        setThreadOpen(true);
      }, 420);
    } else {
      setInputValue('');
      setInputActive(false);
      openChat(prompt);
      setThreadOpen(true);
    }
  }, [inputValue, detectNode, RADIUS, openChat]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
    if (e.key === 'Escape') { setInputValue(''); setInputActive(false); }
  };

  const handleNodeClick = (nodeId: string, nx: number, ny: number, label: string) => {
    setFlyingNode({ id: nodeId, x: nx, y: ny, label });
    setTimeout(() => {
      setFlyingNode(null);
      const prompt = `Open ${label} workflow`;
      openChat(prompt);
      setThreadOpen(true);
    }, 420);
  };

  const handleBack = () => {
    setThreadOpen(false);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div
      ref={stageRef}
      className="relative w-full h-screen overflow-hidden flex flex-col"
      style={{ background: NEU_BG }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => navigate('/')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4, color: '#9CA3AF' }}
              >
                <ArrowLeft size={14} />
              </button>
              <span style={{ fontSize: 32, fontWeight: 700, color: '#1F2937', lineHeight: 1.1, letterSpacing: '-0.02em' }}>{greeting}, Sophia</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 13, color: '#9CA3AF' }}>ICT Workspace</span>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>·</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#6B21A8', background: 'rgba(107,33,168,0.08)', padding: '2px 8px', borderRadius: 999 }}>
                {state.client}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/builder')}
            style={{ background: 'transparent', border: '1px solid #E5E7EB', borderRadius: 10, padding: '8px 14px', color: '#6B7280', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}
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

      {/* ── Orbital stage ── */}
      <div className="flex-1 relative flex items-center justify-center">
        <DottedOrbitRing radius={RADIUS} />

        {/* Center chatbot input */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <CenterChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            onKeyDown={handleKeyDown}
            inputRef={inputRef}
            active={inputActive}
            onFocus={() => setInputActive(true)}
            onBlur={() => { if (!inputValue) setInputActive(false); }}
            client={state.client}
          />
        </div>

        {/* Orbital nodes */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: flyingNode ? 'none' : 'auto' }}>
          {ICT_NODES.map((node, i) => {
            const angle = (i / ICT_NODES.length) * Math.PI * 2 - Math.PI / 2;
            const nx = Math.cos(angle) * RADIUS;
            const ny = Math.sin(angle) * RADIUS;
            return (
              <OrbitalNode
                key={node.id}
                label={node.label}
                subtitle={node.subtitle}
                angle={angle}
                radius={RADIUS}
                highlighted={hoveredNode === node.label || highlightedNodeId === node.id}
                onHover={setHoveredNode}
                onClick={() => handleNodeClick(node.id, nx, ny, node.label)}
                staggerIndex={i}
                dimmed={!!flyingNode && flyingNode.id !== node.id}
              />
            );
          })}
        </div>

        {/* Flying node ghost */}
        {flyingNode && (
          <FlyingNodeGhost x={flyingNode.x} y={flyingNode.y} label={flyingNode.label} />
        )}
      </div>

      {/* ── Thread panel — expands from center ── */}
      {threadOpen && (
        <ThreadPanel
          messages={state.messages}
          isTyping={state.isAgentTyping}
          onApprove={approveCard}
          onCancel={cancelCard}
          messagesEndRef={messagesEndRef}
          onBack={handleBack}
          onClear={() => { clearThread(); setThreadOpen(false); }}
          client={state.client}
        />
      )}

      <style>{`
        @keyframes nodeEnter {
          from { opacity: 0; transform: scale(0.7) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes nodeExit {
          from { opacity: 1; transform: scale(1); }
          to   { opacity: 0; transform: scale(0.8); }
        }
        @keyframes flyToCenter {
          from { transform: translate(-50%, -50%); }
          to   { transform: translate(calc(-50% + var(--fly-dx)), calc(-50% + var(--fly-dy))); }
        }
        @keyframes threadExpand {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes ledPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes ictTyping {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* Timeline thread items */
        .ict-thread-item {
          display: grid;
          grid-template-columns: 32px 1fr;
          gap: 13px;
          position: relative;
        }
        .ict-node-dot {
          width: 18px; height: 18px; border-radius: 50%;
          margin-left: 24px; margin-top: 10px; transform: translateX(-50%);
          background: #fff; border: 2px solid #cbd5e1;
          display: grid; place-items: center; z-index: 1;
        }
        .ict-node-dot::after {
          content: ""; width: 7px; height: 7px; border-radius: 50%;
          background: #94a3b8; display: block;
        }
        .ict-dot--user::after      { background: #111827; }
        .ict-dot--assistant::after { background: #6B21A8; }
        .ict-dot--event::after     { background: #10b981; }
        .ict-dot--warn::after      { background: #f59e0b; }

        .ict-chat-scroll::-webkit-scrollbar { width: 10px; }
        .ict-chat-scroll::-webkit-scrollbar-thumb { background: #d8e1eb; border: 3px solid #fbfdff; border-radius: 999px; }
        .ict-chat-scroll::-webkit-scrollbar-track { background: #fbfdff; }
      `}</style>
    </div>
  );
}
