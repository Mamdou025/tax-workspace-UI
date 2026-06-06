// ─── T1134 Workpaper ──────────────────────────────────────────────────────────
// Design: Same shell as FapiWorksheet — dark navy top bar, left worksheet area,
// right panel slides in from right, animated InScope logo bottom-center/anchored.
// Part I = single-column summary form for Northstar as reporting entity.
// Part II = frozen-left scrollable grid, 20 FA columns, all CRA sections.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import {
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Download, Upload, FileText, Mail, Eye, PenLine, Send,
  MessageSquare, Users, ClipboardCheck, X, AlertTriangle,
  Link2, Info, Plus, Check, Building2, Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  FOREIGN_AFFILIATES, COUNTRY_GROUPS, PART_I_SUMMARY, SOPHIA_IRL_QUESTIONS,
  type ForeignAffiliate, type YesNo,
} from '@/lib/t1134Data';

// ─── Brand colours ────────────────────────────────────────────────────────────
const PURPLE = '#7C3AED';
const ORANGE = '#F97316';

// ─── Milestone definitions ────────────────────────────────────────────────────
type MilestoneId = 'sophia' | 'client-context' | 'upload' | 'irl' | 'validate' | 'review' | 'signoff' | 'file';
const MILESTONES: { id: MilestoneId; label: string; icon: React.ComponentType<{ size?: number; className?: string; color?: string }> }[] = [
  { id: 'sophia',         label: 'Sophia',         icon: MessageSquare },
  { id: 'client-context', label: 'Client',          icon: Users },
  { id: 'upload',         label: 'Upload',          icon: Upload },
  { id: 'irl',            label: 'IRL',             icon: Mail },
  { id: 'validate',       label: 'Validate',        icon: ClipboardCheck },
  { id: 'review',         label: 'Review',          icon: Eye },
  { id: 'signoff',        label: 'Sign-off',        icon: PenLine },
  { id: 'file',           label: 'File',            icon: Send },
];

// ─── Animated InScope Logo ────────────────────────────────────────────────────
function MiniDotRing({ size = 120, onClick }: { size?: number; onClick?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
        const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const c = ctx;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    c.scale(dpr, dpr);
    const cx = size / 2, cy = size / 2;
    const OUTER_R = size * 0.42, INNER_R = size * 0.32;
    const OUTER_N = 52, INNER_N = 36;
    const FADE = 8;
    let t = 0;
    function drawRing(
      r: number, n: number, maxDot: number, color: string,
      offset: number, direction: 1 | -1, gapFrac: number
    ) {
      const gapDots = Math.round(n * gapFrac);
      for (let i = 0; i < n; i++) {
        const angle = ((i / n) * Math.PI * 2) + offset * direction;
        const posInArc = i < n - gapDots ? i : -1;
        if (posInArc < 0) continue;
        const arcLen = n - gapDots;
        let scale = 1;
        if (posInArc < FADE) scale = Math.pow(posInArc / FADE, 0.5);
        else if (posInArc > arcLen - 1 - FADE) scale = Math.pow((arcLen - 1 - posInArc) / FADE, 0.5);
        const dotR = maxDot * scale;
        const opacity = 0.25 + 0.7 * scale;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        c.beginPath();
        c.arc(x, y, dotR, 0, Math.PI * 2);
        c.fillStyle = color + Math.round(opacity * 255).toString(16).padStart(2, '0');
        c.fill();
      }
    }
    function frame() {
      c.clearRect(0, 0, size, size);
      drawRing(OUTER_R, OUTER_N, 1.4, PURPLE, t, 1, 0.18);
      drawRing(INNER_R, INNER_N, 1.2, ORANGE, t * 1.4, -1, 0.22);
      t += 0.012;
      rafRef.current = requestAnimationFrame(frame);
    }
    frame();
    return () => cancelAnimationFrame(rafRef.current);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, cursor: 'pointer' }}
      onClick={onClick}
    />
  );
}

// ─── Orbital Milestone Menu ───────────────────────────────────────────────────
function OrbitalMilestoneMenu({
  active, onSelect, onClose,
}: {
  active: MilestoneId | null;
  onSelect: (id: MilestoneId) => void;
  onClose: () => void;
}) {
  const RADIUS = 175;
  const N = MILESTONES.length;
  return (
    <div
      style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: RADIUS * 2 + 80, height: RADIUS + 80, pointerEvents: 'none' }}
    >
      {MILESTONES.map((m, i) => {
        const angle = Math.PI + (i / (N - 1)) * Math.PI;
        const x = RADIUS + Math.cos(angle) * RADIUS;
        const y = RADIUS - Math.sin(angle) * RADIUS;
        const Icon = m.icon;
        const isActive = active === m.id;
        return (
          <button
            key={m.id}
            onClick={() => { onSelect(m.id); }}
            style={{
              position: 'absolute',
              left: x - 28,
              top: y - 28,
              width: 56,
              height: 56,
              pointerEvents: 'auto',
              borderRadius: '50%',
              border: isActive ? `2px solid ${PURPLE}` : '1.5px solid #e5e7eb',
              background: isActive ? '#f5f3ff' : '#fff',
              boxShadow: isActive ? `0 0 0 3px ${PURPLE}22` : '0 2px 8px rgba(0,0,0,0.08)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 2, cursor: 'pointer',
              transition: 'all 0.18s cubic-bezier(0.23,1,0.32,1)',
            }}
          >
            <Icon size={16} color={isActive ? PURPLE : '#6b7280'} />
            <span style={{ fontSize: 9, fontWeight: 700, color: isActive ? PURPLE : '#9ca3af', letterSpacing: '0.04em' }}>
              {m.label.toUpperCase()}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Yes/No Toggle ────────────────────────────────────────────────────────────
function YesNoToggle({ value, onChange, disabled }: { value: YesNo; onChange?: (v: YesNo) => void; disabled?: boolean }) {
  if (disabled || !onChange) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '1px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 700,
        background: value === 'Yes' ? '#dcfce7' : value === 'No' ? '#f3f4f6' : '#fef3c7',
        color: value === 'Yes' ? '#166534' : value === 'No' ? '#6b7280' : '#92400e',
      }}>
        {value || '—'}
      </span>
    );
  }
  return (
    <button
      onClick={() => onChange(value === 'Yes' ? 'No' : 'Yes')}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '1px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 700, cursor: 'pointer',
        background: value === 'Yes' ? '#dcfce7' : value === 'No' ? '#f3f4f6' : '#fef3c7',
        color: value === 'Yes' ? '#166534' : value === 'No' ? '#6b7280' : '#92400e',
        border: 'none', transition: 'all 0.15s',
      }}
    >
      {value || '—'}
    </button>
  );
}

// ─── Currency formatter ───────────────────────────────────────────────────────
function fmtCAD(n: number) {
  if (n === 0) return '—';
  return '$' + n.toLocaleString('en-CA');
}
function fmtPct(n: number) {
  if (n === 0) return '—';
  return n + '%';
}

// ─── Linked cell ─────────────────────────────────────────────────────────────
function LinkedCell({ value, currency = '' }: { value: number; currency?: string }) {
  if (value === 0) return <span style={{ color: '#d1d5db' }}>—</span>;
  return (
    <span style={{ color: PURPLE, display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
      <Link2 size={10} />
      {currency && <span style={{ fontSize: 10, opacity: 0.7 }}>{currency}</span>}
      {fmtCAD(value)}
    </span>
  );
}

// ─── Flag cell ────────────────────────────────────────────────────────────────
function FlagCell({ flags }: { flags: string[] }) {
  if (!flags.length) return null;
  return (
    <span title={flags.join('\n')} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: '#f59e0b', fontSize: 11 }}>
      <AlertTriangle size={11} />
      {flags.length}
    </span>
  );
}

// ─── Section accordion ───────────────────────────────────────────────────────
function SectionAccordion({
  title, subtitle, defaultOpen = false, children,
}: {
  title: string; subtitle?: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid #f3f4f6' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 16px', background: '#fafafa', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 800, color: '#374151', letterSpacing: '0.06em', textTransform: 'uppercase', flex: 1 }}>
          {title}
          {subtitle && <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 8, textTransform: 'none', letterSpacing: 0 }}>{subtitle}</span>}
        </span>
        {open ? <ChevronUp size={14} color="#9ca3af" /> : <ChevronDown size={14} color="#9ca3af" />}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

// ─── Grid Row ─────────────────────────────────────────────────────────────────
type CellRenderer = (fa: ForeignAffiliate) => React.ReactNode;

function GridRow({
  label, tooltip, cfaOnly, render, fas,
}: {
  label: string; tooltip?: string; cfaOnly?: boolean;
  render: CellRenderer; fas: ForeignAffiliate[];
}) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #f9fafb', minHeight: 32 }}>
      {/* Frozen label column */}
      <div style={{
        minWidth: 220, maxWidth: 220, padding: '6px 12px', fontSize: 12, color: '#4b5563',
        borderRight: '1px solid #e5e7eb', background: '#fff', display: 'flex', alignItems: 'center', gap: 6,
        position: 'sticky', left: 0, zIndex: 2,
      }}>
        <span style={{ flex: 1 }}>{label}</span>
        {cfaOnly && <span style={{ fontSize: 10, color: '#a78bfa', fontWeight: 600 }}>CFA</span>}
        {tooltip && <span title={tooltip} style={{ cursor: 'help', flexShrink: 0, display: 'inline-flex' }}><Info size={11} color="#d1d5db" /></span>}
      </div>
      {/* FA cells */}
      {fas.map(fa => (
        <div
          key={fa.id}
          style={{
            minWidth: 140, maxWidth: 140, padding: '6px 10px', fontSize: 12,
            borderRight: '1px solid #f3f4f6', display: 'flex', alignItems: 'center',
            background: cfaOnly && fa.tier === 'NCFA' ? '#fafafa' : '#fff',
            color: cfaOnly && fa.tier === 'NCFA' ? '#d1d5db' : undefined,
          }}
        >
          {cfaOnly && fa.tier === 'NCFA' ? <span style={{ fontSize: 10, color: '#d1d5db' }}>N/A</span> : render(fa)}
        </div>
      ))}
    </div>
  );
}

// ─── Right Panel Content ──────────────────────────────────────────────────────
function RightPanelContent({
  milestone, onClose,
}: {
  milestone: MilestoneId; onClose: () => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const titles: Record<MilestoneId, string> = {
    sophia: 'Sophia — AI Assistant',
    'client-context': 'Client Context',
    upload: 'Upload Documents',
    irl: 'Information Request Letter',
    validate: 'Validation Checklist',
    review: 'Review',
    signoff: 'Sign-off',
    file: 'File with CRA',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Panel header */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '14px 16px',
        borderBottom: '1px solid #e5e7eb', background: '#fff', flexShrink: 0,
      }}>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: '#111827' }}>{titles[milestone]}</span>
        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
          <X size={16} />
        </button>
      </div>

      {/* Panel body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {milestone === 'sophia' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#f5f3ff', borderRadius: 8, padding: 12, fontSize: 12, color: '#4b5563', lineHeight: 1.6 }}>
              <strong style={{ color: PURPLE }}>Sophia</strong> has analysed the 2023 T1134 and identified the following items requiring attention for the 2024 filing:
            </div>
            {[
              { fa: 'GmbH Berlin', msg: 'ACB of common shares increased. Confirm nature of capital contribution and update Section 1B.' },
              { fa: 'Inc Delaware', msg: 'Upstream loan arrangement under ss.90(6) detected. Confirm loan balance and terms for Section 3A.4.' },
              { fa: 'Pte Singapore IV', msg: 'First-time filing. Full review required — all fields are blank and financial statements are not available.' },
              { fa: 'AG Frankfurt', msg: 'Financial statements not available. IRL has been auto-generated to request them.' },
              { fa: 'SAS Paris', msg: 'FAPI > $0. Confirm FAPIT entry and participating percentage in Section 3 (iii).' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, fontSize: 12 }}>
                <div style={{ fontWeight: 700, color: '#111827', marginBottom: 4 }}>{item.fa}</div>
                <div style={{ color: '#6b7280', lineHeight: 1.5 }}>{item.msg}</div>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <input
                placeholder="Ask Sophia about this T1134…"
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb',
                  fontSize: 12, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        )}

        {milestone === 'client-context' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: '#f9fafb', borderRadius: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1e1b4b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>Northstar Inc.</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>BN: 123456789 · FY Dec 31, 2024</div>
              </div>
            </div>
            {[
              { label: 'Filing Deadline', value: 'October 31, 2025', status: 'ok' },
              { label: 'Total FAs', value: '20 (16 CFA, 4 NCFA)', status: 'ok' },
              { label: 'Countries', value: '5 (FR, DE, GB, US, SG)', status: 'ok' },
              { label: 'Total FAPI', value: '$4,131,000 CAD', status: 'warn' },
              { label: 'Supplements Complete', value: '12 / 20', status: 'warn' },
              { label: 'Flags Outstanding', value: '6 items', status: 'error' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: 12 }}>
                <span style={{ color: '#6b7280' }}>{row.label}</span>
                <span style={{ fontWeight: 700, color: row.status === 'error' ? '#ef4444' : row.status === 'warn' ? '#f59e0b' : '#111827' }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {milestone === 'upload' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              border: '2px dashed #e5e7eb', borderRadius: 10, padding: 24, textAlign: 'center',
              background: '#fafafa', cursor: 'pointer',
            }}>
              <Upload size={24} color="#d1d5db" className="mx-auto mb-2" />
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Drop files here</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Prior year T1134, financial statements, org charts</div>
            </div>
            {[
              { name: 'T1134_2023_Northstar.pdf', size: '2.4 MB', status: 'done' },
              { name: 'OrgChart_2024.pdf', size: '1.1 MB', status: 'done' },
              { name: 'FS_SASParis_2024.xlsx', size: '890 KB', status: 'pending' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#f9fafb', borderRadius: 8, fontSize: 12 }}>
                <FileText size={14} color={f.status === 'done' ? '#10b981' : '#f59e0b'} />
                <span style={{ flex: 1, color: '#374151' }}>{f.name}</span>
                <span style={{ color: '#9ca3af' }}>{f.size}</span>
                {f.status === 'done' ? <Check size={12} color="#10b981" /> : <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700 }}>PENDING</span>}
              </div>
            ))}
          </div>
        )}

        {milestone === 'irl' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: '#6b7280', flex: 1 }}>Sophia generated {SOPHIA_IRL_QUESTIONS.flatMap(g => g.questions).length} questions</span>
              <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 9999, fontWeight: 700 }}>
                {SOPHIA_IRL_QUESTIONS.flatMap(g => g.questions).filter(q => q.priority === 'high').length} high priority
              </span>
            </div>
            {SOPHIA_IRL_QUESTIONS.map((group, gi) => (
              <div key={gi}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, marginTop: gi > 0 ? 8 : 0 }}>
                  {group.category}
                </div>
                {group.questions.map(q => (
                  <div key={q.id} style={{
                    padding: '8px 10px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 6, fontSize: 12,
                    borderLeft: `3px solid ${q.priority === 'high' ? '#ef4444' : q.priority === 'medium' ? '#f59e0b' : '#d1d5db'}`,
                  }}>
                    {q.fa !== 'all' && (
                      <div style={{ fontSize: 10, fontWeight: 700, color: PURPLE, marginBottom: 3 }}>
                        {FOREIGN_AFFILIATES.find(f => f.id === q.fa)?.shortName}
                      </div>
                    )}
                    <div style={{ color: '#374151', lineHeight: 1.5 }}>{q.text}</div>
                  </div>
                ))}
              </div>
            ))}
            <button style={{
              marginTop: 8, padding: '10px 0', background: PURPLE, color: '#fff', border: 'none', borderRadius: 8,
              fontWeight: 700, fontSize: 13, cursor: 'pointer', width: '100%',
            }}>
              Send IRL to Client
            </button>
          </div>
        )}

        {milestone === 'validate' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
              Running validation across all 20 supplements…
            </div>
            {[
              { label: 'All required fields completed', status: 'fail', count: '8 missing' },
              { label: 'FAPI > 0 → participating % filled', status: 'fail', count: '1 issue' },
              { label: 'Dividend received → surplus type specified', status: 'pass', count: '' },
              { label: 'CFA-only fields blank for NCFAs', status: 'pass', count: '' },
              { label: 'T106 cross-reference — loans flagged', status: 'warn', count: '3 items' },
              { label: 'Financial statements included for CFAs', status: 'fail', count: '2 missing' },
              { label: 'First-time filing — all sections complete', status: 'fail', count: '1 incomplete' },
              { label: 'Upstream loan rules confirmed', status: 'warn', count: '1 item' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                background: item.status === 'fail' ? '#fef2f2' : item.status === 'warn' ? '#fffbeb' : '#f0fdf4',
                borderRadius: 8, fontSize: 12,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: item.status === 'fail' ? '#ef4444' : item.status === 'warn' ? '#f59e0b' : '#10b981' }} />
                <span style={{ flex: 1, color: '#374151' }}>{item.label}</span>
                {item.count && <span style={{ fontSize: 11, fontWeight: 700, color: item.status === 'fail' ? '#ef4444' : '#f59e0b' }}>{item.count}</span>}
              </div>
            ))}
          </div>
        )}

        {milestone === 'review' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Manager review comments</div>
            {[
              { reviewer: 'M. Chen', comment: 'Please confirm the FAPI breakdown for GmbH Berlin — the interest vs. indebtedness split needs to be verified against the loan agreement.', date: 'Jun 3, 2025', resolved: false },
              { reviewer: 'J. Park', comment: 'SAS Paris dividend — confirm Reg. 5900(2) election was not required given the surplus composition.', date: 'Jun 4, 2025', resolved: true },
            ].map((c, i) => (
              <div key={i} style={{ padding: 10, background: c.resolved ? '#f0fdf4' : '#fff', border: `1px solid ${c.resolved ? '#bbf7d0' : '#e5e7eb'}`, borderRadius: 8, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: '#111827' }}>{c.reviewer}</span>
                  <span style={{ color: '#9ca3af', fontSize: 11 }}>{c.date}</span>
                </div>
                <div style={{ color: '#4b5563', lineHeight: 1.5 }}>{c.comment}</div>
                {c.resolved && <div style={{ marginTop: 6, fontSize: 11, color: '#10b981', fontWeight: 700 }}>✓ Resolved</div>}
              </div>
            ))}
            <button style={{ padding: '8px 0', background: '#f3f4f6', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#374151', cursor: 'pointer', width: '100%' }}>
              + Add Comment
            </button>
          </div>
        )}

        {milestone === 'signoff' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Digital sign-off required before filing</div>
            {[
              { role: 'Preparer', name: 'Sarah Thompson', date: 'Jun 5, 2025', signed: true },
              { role: 'Reviewer', name: 'Michael Chen', date: '', signed: false },
              { role: 'Partner', name: 'James Park', date: '', signed: false },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: s.signed ? '#f0fdf4' : '#fafafa', borderRadius: 8, border: `1px solid ${s.signed ? '#bbf7d0' : '#e5e7eb'}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{s.role}</div>
                </div>
                {s.signed ? (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>✓ Signed</div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>{s.date}</div>
                  </div>
                ) : (
                  <button style={{ padding: '6px 12px', background: PURPLE, color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    Sign
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {milestone === 'file' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 12, background: '#fef3c7', borderRadius: 8, fontSize: 12, color: '#92400e' }}>
              <strong>2 sign-offs pending</strong> — complete sign-off before filing.
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 4 }}>Export Options</div>
            <button
              onClick={() => {
                // Generate iFirm CSV
                const headers = ['FA_Name', 'Country', 'Tier', 'TIN', 'DirectOwnershipPct', 'EquityPctEnd', 'FAPI', 'ExemptSurplusDividend', 'TaxYearFrom', 'TaxYearTo'];
                const rows = FOREIGN_AFFILIATES.map(fa => [
                  fa.legalName, fa.country, fa.tier, fa.tin,
                  fa.directOwnershipPct, fa.equityPctEnd,
                  fa.fapiAmount, fa.exemptSurplusDividend,
                  fa.taxYearFrom, fa.taxYearTo,
                ].join(','));
                const csv = [headers.join(','), ...rows].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'T1134_Northstar_2024_iFirm.csv'; a.click();
                URL.revokeObjectURL(url);
              }}
              style={{ padding: '10px 0', background: PURPLE, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Download size={14} /> Download iFirm CSV
            </button>
            <button style={{ padding: '10px 0', background: '#f3f4f6', color: '#9ca3af', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'not-allowed', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Globe size={14} /> CRA XML Export <span style={{ fontSize: 10 }}>(Coming soon)</span>
            </button>
            <div style={{ marginTop: 8, padding: 10, background: '#f9fafb', borderRadius: 8, fontSize: 11, color: '#9ca3af' }}>
              CRA submission reference will appear here after filing confirmation.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Part I — Summary Form ────────────────────────────────────────────────────
function PartISummary() {
  const s = PART_I_SUMMARY;
  const fields: { label: string; value: string | number | boolean }[] = [
    { label: 'Reporting Entity Name', value: s.reportingEntityName },
    { label: 'Business Number (BN)', value: s.businessNumber },
    { label: 'Taxation Year — From', value: s.taxationYearFrom },
    { label: 'Taxation Year — To', value: s.taxationYearTo },
    { label: 'NAICS Code', value: s.naicsCode },
    { label: 'Number of Supplements', value: s.numberOfSupplements },
    { label: 'Head Office Address', value: s.address },
    { label: 'Contact Name', value: s.contactName },
    { label: 'Contact Title', value: s.contactTitle },
    { label: 'Contact Phone', value: s.contactPhone },
    { label: 'Signing Officer', value: s.signingOfficerName },
    { label: 'Signing Officer Title', value: s.signingOfficerTitle },
    { label: 'Signing Date', value: s.signingDate || '—' },
    { label: 'Group Filing?', value: s.isGroupFiling ? 'Yes' : 'No' },
    { label: 'ss.85 Transfer?', value: s.ss85Transfer },
    { label: 'ss.87 Amalgamation?', value: s.ss87Amalgamation },
    { label: 'ss.88 Wind-up?', value: s.ss88WindUp },
    { label: 'Org Chart Uploaded?', value: s.orgChartUploaded ? 'Yes' : 'No' },
  ];

  return (
    <div style={{ padding: '20px 24px', maxWidth: 640 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#111827', marginBottom: 4 }}>Part I — T1134 Summary</div>
      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>
        Filed once per reporting entity. Applies to Northstar Inc. as the Canadian filer.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        {fields.map((f, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 16,
            padding: '9px 14px', background: i % 2 === 0 ? '#fff' : '#fafafa',
            borderBottom: i < fields.length - 1 ? '1px solid #f3f4f6' : 'none',
          }}>
            <span style={{ minWidth: 200, fontSize: 12, color: '#6b7280', paddingTop: 1 }}>{f.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{String(f.value)}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#374151', marginBottom: 10 }}>Section 3D — Dormant Foreign Affiliates</div>
        <div style={{ fontSize: 12, color: '#9ca3af', padding: '12px 14px', background: '#fafafa', borderRadius: 8, border: '1px solid #e5e7eb' }}>
          No dormant affiliates reported for 2024.
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#374151', marginBottom: 10 }}>Section 3E — Lower-Tier Non-Controlled Foreign Affiliates</div>
        <div style={{ fontSize: 12, color: '#9ca3af', padding: '12px 14px', background: '#fafafa', borderRadius: 8, border: '1px solid #e5e7eb' }}>
          No lower-tier NCFAs reported for 2024.
        </div>
      </div>
    </div>
  );
}

// ─── Part II — Supplement Grid ────────────────────────────────────────────────
function PartIIGrid() {
  const fas = FOREIGN_AFFILIATES;

  return (
    <div style={{ overflowX: 'auto', overflowY: 'visible' }}>
      {/* Country group + column headers */}
      <div style={{ display: 'flex', position: 'sticky', top: 0, zIndex: 10, background: '#fff', borderBottom: '2px solid #e5e7eb' }}>
        {/* Frozen label header */}
        <div style={{
          minWidth: 220, maxWidth: 220, padding: '10px 12px', fontSize: 11, fontWeight: 800,
          color: '#374151', borderRight: '1px solid #e5e7eb', background: '#fff',
          position: 'sticky', left: 0, zIndex: 11, letterSpacing: '0.04em',
        }}>
          FIELD
        </div>
        {/* Country group headers + FA columns */}
        {COUNTRY_GROUPS.map(group => (
          <div key={group.country} style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Country banner */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
              background: '#f5f3ff', borderBottom: '1px solid #ede9fe', borderRight: '1px solid #e5e7eb',
              fontSize: 11, fontWeight: 700, color: PURPLE, minWidth: group.ids.length * 140,
            }}>
              <span>{group.flag}</span> {group.country}
            </div>
            {/* FA column headers */}
            <div style={{ display: 'flex' }}>
              {group.ids.map(id => {
                const fa = fas.find(f => f.id === id)!;
                return (
                  <div key={id} style={{
                    minWidth: 140, maxWidth: 140, padding: '6px 10px', borderRight: '1px solid #f3f4f6',
                    background: '#fff',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {fa.shortName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 9999,
                        background: fa.tier === 'CFA' ? '#ede9fe' : '#f3f4f6',
                        color: fa.tier === 'CFA' ? PURPLE : '#6b7280',
                      }}>{fa.tier}</span>
                      <FlagCell flags={fa.flags} />
                    </div>
                    {/* Completion bar */}
                    <div style={{ marginTop: 4, height: 3, background: '#f3f4f6', borderRadius: 9999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${fa.completionPct}%`, background: fa.completionPct >= 90 ? '#10b981' : fa.completionPct >= 60 ? '#f59e0b' : '#ef4444', borderRadius: 9999 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Section 1 — FA Information */}
      <SectionAccordion title="Part II · Section 1 — Foreign Affiliate Information" defaultOpen>
        <GridRow label="Legal Name" fas={fas} render={fa => <span style={{ fontSize: 11, color: '#374151' }}>{fa.legalName}</span>} />
        <GridRow label="Country of Residence" fas={fas} render={fa => <span>{fa.flag} {fa.countryCode}</span>} />
        <GridRow label="TIN" fas={fas} render={fa => <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#374151' }}>{fa.tin}</span>} />
        <GridRow label="NAICS Code(s)" fas={fas} render={fa => <span style={{ fontSize: 11 }}>{fa.naicsCodes.join(', ')}</span>} />
        <GridRow label="Functional Currency" fas={fas} render={fa => <span style={{ fontWeight: 700 }}>{fa.functionalCurrency}</span>} />
        <GridRow label="Tier (CFA / NCFA)" fas={fas} render={fa => (
          <span style={{ fontWeight: 700, color: fa.tier === 'CFA' ? PURPLE : '#6b7280' }}>{fa.tier}</span>
        )} />
        <GridRow label="First-Time Filing?" fas={fas} render={fa => <YesNoToggle value={fa.firstTimeFiling} />} />
        <GridRow label="Multiple Tax Years?" fas={fas} render={fa => <YesNoToggle value={fa.multipleTaxYears} />} />
        <GridRow label="Tax Year — From" fas={fas} render={fa => <span style={{ fontSize: 11 }}>{fa.taxYearFrom}</span>} />
        <GridRow label="Tax Year — To" fas={fas} render={fa => <span style={{ fontSize: 11 }}>{fa.taxYearTo}</span>} />
        <GridRow label="Business Countries" fas={fas} render={fa => <span style={{ fontSize: 11 }}>{fa.businessCountries.join(', ')}</span>} />
        <GridRow label="Tax Countries" fas={fas} render={fa => <span style={{ fontSize: 11 }}>{fa.taxCountries.join(', ')}</span>} />
      </SectionAccordion>

      {/* Section 1B — Capital Stock */}
      <SectionAccordion title="Part II · Section 1B — Capital Stock">
        <GridRow label="Direct Ownership %" fas={fas} render={fa => <span style={{ fontWeight: 700 }}>{fmtPct(fa.directOwnershipPct)}</span>} />
        <GridRow label="Common Shares — ACB" fas={fas} render={fa => <span>{fmtCAD(fa.commonSharesACB)}</span>} />
        <GridRow label="ACB Increased?" fas={fas} render={fa => <YesNoToggle value={fa.acbIncrease} />} />
        <GridRow label="ACB Decreased?" fas={fas} render={fa => <YesNoToggle value={fa.acbDecrease} />} />
        <GridRow label="Preferred Shares — Ownership %" fas={fas} render={fa => <span>{fmtPct(fa.preferredSharesOwnershipPct)}</span>} />
        <GridRow label="Preferred Shares — ACB" fas={fas} render={fa => <span>{fmtCAD(fa.preferredSharesACB)}</span>} />
        <GridRow label="Indirect Ownership?" fas={fas} render={fa => <YesNoToggle value={fa.isIndirect ? 'Yes' : 'No'} />} />
      </SectionAccordion>

      {/* Section 1C — Other Information */}
      <SectionAccordion title="Part II · Section 1C — Other Information">
        <GridRow label="Equity % — Beginning of Year" fas={fas} render={fa => <span style={{ fontWeight: 700 }}>{fmtPct(fa.equityPctBeginning)}</span>} />
        <GridRow label="Equity % — End of Year" fas={fas} render={fa => <span style={{ fontWeight: 700 }}>{fmtPct(fa.equityPctEnd)}</span>} />
        <GridRow label="Debt Owed TO FA (CAD)" fas={fas} render={fa => <span>{fmtCAD(fa.debtOwedToFA)}</span>} />
        <GridRow label="Debt to FA on T106?" fas={fas} render={fa => <YesNoToggle value={fa.debtOwedToFAOnT106} />} />
        <GridRow label="Debt Owed FROM FA (CAD)" fas={fas} render={fa => <span>{fmtCAD(fa.debtOwedFromFA)}</span>} />
        <GridRow label="Debt from FA on T106?" fas={fas} render={fa => <YesNoToggle value={fa.debtOwedFromFAOnT106} />} />
        <GridRow label="Tracking Interest (ss.95(8))?" fas={fas} render={fa => <YesNoToggle value={fa.trackingInterest} />} />
        <GridRow label="CFA via ss.95(11)?" fas={fas} render={fa => <YesNoToggle value={fa.cfaBecauseSS95_11} />} />
        <GridRow label="CFA via ss.95(12)?" fas={fas} render={fa => <YesNoToggle value={fa.cfaBecauseSS95_12} />} />
        <GridRow label="Joint Election ss.91(1.4)?" fas={fas} render={fa => <YesNoToggle value={fa.jointElectionSS91_1_4} />} />
      </SectionAccordion>

      {/* Section 1D — FA Dumping */}
      <SectionAccordion title="Part II · Section 1D — Foreign Affiliate Dumping (ss.212.3)">
        <GridRow label="ss.212.3(2) Applied?" fas={fas} render={fa => <YesNoToggle value={fa.faDumping_212_3_2_applied} />} />
        <GridRow label="75% FMV Exception?" fas={fas} render={fa => <YesNoToggle value={fa.faDumping_75pctFMV} />} />
        <GridRow label="Business Activities Exception?" fas={fas} render={fa => <YesNoToggle value={fa.faDumping_businessActivities} />} />
        <GridRow label="Corporate Reorganization?" fas={fas} render={fa => <YesNoToggle value={fa.faDumping_corpReorg} />} />
        <GridRow label="Filed Information Return?" fas={fas} render={fa => <YesNoToggle value={fa.faDumping_filedInfo} />} />
        <GridRow label="Deemed Dividend?" fas={fas} render={fa => <YesNoToggle value={fa.faDumping_deemedDividend} />} />
        <GridRow label="PUC Increase?" fas={fas} render={fa => <YesNoToggle value={fa.faDumping_PUCIncrease} />} />
        <GridRow label="Preferred Shares ss.212.3(19)?" fas={fas} render={fa => <YesNoToggle value={fa.faDumping_preferredShares212_3_19} />} />
      </SectionAccordion>

      {/* Section 2 — Financial Information */}
      <SectionAccordion title="Part II · Section 2 — Financial Information">
        <GridRow label="Financial Statements Available?" fas={fas} render={fa => <YesNoToggle value={fa.financialStatementsAvailable} />} />
        <GridRow label="Financial Statements Included?" fas={fas} render={fa => <YesNoToggle value={fa.financialStatementsIncluded} />} />
        <GridRow label="≥20% Voting Shares?" fas={fas} render={fa => <YesNoToggle value={fa.hasAtLeast20pctVoting} />} />
      </SectionAccordion>

      {/* Section 3A — Surplus Accounts */}
      <SectionAccordion title="Part II · Section 3A — Surplus Accounts & Dividends">
        <GridRow label="Dividend Received?" fas={fas} render={fa => <YesNoToggle value={fa.dividendReceived} />} />
        <GridRow label="Exempt Surplus Dividend" fas={fas} render={fa => <LinkedCell value={fa.exemptSurplusDividend} currency={fa.dividendCurrency} />} />
        <GridRow label="Hybrid Surplus Dividend" fas={fas} render={fa => <LinkedCell value={fa.hybridSurplusDividend} currency={fa.dividendCurrency} />} />
        <GridRow label="Taxable Surplus Dividend" fas={fas} render={fa => <LinkedCell value={fa.taxableSurplusDividend} currency={fa.dividendCurrency} />} />
        <GridRow label="Pre-Acquisition Surplus Dividend" fas={fas} render={fa => <LinkedCell value={fa.preAcquisitionSurplusDividend} currency={fa.dividendCurrency} />} />
        <GridRow label="Reg. 5900(2) Election?" fas={fas} render={fa => <YesNoToggle value={fa.reg5900_2Election} />} />
        <GridRow label="Reg. 5901(1.1) Election?" fas={fas} render={fa => <YesNoToggle value={fa.reg5901_1_1Election} />} />
        <GridRow label="Reg. 5901(2)(b) Election?" fas={fas} render={fa => <YesNoToggle value={fa.reg5901_2bElection} />} />
        <GridRow label="QROC Election ss.90(3)?" fas={fas} render={fa => <YesNoToggle value={fa.qrocElection} />} />
        <GridRow label="Total Dividends — Cash" fas={fas} render={fa => <span>{fmtCAD(fa.totalDividendsCash)}</span>} />
        <GridRow label="Total Dividends — Stock" fas={fas} render={fa => <span>{fmtCAD(fa.totalDividendsStock)}</span>} />
        <GridRow label="ss.93(1.11) / (1.3) Transaction?" fas={fas} render={fa => <YesNoToggle value={fa.ss93_1_11Transaction} />} />
        <GridRow label="Upstream Loan — 4.1?" fas={fas} render={fa => <YesNoToggle value={fa.upstreamLoan_4_1} />} />
        <GridRow label="Upstream Loan — 4.2?" fas={fas} render={fa => <YesNoToggle value={fa.upstreamLoan_4_2} />} />
        <GridRow label="Upstream Loan — 4.3?" fas={fas} render={fa => <YesNoToggle value={fa.upstreamLoan_4_3} />} />
        <GridRow label="Upstream Loan — 4.4?" fas={fas} render={fa => <YesNoToggle value={fa.upstreamLoan_4_4} />} />
        <GridRow label="Deduction ss.90(9)?" fas={fas} render={fa => <YesNoToggle value={fa.upstreamLoan_deduction90_9} />} />
        <GridRow label="ss.90(8.1) Applied?" fas={fas} render={fa => <YesNoToggle value={fa.upstreamLoan_90_8_1} />} />
        <GridRow label="ss.90(12) Applied?" fas={fas} render={fa => <YesNoToggle value={fa.upstreamLoan_90_12} />} />
      </SectionAccordion>

      {/* Section 3B — Surplus & Share Transactions (CFA only) */}
      <SectionAccordion title="Part II · Section 3B — Surplus & Share Transactions" subtitle="(CFA only)">
        <GridRow label="ss.88(3) Liquidation?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.ss88_3Liquidation} />} />
        <GridRow label="ss.88(3.1) Election?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.ss88_3_1Election} />} />
        <GridRow label="ss.51 Exchange?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.ss51Exchange} />} />
        <GridRow label="Share Acquisition / Disposition?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.shareAcquisitionDisposition} />} />
        <GridRow label="ss.91(1.2) Applicable?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.ss91_1_2Applicable} />} />
        <GridRow label="ss.95(2)(c) Applicable?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.ss95_2cApplicable} />} />
        <GridRow label="Surplus Entitlement % Changed?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.surplusEntitlementPctChange} />} />
        <GridRow label="Equity % of FA Changed?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.equityPctFAChange} />} />
        <GridRow label="Disposed Excluded Property?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.disposedExcludedProperty} />} />
        <GridRow label="Disposed Non-Excluded Cap. Prop.?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.disposedNonExcludedCapProp} />} />
        <GridRow label="Other Reorg Affecting Surplus?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.otherReorgAffectingSurplus} />} />
      </SectionAccordion>

      {/* Part III Section 1 — Employees */}
      <SectionAccordion title="Part III · Section 1 — Employees" subtitle="(CFA only)">
        <GridRow label="Full-Time Employees" cfaOnly fas={fas} render={fa => <span style={{ fontWeight: 700 }}>{fa.employeeCount}</span>} />
        <GridRow label="Relies on Subcontractors?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.reliesOnSubcontractors} />} />
      </SectionAccordion>

      {/* Part III Section 2 — Revenue Composition */}
      <SectionAccordion title="Part III · Section 2 — Revenue Composition" subtitle="(CFA only, thousands)">
        <GridRow label="(i) Interest — Non-Arm's Length" cfaOnly fas={fas} render={fa => <span>{fa.revInterestNonArmLength > 0 ? fa.revInterestNonArmLength + 'K' : '—'}</span>} />
        <GridRow label="(i) Interest — Arm's Length" cfaOnly fas={fas} render={fa => <span>{fa.revInterestArmLength > 0 ? fa.revInterestArmLength + 'K' : '—'}</span>} />
        <GridRow label="(ii) Dividends — Non-Arm's Length" cfaOnly fas={fas} render={fa => <span>{fa.revDividendsNonArmLength > 0 ? fa.revDividendsNonArmLength + 'K' : '—'}</span>} />
        <GridRow label="(iii) Royalties — Non-Arm's Length" cfaOnly fas={fas} render={fa => <span>{fa.revRoyaltiesNonArmLength > 0 ? fa.revRoyaltiesNonArmLength + 'K' : '—'}</span>} />
        <GridRow label="(iii) Royalties — Arm's Length" cfaOnly fas={fas} render={fa => <span>{fa.revRoyaltiesArmLength > 0 ? fa.revRoyaltiesArmLength + 'K' : '—'}</span>} />
        <GridRow label="(iv) Rental — Non-Arm's Length" cfaOnly fas={fas} render={fa => <span>{fa.revRentalNonArmLength > 0 ? fa.revRentalNonArmLength + 'K' : '—'}</span>} />
        <GridRow label="Currency Code" cfaOnly fas={fas} render={fa => <span style={{ fontWeight: 700 }}>{fa.revCurrencyCode}</span>} />
      </SectionAccordion>

      {/* Part III Section 3 — FAPI */}
      <SectionAccordion title="Part III · Section 3 — FAPI / FAPL / FACL" subtitle="(CFA only — 🔗 linked to FAPI worksheet)">
        <GridRow label="FAPI Earned?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.fapiEarned} />} />
        <GridRow label="FAPL Incurred?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.faplIncurred} />} />
        <GridRow label="FACL Incurred?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.faclIncurred} />} />
        <GridRow label="Participating %" cfaOnly fas={fas} render={fa => <span style={{ fontWeight: 700 }}>{fmtPct(fa.participatingPct)}</span>} />
        <GridRow label="FAPI Amount (CAD)" cfaOnly fas={fas} render={fa => <LinkedCell value={fa.fapiAmount} />} />
        <GridRow label="FAPL Amount (CAD)" cfaOnly fas={fas} render={fa => <LinkedCell value={fa.faplAmount} />} />
        <GridRow label="(a) Property Income" cfaOnly fas={fas} render={fa => <span>{fmtCAD(fa.fapi_a_property)}</span>} />
        <GridRow label="(b) Sale of Property" cfaOnly fas={fas} render={fa => <span>{fmtCAD(fa.fapi_b_sale)}</span>} />
        <GridRow label="(c) Insurance / Reinsurance" cfaOnly fas={fas} render={fa => <span>{fmtCAD(fa.fapi_c_insurance)}</span>} />
        <GridRow label="(d) Indebtedness ss.95(2)(a.3)" cfaOnly fas={fas} render={fa => <span>{fmtCAD(fa.fapi_d_indebtedness_a3)}</span>} />
        <GridRow label="(e) Indebtedness ss.95(2)(a.4)" cfaOnly fas={fas} render={fa => <span>{fmtCAD(fa.fapi_e_indebtedness_a4)}</span>} />
        <GridRow label="(f) Services ss.95(2)(b)" cfaOnly fas={fas} render={fa => <span>{fmtCAD(fa.fapi_f_services)}</span>} />
        <GridRow label="(g) Property ss.95(2)(l)" cfaOnly fas={fas} render={fa => <span>{fmtCAD(fa.fapi_g_property_l)}</span>} />
        <GridRow label="(h)(1) Disposition — Shares" cfaOnly fas={fas} render={fa => <span>{fmtCAD(fa.fapi_h1_shares)}</span>} />
        <GridRow label="(h)(2) Disposition — Other" cfaOnly fas={fas} render={fa => <span>{fmtCAD(fa.fapi_h2_other)}</span>} />
        <GridRow label="(i) Description C" cfaOnly fas={fas} render={fa => <span>{fmtCAD(fa.fapi_i_descC)}</span>} />
        <GridRow label="ss.95(2.44) Election?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.ss95_2_44Election} />} />
      </SectionAccordion>

      {/* Part III Section 4 — ABI Inclusions */}
      <SectionAccordion title="Part III · Section 4 — Active Business Income Inclusions" subtitle="(CFA only)">
        <GridRow label="Property Income in ABI?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.propertyIncomeInABI} />} />
        <GridRow label="— ss.95(2)(a)(i)–(vi)?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.abi_ss95_2a} />} />
        <GridRow label="— Investment Business?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.abi_investmentBusiness} />} />
        <GridRow label="— ss.95(2)(l)?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.abi_ss95_2l} />} />
        <GridRow label="Other Income in ABI?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.otherIncomeInABI} />} />
        <GridRow label="— 90% Test?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.abi_90pctTest} />} />
        <GridRow label="— ss.95(2.3)?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.abi_ss95_2_3} />} />
        <GridRow label="— ss.95(2.4)?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.abi_ss95_2_4} />} />
        <GridRow label="— ss.95(3)?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.abi_ss95_3} />} />
        <GridRow label="— ss.95(3.01)?" cfaOnly fas={fas} render={fa => <YesNoToggle value={fa.abi_ss95_3_01} />} />
      </SectionAccordion>

      {/* Part IV — Disclosure */}
      <SectionAccordion title="Part IV — Disclosure">
        <GridRow label="Information Not Available?" fas={fas} render={fa => <YesNoToggle value={fa.infoNotAvailable} />} />
        <GridRow label="Details" fas={fas} render={fa => <span style={{ fontSize: 11, color: '#9ca3af' }}>{fa.infoNotAvailableDetails || '—'}</span>} />
      </SectionAccordion>
    </div>
  );
}

// ─── Main T1134Worksheet Component ───────────────────────────────────────────
export default function T1134Worksheet() {
  const [activeTab, setActiveTab] = useState<'part1' | 'part2' | 'client'>('part2');
  const [activePanel, setActivePanel] = useState<MilestoneId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMilestoneSelect = useCallback((id: MilestoneId) => {
    setActivePanel(prev => prev === id ? null : id);
    setMenuOpen(false);
  }, []);

  const handleClosePanel = useCallback(() => {
    setActivePanel(null);
  }, []);

  const panelOpen = activePanel !== null;

  // Logo position: bottom-center when no panel, anchored to right edge of left area when panel open
  const logoStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 24,
    transition: 'left 0.35s cubic-bezier(0.23,1,0.32,1), right 0.35s cubic-bezier(0.23,1,0.32,1), transform 0.35s cubic-bezier(0.23,1,0.32,1)',
    zIndex: 50,
    ...(panelOpen
      ? { right: '38%', left: 'auto', transform: 'translateX(50%)' }
      : { left: '50%', right: 'auto', transform: 'translateX(-50%)' }),
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>
      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', height: 52,
        background: '#0f172a', flexShrink: 0, zIndex: 20,
      }}>
        {/* Brand */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <span style={{ fontSize: 13, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>Sinaxe</span>
          <span style={{ fontSize: 9, color: '#94a3b8', marginTop: -4 }}>™</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: PURPLE, marginLeft: 2 }}>InScope</span>
        </Link>
        <span style={{ color: '#334155', fontSize: 14 }}>/</span>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {['Northstar Inc.', 'ICT', 'Comply', 'T1134'].map((crumb, i, arr) => (
            <span key={crumb} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 12, color: i === arr.length - 1 ? '#e2e8f0' : '#64748b', fontWeight: i === arr.length - 1 ? 700 : 400 }}>
                {crumb}
              </span>
              {i < arr.length - 1 && <ChevronRight size={12} color="#334155" />}
            </span>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        {/* Year selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1e293b', borderRadius: 6, padding: '4px 10px' }}>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>FY</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>2024</span>
          <ChevronDown size={12} color="#64748b" />
        </div>
        {/* iFirm CSV export */}
        <button
          onClick={() => handleMilestoneSelect('file')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
            background: PURPLE, color: '#fff', border: 'none', borderRadius: 6,
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >
          <Download size={13} /> iFirm CSV
        </button>
        {/* Share with client */}
        <button
          onClick={() => setActiveTab('client')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
            background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: 6,
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >
          <Users size={13} /> Share with Client
        </button>
      </div>

      {/* ── Tab bar ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0, background: '#fff',
        borderBottom: '1px solid #e5e7eb', padding: '0 20px', flexShrink: 0,
      }}>
        {([
          { id: 'part1', label: 'Part I — Summary' },
          { id: 'part2', label: 'Part II — Supplement (20 FAs)' },
          { id: 'client', label: 'Client Portal View' },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: activeTab === tab.id ? 800 : 500,
              color: activeTab === tab.id ? PURPLE : '#6b7280',
              borderBottom: activeTab === tab.id ? `2px solid ${PURPLE}` : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {/* Completion summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#6b7280' }}>
          <span style={{ color: '#10b981', fontWeight: 700 }}>●</span> 4 complete
          <span style={{ color: '#f59e0b', fontWeight: 700 }}>●</span> 12 in progress
          <span style={{ color: '#ef4444', fontWeight: 700 }}>●</span> 4 not started
        </div>
      </div>

      {/* ── Main content area ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Left content */}
        <div style={{
          flex: 1, overflowY: 'auto', overflowX: activeTab === 'part2' ? 'auto' : 'hidden',
          transition: 'flex-basis 0.3s ease-out',
          paddingBottom: 120,
        }}>
          {activeTab === 'part1' && <PartISummary />}
          {activeTab === 'part2' && <PartIIGrid />}
          {activeTab === 'client' && (
            <div style={{ padding: 32, maxWidth: 600 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Client Portal View</div>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, marginBottom: 20 }}>
                This view shows the T1134 workpaper as Northstar Inc.'s tax team would see it — with calculated fields locked and only confirmation questions editable. Share a secure link with the client to allow them to confirm ownership percentages, loan balances, and transaction details directly.
              </div>
              <div style={{ padding: 16, background: '#f5f3ff', border: `1px solid ${PURPLE}33`, borderRadius: 10, fontSize: 12, color: '#4b5563' }}>
                <div style={{ fontWeight: 800, color: PURPLE, marginBottom: 8 }}>🔗 Shareable Link</div>
                <div style={{ fontFamily: 'monospace', background: '#fff', padding: '6px 10px', borderRadius: 6, color: '#374151', marginBottom: 10 }}>
                  https://inscope.sinaxe.com/client/northstar/t1134/2024?token=abc123
                </div>
                <button style={{ padding: '8px 16px', background: PURPLE, color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  Generate Client Link
                </button>
              </div>
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Questions awaiting client confirmation</div>
                {SOPHIA_IRL_QUESTIONS.flatMap(g => g.questions).filter(q => q.priority === 'high').slice(0, 5).map(q => (
                  <div key={q.id} style={{ padding: '10px 12px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 8, fontSize: 12 }}>
                    <div style={{ color: '#374151', lineHeight: 1.5 }}>{q.text}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button style={{ padding: '4px 12px', background: '#dcfce7', color: '#166534', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>Confirmed</button>
                      <button style={{ padding: '4px 12px', background: '#fef2f2', color: '#991b1b', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>Change needed</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right panel — slides in from right */}
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: '38%',
          background: '#fff', borderLeft: '1px solid #e5e7eb',
          boxShadow: panelOpen ? '-4px 0 24px rgba(0,0,0,0.08)' : 'none',
          transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.23,1,0.32,1)',
          zIndex: 30, display: 'flex', flexDirection: 'column',
        }}>
          {activePanel && <RightPanelContent milestone={activePanel} onClose={handleClosePanel} />}
        </div>
      </div>

      {/* ── Animated InScope logo (bottom, position-aware) ─────────────────── */}
      <div style={logoStyle}>
        <div style={{ position: 'relative' }}>
          <MiniDotRing size={100} onClick={() => setMenuOpen(o => !o)} />
          {/* Center label */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            textAlign: 'center', pointerEvents: 'none',
          }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>T1134</div>
            <div style={{ fontSize: 8, color: '#9ca3af', marginTop: 1 }}>
              {FOREIGN_AFFILIATES.filter(fa => fa.completionPct >= 90).length}/{FOREIGN_AFFILIATES.length} done
            </div>
          </div>
          {/* Milestone menu */}
          {menuOpen && (
            <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8 }}>
              <OrbitalMilestoneMenu
                active={activePanel}
                onSelect={handleMilestoneSelect}
                onClose={() => setMenuOpen(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
