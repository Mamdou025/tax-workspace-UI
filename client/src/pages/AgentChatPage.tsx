/**
 * AgentChatPage — Full-page AI-first chat thread
 * Design: InScope minimal — white background, greyscale, clean typography
 * Triggered from orbital stage bottom bar or any worksheet header
 * Persists thread in localStorage via AgentChatContext
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Send, Trash2, Sparkles, User } from 'lucide-react';
import { useAgentChat } from '@/contexts/AgentChatContext';
import { AgentToolCard } from '@/components/AgentCards';

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        style={{ background: '#f3f4f6', border: '1px solid #e5e7eb' }}
      >
        <Sparkles size={12} className="text-gray-400" />
      </div>
      <div
        className="px-3 py-2 rounded-2xl rounded-bl-sm flex items-center gap-1"
        style={{ background: '#f3f4f6', border: '1px solid #e5e7eb' }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full bg-gray-400"
          style={{ animation: 'bounce 1.2s infinite', animationDelay: '0ms' }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-gray-400"
          style={{ animation: 'bounce 1.2s infinite', animationDelay: '200ms' }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-gray-400"
          style={{ animation: 'bounce 1.2s infinite', animationDelay: '400ms' }}
        />
      </div>
    </div>
  );
}

// ─── Simple markdown renderer (no external dep) ───────────────────────────────

function SimpleMarkdown({ text }: { text: string }) {
  // Bold: **text**
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

// ─── AgentChatPage ────────────────────────────────────────────────────────────

export default function AgentChatPage() {
  const [, navigate] = useLocation();
  const { state, sendMessage, approveCard, cancelCard, clearThread } = useAgentChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, state.isAgentTyping]);

  // Focus input on mount
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

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className="flex flex-col"
      style={{ height: '100vh', background: '#ffffff', fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Top bar ── */}
      <div
        className="flex items-center gap-3 px-6 py-3 shrink-0"
        style={{ borderBottom: '1px solid #f3f4f6', background: '#ffffff' }}
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back</span>
        </button>
        <div className="w-px h-4 bg-gray-200" />
        {/* InScope wordmark */}
        <div className="flex items-center gap-1">
          <span style={{ fontSize: 13, fontWeight: 700, color: '#111827', letterSpacing: '-0.01em' }}>
            Sinaxe
          </span>
          <span style={{ fontSize: 9, color: '#9ca3af', marginTop: -4 }}>™</span>
          <span style={{ fontSize: 13, fontWeight: 300, color: '#6B21A8', marginLeft: 3, letterSpacing: '0.05em' }}>
            InScope
          </span>
        </div>
        <span className="text-gray-300 text-xs">·</span>
        <span className="text-xs text-gray-500">{state.client}</span>
        <span className="text-gray-300 text-xs">·</span>
        <span className="text-xs text-gray-400">AI Assistant</span>

        <div className="ml-auto flex items-center gap-2">
          {state.messages.length > 0 && (
            <button
              onClick={clearThread}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded hover:bg-gray-50"
            >
              <Trash2 size={11} />
              Clear thread
            </button>
          )}
        </div>
      </div>

      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6" style={{ background: '#fafafa' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>

          {/* Empty state */}
          {state.messages.length === 0 && (
            <div className="flex flex-col items-center justify-center" style={{ paddingTop: 80 }}>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ background: '#f3f4f6', border: '1px solid #e5e7eb' }}
              >
                <Sparkles size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-600 text-gray-700 mb-1">AI Assistant</p>
              <p className="text-xs text-gray-400 text-center" style={{ maxWidth: 320 }}>
                Ask me to run a workflow end-to-end. Try:
              </p>
              <div className="flex flex-col gap-2 mt-4">
                {[
                  'Calculate FAPI for Northstar',
                  'Prepare T1134 for Northstar',
                  'What is the FAPI amount for SAS Paris?',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="px-4 py-2 rounded-lg text-xs text-gray-600 border border-gray-200 hover:bg-white hover:border-gray-300 transition-all text-left"
                    style={{ background: '#ffffff' }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {state.messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 mb-5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-0.5"
                  style={{
                    background: isUser ? '#111827' : '#f3f4f6',
                    border: isUser ? 'none' : '1px solid #e5e7eb',
                  }}
                >
                  {isUser ? (
                    <User size={12} className="text-white" />
                  ) : (
                    <Sparkles size={12} className="text-gray-400" />
                  )}
                </div>

                {/* Bubble + card */}
                <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`} style={{ maxWidth: 520 }}>
                  {/* Text bubble (only if there's text) */}
                  {msg.text && (
                    <div
                      className="px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed"
                      style={{
                        background: isUser ? '#111827' : '#ffffff',
                        color: isUser ? '#ffffff' : '#374151',
                        border: isUser ? 'none' : '1px solid #e5e7eb',
                        borderBottomLeftRadius: !isUser ? 4 : undefined,
                        borderBottomRightRadius: isUser ? 4 : undefined,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      }}
                    >
                      <SimpleMarkdown text={msg.text} />
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

                  {/* Timestamp */}
                  <span className="text-gray-300 text-xs px-1">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {state.isAgentTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input bar ── */}
      <div
        className="shrink-0 px-6 py-4"
        style={{ borderTop: '1px solid #f3f4f6', background: '#ffffff' }}
      >
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div
            className="flex items-end gap-3 rounded-xl px-4 py-3"
            style={{ border: '1px solid #e5e7eb', background: '#ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about Northstar Inc. or type a command…"
              rows={1}
              className="flex-1 resize-none text-xs text-gray-700 placeholder-gray-400 outline-none bg-transparent leading-relaxed"
              style={{ maxHeight: 120, overflowY: 'auto' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || state.isAgentTyping}
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:opacity-30"
              style={{ background: input.trim() && !state.isAgentTyping ? '#111827' : '#e5e7eb' }}
            >
              <Send size={12} className={input.trim() && !state.isAgentTyping ? 'text-white' : 'text-gray-400'} />
            </button>
          </div>
          <p className="text-center text-gray-300 text-xs mt-2">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
