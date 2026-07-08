/**
 * AgentCards — Generative UI components rendered inside the agent chat thread
 * Design: InScope minimal — greyscale, status-only colour, no decorative colour
 */

import React, { useState } from 'react';
import { Check, X, AlertCircle, FileText, Mail, Loader2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import type { ToolCard } from '@/contexts/AgentChatContext';

// ─── Shared Primitives ────────────────────────────────────────────────────────

function CardShell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm ${className}`}
      style={{ maxWidth: 520 }}
    >
      {children}
    </div>
  );
}

function CardHeader({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
      <span className="text-gray-400">{icon}</span>
      <span className="text-xs font-700 text-gray-700 tracking-wide uppercase">{title}</span>
      {badge && <span className="ml-auto">{badge}</span>}
    </div>
  );
}

function StatusDot({ status }: { status: 'checking' | 'found' | 'missing' }) {
  if (status === 'checking') return <Loader2 size={13} className="text-gray-400 animate-spin" />;
  if (status === 'found') return <Check size={13} className="text-emerald-500" />;
  return <X size={13} className="text-red-400" />;
}

// ─── ContextCheckCard ─────────────────────────────────────────────────────────

export function ContextCheckCard({
  card,
}: {
  card: ToolCard;
}) {
  const items = card.items ?? [];
  const allDone = card.status === 'done';
  const missing = items.filter((i) => i.status === 'missing');

  return (
    <CardShell>
      <CardHeader
        icon={<FileText size={13} />}
        title="Context Check"
        badge={
          allDone ? (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: missing.length > 0 ? '#fef3c7' : '#d1fae5',
                color: missing.length > 0 ? '#92400e' : '#065f46',
              }}
            >
              {missing.length > 0 ? `${missing.length} missing` : 'All found'}
            </span>
          ) : (
            <span className="text-xs text-gray-400">Checking…</span>
          )
        }
      />
      <div className="px-4 py-3 flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <StatusDot status={item.status} />
            <span
              className="text-xs"
              style={{
                color: item.status === 'missing' ? '#ef4444' : item.status === 'found' ? '#374151' : '#9ca3af',
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

// ─── IRLDraftCard ─────────────────────────────────────────────────────────────

export function IRLDraftCard({
  card,
  onApprove,
  onCancel,
}: {
  card: ToolCard;
  onApprove: () => void;
  onCancel: () => void;
}) {
  const [showQuestions, setShowQuestions] = useState(false);
  const isDone = card.status === 'done';
  const isCancelled = card.status === 'cancelled';

  return (
    <CardShell>
      <CardHeader
        icon={<Mail size={13} />}
        title="Draft — Information Request Letter"
        badge={
          isDone ? (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#d1fae5', color: '#065f46' }}>
              Sent
            </span>
          ) : isCancelled ? (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#f3f4f6', color: '#6b7280' }}>
              Cancelled
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#92400e' }}>
              Awaiting approval
            </span>
          )
        }
      />

      {/* Fake Outlook compose window */}
      <div className="border-b border-gray-100" style={{ background: '#f8f9fa' }}>
        {/* Outlook top bar */}
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ background: '#0078d4', borderBottom: '1px solid #006cbe' }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255,255,255,0.3)' }} />
            <span className="text-white text-xs font-600">Outlook</span>
          </div>
          <span className="ml-auto text-white text-xs opacity-70">New Message</span>
        </div>
        {/* Email fields */}
        <div className="px-3 py-2 flex flex-col gap-1.5" style={{ background: '#fff' }}>
          <div className="flex items-center gap-2 border-b border-gray-100 pb-1.5">
            <span className="text-xs text-gray-400 w-10">To</span>
            <span className="text-xs text-gray-700">{card.to}</span>
          </div>
          <div className="flex items-center gap-2 border-b border-gray-100 pb-1.5">
            <span className="text-xs text-gray-400 w-10">Subject</span>
            <span className="text-xs text-gray-700 font-500">{card.subject}</span>
          </div>
          <div className="pt-1">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed" style={{ maxHeight: 140, overflow: 'auto' }}>
              {card.body}
            </pre>
          </div>
        </div>
      </div>

      {/* Questions accordion */}
      {card.questions && card.questions.length > 0 && (
        <div className="border-b border-gray-100">
          <button
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
            onClick={() => setShowQuestions((v) => !v)}
          >
            <span className="font-500">
              {card.questions.length} questions attached
            </span>
            {showQuestions ? <ChevronUp size={12} className="ml-auto" /> : <ChevronDown size={12} className="ml-auto" />}
          </button>
          {showQuestions && (
            <div className="px-4 pb-3 flex flex-col gap-2">
              {card.questions.map((q) => (
                <div key={q.id} className="flex gap-2">
                  <span className="text-xs text-gray-400 mt-0.5">·</span>
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wide">{q.category} · </span>
                    <span className="text-xs text-gray-600">{q.question}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {!isDone && !isCancelled && (
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            onClick={onApprove}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-600 text-white transition-all active:scale-95"
            style={{ background: '#111827' }}
          >
            <Check size={11} />
            Send via Outlook
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-500 text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
          >
            <X size={11} />
            Cancel
          </button>
        </div>
      )}
    </CardShell>
  );
}

// ─── MappingProgressCard ──────────────────────────────────────────────────────

export function MappingProgressCard({ card }: { card: ToolCard }) {
  const steps = card.steps ?? [];
  const done = card.status === 'done';

  return (
    <CardShell>
      <CardHeader
        icon={done ? <Check size={13} /> : <Loader2 size={13} className="animate-spin" />}
        title="Data Mapping"
        badge={
          done ? (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#d1fae5', color: '#065f46' }}>
              Complete
            </span>
          ) : (
            <span className="text-xs text-gray-400">Running…</span>
          )
        }
      />
      <div className="px-4 py-3 flex flex-col gap-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2.5">
            {step.done ? (
              <Check size={12} className="text-emerald-500 shrink-0" />
            ) : card.status === 'running' && steps.findIndex((s) => !s.done) === i ? (
              <Loader2 size={12} className="text-gray-400 animate-spin shrink-0" />
            ) : (
              <div className="w-3 h-3 rounded-full border border-gray-200 shrink-0" />
            )}
            <span className={`text-xs ${step.done ? 'text-gray-700' : 'text-gray-400'}`}>{step.label}</span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

// ─── FapiPreviewCard ──────────────────────────────────────────────────────────

export function FapiPreviewCard({
  card,
  onApprove,
  onFlag,
}: {
  card: ToolCard;
  onApprove: () => void;
  onFlag: () => void;
}) {
  const data = card.fapiData;
  const isDone = card.status === 'done';
  const isCancelled = card.status === 'cancelled';

  if (!data) return null;

  const fmt = (v: number | null) => {
    if (v === null) return '—';
    return new Intl.NumberFormat('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v);
  };

  return (
    <CardShell>
      <CardHeader
        icon={<FileText size={13} />}
        title={`FAPI Worksheet — ${data.affiliate}`}
        badge={
          isDone ? (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#d1fae5', color: '#065f46' }}>
              Approved
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#92400e' }}>
              Review required
            </span>
          )
        }
      />

      {/* Metadata row */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 bg-gray-50">
        <span className="text-xs text-gray-500">{data.affiliate}</span>
        <span className="text-gray-300">·</span>
        <span className="text-xs text-gray-500">{data.currency}</span>
        <span className="text-gray-300">·</span>
        <span className="text-xs text-gray-500">Year {data.year}</span>
      </div>

      {/* Calculation rows */}
      <div className="px-4 py-3">
        <table className="w-full">
          <tbody>
            {data.rows.map((row, i) => {
              const isResult = row.linked;
              const isNeg = row.value !== null && row.value < 0;
              return (
                <tr
                  key={i}
                  className={isResult ? 'border-t border-gray-200' : ''}
                  style={isResult ? { background: '#f9fafb' } : {}}
                >
                  <td className="py-1 pr-4">
                    <span className={`text-xs ${isResult ? 'font-700 text-gray-800' : 'text-gray-500'}`}>
                      {row.label}
                    </span>
                    {row.linked && (
                      <span
                        className="ml-1.5 text-xs px-1 py-0.5 rounded"
                        style={{ background: '#ede9fe', color: '#6d28d9', fontSize: 9 }}
                      >
                        LINKED
                      </span>
                    )}
                  </td>
                  <td className="py-1 text-right">
                    <span
                      className={`text-xs font-mono ${isResult ? 'font-700 text-gray-800' : isNeg ? 'text-red-500' : 'text-gray-700'}`}
                    >
                      {row.value !== null && isNeg ? `(${fmt(Math.abs(row.value))})` : fmt(row.value)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FAPI total highlight */}
      <div
        className="mx-4 mb-3 px-3 py-2 rounded flex items-center justify-between"
        style={{ background: '#f3f4f6', border: '1px solid #e5e7eb' }}
      >
        <span className="text-xs font-700 text-gray-700">FAPI Amount (CAD)</span>
        <span className="text-sm font-800 text-gray-900">{fmt(data.fapiAmount)}</span>
      </div>

      {/* Open full link */}
      <div className="px-4 pb-2">
        <a
          href="/fapi"
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ExternalLink size={10} />
          Open full FAPI worksheet
        </a>
      </div>

      {/* Actions */}
      {!isDone && !isCancelled && (
        <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100">
          <button
            onClick={onApprove}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-600 text-white transition-all active:scale-95"
            style={{ background: '#111827' }}
          >
            <Check size={11} />
            Approve
          </button>
          <button
            onClick={onFlag}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-500 text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
          >
            <AlertCircle size={11} />
            Flag for review
          </button>
        </div>
      )}
    </CardShell>
  );
}

// ─── Dispatcher — renders the right card based on type ────────────────────────

export function AgentToolCard({
  card,
  messageId,
  onApprove,
  onCancel,
}: {
  card: ToolCard;
  messageId: string;
  onApprove: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  switch (card.type) {
    case 'context_check':
      return <ContextCheckCard card={card} />;
    case 'irl_draft':
      return (
        <IRLDraftCard
          card={card}
          onApprove={() => onApprove(messageId)}
          onCancel={() => onCancel(messageId)}
        />
      );
    case 'mapping_progress':
      return <MappingProgressCard card={card} />;
    case 'fapi_preview':
      return (
        <FapiPreviewCard
          card={card}
          onApprove={() => onApprove(messageId)}
          onFlag={() => onCancel(messageId)}
        />
      );
    default:
      return null;
  }
}
