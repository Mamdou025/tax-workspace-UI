/**
 * AgentCards — Generative UI components rendered inside the agent chat thread
 * Design: InScope timeline — greyscale, status-only colour, no decorative colour
 */

import React, { useState } from 'react';
import {
  Check, X, AlertCircle, FileText, Mail, Loader2,
  ChevronDown, ChevronUp, Maximize2, Minimize2, Flag,
  Zap, ArrowRight,
} from 'lucide-react';
import type { ToolCard } from '@/contexts/AgentChatContext';
import { FapiCalculator } from '@/pages/FapiWorksheet';

// ─── Shared Primitives ────────────────────────────────────────────────────────

function CardShell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm ${className}`}
      style={{ maxWidth: 560 }}
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

export function ContextCheckCard({ card }: { card: ToolCard }) {
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
            <span className="font-500">{card.questions.length} questions attached</span>
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

// ─── ConfirmationGateCard ─────────────────────────────────────────────────────
// Shown before opening the FAPI worksheet — user must confirm to proceed

export function ConfirmationGateCard({
  card,
  onConfirm,
  onCancel,
}: {
  card: ToolCard;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const isDone = card.status === 'done';
  const isCancelled = card.status === 'cancelled';

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        maxWidth: 480,
        borderColor: '#ddd6fe',
        background: '#fbf8ff',
      }}
    >
      <div className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: '#ede9fe' }}
          >
            <Zap size={14} style={{ color: '#7c3aed' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-700 text-gray-800 mb-1">{card.confirmText}</div>
            <div className="text-xs text-gray-500 leading-relaxed">
              The worksheet will open inline in this thread. All values are pre-populated from the trial balance. You can review and edit before approving.
            </div>
          </div>
        </div>
      </div>

      {!isDone && !isCancelled && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 border-t"
          style={{ borderColor: '#ddd6fe', background: 'rgba(237,233,254,0.3)' }}
        >
          <button
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-600 text-white transition-all active:scale-95"
            style={{ background: '#7c3aed' }}
          >
            <ArrowRight size={11} />
            Go ahead — open worksheet
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-500 border transition-all active:scale-95"
            style={{ color: '#6b7280', borderColor: '#ddd6fe', background: 'transparent' }}
          >
            Not now
          </button>
        </div>
      )}

      {isDone && (
        <div
          className="flex items-center gap-2 px-4 py-2 border-t"
          style={{ borderColor: '#ddd6fe', background: 'rgba(237,233,254,0.2)' }}
        >
          <Check size={11} style={{ color: '#7c3aed' }} />
          <span className="text-xs" style={{ color: '#7c3aed' }}>Worksheet opened in thread</span>
        </div>
      )}
    </div>
  );
}

// ─── FapiWorksheetCard ────────────────────────────────────────────────────────
// Renders the real interactive FapiCalculator inline in the chat thread.
// Includes an expand-to-fullscreen overlay.

export function FapiWorksheetCard({
  card,
  onApprove,
  onFlag,
}: {
  card: ToolCard;
  onApprove: () => void;
  onFlag: () => void;
}) {
  const [affiliate, setAffiliate] = useState('SAS paris');
  const [year, setYear] = useState('2024');
  const [fullscreen, setFullscreen] = useState(false);
  const isDone = card.status === 'done';
  const isCancelled = card.status === 'cancelled';

  return (
    <>
      {/* ── Inline surface card ── */}
      <div
        className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-md"
        style={{ width: 700, maxWidth: '100%' }}
      >
        {/* Surface top bar — matches mockup style */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b border-gray-100"
          style={{ background: '#fbfdff' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: '#111827' }}
          >
            <FileText size={14} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-700 text-gray-800 leading-none">FAPI Worksheet</div>
            <div className="text-xs text-gray-400 mt-0.5">
              Opened by the agent · {affiliate} · {year}
              {isDone && <span className="ml-2 text-emerald-600 font-600">· Approved</span>}
              {isCancelled && <span className="ml-2 text-orange-600 font-600">· Flagged</span>}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {!isDone && !isCancelled && (
              <>
                <button
                  onClick={onApprove}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-600 text-white transition-all active:scale-95"
                  style={{ background: '#111827' }}
                >
                  <Check size={10} />
                  Approve
                </button>
                <button
                  onClick={onFlag}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-500 border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all active:scale-95"
                >
                  <Flag size={10} />
                  Flag
                </button>
              </>
            )}
            <button
              onClick={() => setFullscreen(true)}
              className="h-7 px-2.5 rounded-lg text-xs font-500 border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Maximize2 size={11} />
              Expand
            </button>
          </div>
        </div>

        {/* Inline calculator — fixed height, scrollable */}
        <div style={{ height: '58vh', overflowY: 'auto', overflowX: 'hidden' }}>
          <FapiCalculator
            affiliate={affiliate}
            year={year}
            onAffiliateChange={setAffiliate}
            onYearChange={setYear}
            compact
          />
        </div>
      </div>

      {/* ── Fullscreen overlay ── */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: '#ffffff' }}
        >
          {/* Fullscreen top banner */}
          <div
            className="flex items-center gap-3 px-4 py-2.5 shrink-0"
            style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}
          >
            <button
              onClick={() => setFullscreen(false)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
            >
              <Minimize2 size={13} />
              <span>Back to chat</span>
            </button>
            <div className="w-px h-4 bg-gray-200" />
            <span className="text-xs font-600 text-gray-700">FAPI Worksheet — {affiliate} · {year}</span>
            <span
              className="ml-2 text-xs px-2 py-0.5 rounded-full"
              style={{ background: '#fef3c7', color: '#92400e' }}
            >
              Embedded in chat thread
            </span>
            {!isDone && !isCancelled && (
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => { onApprove(); setFullscreen(false); }}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-600 text-white transition-all active:scale-95"
                  style={{ background: '#111827' }}
                >
                  <Check size={10} />
                  Approve & Continue
                </button>
                <button
                  onClick={() => { onFlag(); setFullscreen(false); }}
                  className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-500 border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all active:scale-95"
                >
                  <Flag size={10} />
                  Flag for Review
                </button>
              </div>
            )}
          </div>
          {/* Full-height calculator */}
          <div className="flex-1 overflow-hidden">
            <FapiCalculator
              affiliate={affiliate}
              year={year}
              onAffiliateChange={setAffiliate}
              onYearChange={setYear}
            />
          </div>
        </div>
      )}
    </>
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
    case 'confirmation_gate':
      return (
        <ConfirmationGateCard
          card={card}
          onConfirm={() => onApprove(messageId)}
          onCancel={() => onCancel(messageId)}
        />
      );
    case 'fapi_worksheet':
      return (
        <FapiWorksheetCard
          card={card}
          onApprove={() => onApprove(messageId)}
          onFlag={() => onCancel(messageId)}
        />
      );
    default:
      return null;
  }
}
