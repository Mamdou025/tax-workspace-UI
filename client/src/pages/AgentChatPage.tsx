/**
 * AgentChatPage — AI-first chat thread with event trail
 * Design: Vertical timeline line at x=33px, colored node dots, compact event cards,
 *         embedded worksheet surfaces — based on chatbot-embedded-event-trail-mockup.html
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft, Send, Trash2, Sparkles, LayoutGrid,
  CheckCircle2, AlertTriangle, Zap, Mail, Play,
  Flag, ChevronRight,
} from 'lucide-react';
import { useAgentChat } from '@/contexts/AgentChatContext';
import type { AgentMessage, EventKind } from '@/contexts/AgentChatContext';
import { AgentToolCard } from '@/components/AgentCards';

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="thread-item" style={{ marginBottom: 14 }}>
      <div className="node-dot node-dot--assistant" />
      <div style={{ paddingTop: 6 }}>
        <div
          className="flex items-center gap-1 px-3 py-2.5 rounded-2xl"
          style={{
            background: '#ffffff',
            border: '1px solid #e1e7ef',
            display: 'inline-flex',
            boxShadow: '0 2px 8px rgba(15,23,42,.04)',
          }}
        >
          <span className="typing-dot" style={{ animationDelay: '0ms' }} />
          <span className="typing-dot" style={{ animationDelay: '200ms' }} />
          <span className="typing-dot" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Simple markdown renderer ─────────────────────────────────────────────────

function SimpleMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

// ─── Event Card ───────────────────────────────────────────────────────────────

const EVENT_CONFIG: Record<EventKind, {
  icon: React.ReactNode;
  dotClass: string;
  cardClass: string;
  iconStyle: React.CSSProperties;
}> = {
  surface_opened: {
    icon: <LayoutGrid size={13} />,
    dotClass: 'node-dot--event',
    cardClass: 'event-card--opened',
    iconStyle: { background: '#e8f0ff', color: '#2563eb' },
  },
  task_run: {
    icon: <Play size={13} />,
    dotClass: 'node-dot--event',
    cardClass: 'event-card--ran',
    iconStyle: { background: '#e9fbf4', color: '#059669' },
  },
  warning: {
    icon: <AlertTriangle size={13} />,
    dotClass: 'node-dot--warning',
    cardClass: 'event-card--warning',
    iconStyle: { background: '#fff7e6', color: '#b45309' },
  },
  proposal: {
    icon: <Zap size={13} />,
    dotClass: 'node-dot--event',
    cardClass: 'event-card--approval',
    iconStyle: { background: '#f2eaff', color: '#7c3aed' },
  },
  irl_sent: {
    icon: <Mail size={13} />,
    dotClass: 'node-dot--event',
    cardClass: 'event-card--ran',
    iconStyle: { background: '#e9fbf4', color: '#059669' },
  },
  approved: {
    icon: <CheckCircle2 size={13} />,
    dotClass: 'node-dot--event',
    cardClass: 'event-card--ran',
    iconStyle: { background: '#e9fbf4', color: '#059669' },
  },
  flagged: {
    icon: <Flag size={13} />,
    dotClass: 'node-dot--warning',
    cardClass: 'event-card--warning',
    iconStyle: { background: '#fff7e6', color: '#b45309' },
  },
};

function EventCard({ msg }: { msg: AgentMessage }) {
  const kind = msg.eventKind ?? 'task_run';
  const cfg = EVENT_CONFIG[kind];
  const time = new Date(msg.timestamp).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="thread-item" style={{ marginBottom: 10 }}>
      <div className={`node-dot ${cfg.dotClass}`} />
      <div
        className="event-card"
        style={{ borderRadius: 14, minHeight: 44, padding: '9px 12px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div
            className="event-icon"
            style={{ ...cfg.iconStyle, width: 28, height: 28, borderRadius: 10, display: 'grid', placeItems: 'center', flexShrink: 0 }}
          >
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

// ─── AgentChatPage ────────────────────────────────────────────────────────────

export default function AgentChatPage() {
  const [, navigate] = useLocation();
  const { state, sendMessage, approveCard, cancelCard, clearThread } = useAgentChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, state.isAgentTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
    inputRef.current?.focus();
  }, [input, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });

  // Count events and warnings for header chips
  const eventCount = state.messages.filter((m) => m.role === 'event').length;
  const warningCount = state.messages.filter((m) => m.eventKind === 'warning' || m.eventKind === 'flagged').length;
  const hasFapiWorksheet = state.messages.some((m) => m.toolCard?.type === 'fapi_worksheet');

  return (
    <div
      className="flex flex-col"
      style={{ height: '100vh', background: '#ffffff', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
    >
      {/* ── Top bar ── */}
      <div
        className="flex items-center gap-3 px-5 shrink-0"
        style={{ height: 74, borderBottom: '1px solid #edf1f5', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)' }}
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back</span>
        </button>
        <div className="w-px h-4 bg-gray-200" />

        {/* Thread icon + title */}
        <div
          className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #111827, #4f46e5)' }}
        >
          <Sparkles size={15} className="text-white" />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1 }}>
            AI Agent Thread
          </div>
          <div style={{ fontSize: 12, color: '#7a8492', marginTop: 2 }}>
            {state.client} · FAPI Workflow
          </div>
        </div>

        {/* Status chips */}
        <div className="flex items-center gap-2 ml-4">
          {eventCount > 0 && (
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-600"
              style={{ background: '#e9fbf4', color: '#047857', border: '1px solid #b7f0d7' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {eventCount} event{eventCount !== 1 ? 's' : ''}
            </span>
          )}
          {warningCount > 0 && (
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-600"
              style={{ background: '#fff7e6', color: '#b45309', border: '1px solid #fde2a3' }}
            >
              <AlertTriangle size={10} />
              {warningCount} warning{warningCount !== 1 ? 's' : ''}
            </span>
          )}
          {hasFapiWorksheet && (
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-600"
              style={{ background: '#e8f0ff', color: '#1d4ed8', border: '1px solid #c7d9ff' }}
            >
              <LayoutGrid size={10} />
              Worksheet open
            </span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {state.messages.length > 0 && (
            <button
              onClick={clearThread}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-gray-50"
            >
              <Trash2 size={11} />
              Clear thread
            </button>
          )}
        </div>
      </div>

      {/* ── Thread scroll area with timeline line ── */}
      <div
        className="flex-1 overflow-y-auto chat-scroll"
        style={{
          // Vertical timeline line at x=33px from left edge of padding
          background: `
            linear-gradient(90deg, transparent 0 33px, #e2e8f0 33px 34px, transparent 34px 100%),
            #fbfdff
          `,
          padding: '24px 28px 120px 18px',
        }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          {/* Empty state */}
          {state.messages.length === 0 && (
            <div className="flex flex-col items-center justify-center" style={{ paddingTop: 80 }}>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'linear-gradient(135deg, #111827, #4f46e5)', boxShadow: '0 8px 24px rgba(79,70,229,0.25)' }}
              >
                <Sparkles size={24} className="text-white" />
              </div>
              <p style={{ fontSize: 17, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', marginBottom: 6 }}>
                AI Agent
              </p>
              <p style={{ fontSize: 13, color: '#7a8492', textAlign: 'center', maxWidth: 340, lineHeight: 1.5 }}>
                The chatbot is the workspace. Conversation, opened surfaces, task events, and approvals all live in this thread.
              </p>
              <div className="flex flex-col gap-2 mt-6">
                {[
                  'Calculate FAPI for Northstar',
                  'Prepare T1134 for Northstar',
                  'What is the FAPI amount for SAS Paris?',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs text-gray-600 border border-gray-200 hover:bg-white hover:border-gray-300 transition-all text-left"
                    style={{ background: 'rgba(255,255,255,0.8)' }}
                  >
                    <ChevronRight size={11} className="text-gray-400 shrink-0" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {state.messages.map((msg) => {
            // ── Event card (compact timeline event) ──
            if (msg.role === 'event') {
              return <EventCard key={msg.id} msg={msg} />;
            }

            const isUser = msg.role === 'user';

            // ── User message ──
            if (isUser) {
              return (
                <div key={msg.id} className="thread-item" style={{ marginBottom: 14 }}>
                  <div className="node-dot node-dot--user" />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div
                      className="bubble bubble--user"
                      style={{
                        background: '#111827',
                        color: '#fff',
                        border: '1px solid #111827',
                        borderRadius: 22,
                        borderBottomRightRadius: 6,
                        padding: '10px 14px',
                        maxWidth: '70%',
                        width: 'max-content',
                        boxShadow: '0 4px 14px rgba(17,24,39,.18)',
                      }}
                    >
                      <p style={{ margin: 0, color: '#fff', fontSize: 14, lineHeight: 1.5 }}>
                        {msg.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            // ── Agent message ──
            return (
              <div key={msg.id} className="thread-item" style={{ marginBottom: 16 }}>
                <div className="node-dot node-dot--assistant" />
                <div style={{ paddingTop: 4 }}>
                  {/* Meta line */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: '#8b95a4',
                      fontSize: 12,
                      fontWeight: 650,
                      marginBottom: 7,
                    }}
                  >
                    <span style={{ color: '#111827', fontWeight: 700 }}>Workflow Copilot</span>
                    <span
                      style={{ width: 4, height: 4, background: '#cbd5e1', borderRadius: '50%', display: 'inline-block' }}
                    />
                    <span>{formatTime(msg.timestamp)}</span>
                  </div>

                  {/* Text bubble (only if there's text) */}
                  {msg.text && (
                    <div
                      style={{
                        border: '1px solid #e1e7ef',
                        borderRadius: 22,
                        borderTopLeftRadius: 6,
                        background: '#ffffff',
                        padding: '12px 16px',
                        boxShadow: '0 4px 16px rgba(15,23,42,.05)',
                        marginBottom: msg.toolCard ? 10 : 0,
                        maxWidth: 560,
                      }}
                    >
                      <p style={{ margin: 0, color: '#374151', fontSize: 14, lineHeight: 1.55 }}>
                        <SimpleMarkdown text={msg.text} />
                      </p>
                    </div>
                  )}

                  {/* Tool card */}
                  {msg.toolCard && (
                    <AgentToolCard
                      card={msg.toolCard}
                      messageId={msg.id}
                      onApprove={approveCard}
                      onCancel={cancelCard}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {state.isAgentTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Composer (input bar) ── */}
      <div
        className="shrink-0"
        style={{
          position: 'relative',
          height: 104,
          borderTop: '1px solid #edf1f5',
          background: 'linear-gradient(180deg, rgba(251,253,255,0.72), #fff 28%)',
          padding: '16px 18px 18px 63px',
        }}
      >
        <div
          style={{
            height: 56,
            border: '1px solid #d7e2ec',
            background: '#fff',
            borderRadius: 20,
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto auto',
            alignItems: 'center',
            gap: 10,
            padding: '0 10px 0 14px',
            boxShadow: '0 12px 32px rgba(15,23,42,.08)',
          }}
        >
          {/* Plus button */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 12,
              background: '#f1f5f9',
              display: 'grid',
              placeItems: 'center',
              color: '#64748b',
              fontSize: 22,
              fontWeight: 300,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            +
          </div>

          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this workflow, open a surface, run a safe task, or approve a proposal…"
            rows={1}
            style={{
              resize: 'none',
              fontSize: 14,
              color: '#374151',
              background: 'transparent',
              outline: 'none',
              border: 'none',
              lineHeight: 1.5,
              maxHeight: 80,
              overflowY: 'auto',
              fontFamily: 'inherit',
            }}
          />

          {/* Act mode button */}
          <button
            style={{
              height: 30,
              borderRadius: 10,
              border: '1px solid #dce6ef',
              background: '#fff',
              padding: '0 10px',
              color: '#596274',
              fontWeight: 650,
              fontSize: 12,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Act mode
          </button>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || state.isAgentTyping}
            style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              background: input.trim() && !state.isAgentTyping ? '#111827' : '#e5e7eb',
              color: input.trim() && !state.isAgentTyping ? '#fff' : '#9ca3af',
              display: 'grid',
              placeItems: 'center',
              border: 'none',
              cursor: input.trim() && !state.isAgentTyping ? 'pointer' : 'default',
              transition: 'all 0.15s ease',
            }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      <style>{`
        /* Timeline thread items */
        .thread-item {
          display: grid;
          grid-template-columns: 32px 1fr;
          gap: 13px;
          position: relative;
        }

        /* Node dot — sits on the vertical line */
        .node-dot {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          margin-left: 24px;
          margin-top: 10px;
          transform: translateX(-50%);
          background: #fff;
          border: 2px solid #cbd5e1;
          display: grid;
          place-items: center;
          z-index: 1;
          flex-shrink: 0;
        }
        .node-dot::after {
          content: "";
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #94a3b8;
          display: block;
        }
        .node-dot--user::after { background: #111827; }
        .node-dot--assistant::after { background: #6B21A8; }
        .node-dot--event::after { background: #10b981; }
        .node-dot--warning::after { background: #f59e0b; }

        /* Event card */
        .event-card {
          border: 1px solid #dce6ef;
          background: rgba(255,255,255,0.85);
          border-radius: 16px;
          min-height: 44px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          box-shadow: 0 3px 10px rgba(15,23,42,.035);
        }

        /* Chat scroll custom scrollbar */
        .chat-scroll::-webkit-scrollbar { width: 10px; }
        .chat-scroll::-webkit-scrollbar-thumb {
          background: #d8e1eb;
          border: 3px solid #fbfdff;
          border-radius: 999px;
        }
        .chat-scroll::-webkit-scrollbar-track { background: #fbfdff; }

        /* Typing dots */
        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #94a3b8;
          animation: typingBounce 1.2s infinite;
          display: inline-block;
        }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
