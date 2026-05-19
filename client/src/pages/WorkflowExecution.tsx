// Screen 3: Workflow Execution Workspace — FAPI Workpaper 2025
// Design: "Precision Instrument" — Serious professional workpaper interface
// Layout: Top bar | Left nav tree | Center workpaper | Right context/AI panel

import { useState } from 'react';
import { Link } from 'wouter';
import {
  ChevronRight, ChevronDown, FileText, Upload, AlertTriangle,
  CheckCircle2, Shield, Sparkles, Lock, Unlock, Download,
  MessageSquare, Eye, RefreshCw, Play, Send, X, Info,
  Database, Calculator, ClipboardCheck, Package, Activity
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import StatusBadge, { AvatarInitials } from '@/components/StatusBadge';
import {
  FAPI_SOURCE_ROWS, FAPI_CALCULATIONS, FAPI_REVIEW_TRAIL,
  type FAPISourceRow, type FAPICalculationRow
} from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Format currency ──────────────────────────────────────────────────────────
function fmtCAD(n: number) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n);
}
function fmtNum(n: number) {
  return new Intl.NumberFormat('en-CA', { maximumFractionDigits: 0 }).format(n);
}

// ─── Workpaper sections ───────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'sources', label: 'Sources', icon: <Database size={12} />, badge: 8 },
  { id: 'mapping', label: 'Keyword Mapping', icon: <Activity size={12} />, badge: null },
  { id: 'calculations', label: 'Calculations', icon: <Calculator size={12} />, badge: 2 },
  { id: 'protected', label: 'Protected Results', icon: <Lock size={12} />, badge: null },
  { id: 'review', label: 'Review & Validation', icon: <ClipboardCheck size={12} />, badge: 3 },
  { id: 'output', label: 'Output Package', icon: <Package size={12} />, badge: null },
];

// ─── AI Messages ──────────────────────────────────────────────────────────────
const AI_SUGGESTIONS = [
  {
    id: 'ai1',
    type: 'suggestion',
    content: 'I noticed the HK FX rate (0.1742) differs from the BoC published rate for Dec 31, 2024 (0.1751). This may cause a CAD 5,800 variance. Would you like me to update the rate?',
    action: 'Update FX Rate',
    dismissed: false,
  },
  {
    id: 'ai2',
    type: 'suggestion',
    content: 'Japan treaty analysis is pending. Based on the Canada-Japan tax treaty (Art. 11), interest income from JP KK may qualify for a reduced withholding rate of 10%. Shall I draft a treaty position memo?',
    action: 'Draft Treaty Memo',
    dismissed: false,
  },
];

// ─── Left Nav Section ─────────────────────────────────────────────────────────
function WorkpaperNav({ activeSection, onSelect }: {
  activeSection: string;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState<string[]>(['sources', 'calculations']);

  return (
    <div className="w-52 shrink-0 border-r border-border bg-sidebar flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-sidebar-border">
        <div className="text-[10px] font-600 text-muted-foreground uppercase tracking-wider">Workpaper Sections</div>
      </div>
      <div className="flex-1 overflow-y-auto py-1.5">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => onSelect(section.id)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 text-left transition-colors',
              'hover:bg-sidebar-accent',
              activeSection === section.id
                ? 'bg-primary/10 text-primary border-l-2 border-primary pl-[10px]'
                : 'text-sidebar-foreground'
            )}
          >
            <span className="shrink-0">{section.icon}</span>
            <span className="text-[12px] flex-1">{section.label}</span>
            {section.badge && (
              <span className={cn(
                'text-[9px] px-1.5 py-0.5 rounded-full',
                section.id === 'calculations' ? 'status-warning' : 'status-error'
              )}>
                {section.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Run status */}
      <div className="border-t border-sidebar-border p-3 space-y-1.5">
        <div className="text-[10px] font-600 text-muted-foreground uppercase tracking-wider mb-2">Run Status</div>
        {[
          { label: 'Sources', status: 'complete' },
          { label: 'Mapping', status: 'complete' },
          { label: 'Calculations', status: 'active' },
          { label: 'Review', status: 'pending' },
          { label: 'Output', status: 'pending' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <div className={cn(
              'w-1.5 h-1.5 rounded-full',
              s.status === 'complete' ? 'bg-green-400' :
              s.status === 'active' ? 'bg-primary animate-pulse-dot' : 'bg-border'
            )} />
            <span className="text-[10px] text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sources Section ──────────────────────────────────────────────────────────
function SourcesSection() {
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  const totalCAD = FAPI_SOURCE_ROWS.reduce((sum, r) => sum + r.cadAmount, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div>
          <h3 className="text-sm font-600 text-foreground">Source Data</h3>
          <p className="text-[11px] text-muted-foreground">
            {FAPI_SOURCE_ROWS.length} rows · Total: <span className="tabular-nums text-foreground">{fmtCAD(totalCAD)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info('Upload source — coming soon')}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <Upload size={11} /> Upload
          </button>
          <button
            onClick={() => toast.success('AI mapping suggestions generated')}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-colors"
          >
            <Sparkles size={11} /> AI Map
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="workpaper-table">
          <thead>
            <tr>
              <th>Entity</th>
              <th>Country</th>
              <th>Income Type</th>
              <th className="text-right">Gross Amount</th>
              <th>CCY</th>
              <th className="text-right">FX Rate</th>
              <th className="text-right">CAD Amount</th>
              <th>Category</th>
              <th>Conf.</th>
              <th>Flag</th>
            </tr>
          </thead>
          <tbody>
            {FAPI_SOURCE_ROWS.map((row) => (
              <tr
                key={row.id}
                onClick={() => setSelectedRow(row.id === selectedRow ? null : row.id)}
                className={cn(
                  'cursor-pointer',
                  selectedRow === row.id && 'bg-primary/8 border-l-2 border-primary'
                )}
              >
                <td className="font-500 text-[11px]">{row.entity}</td>
                <td className="text-[11px]">{row.country}</td>
                <td className="text-[11px]">{row.incomeType}</td>
                <td className="num">{fmtNum(row.grossAmount)}</td>
                <td className="text-[11px] text-muted-foreground">{row.currency}</td>
                <td className="num text-[11px]">{row.fxRate.toFixed(4)}</td>
                <td className="num font-500">{fmtCAD(row.cadAmount)}</td>
                <td>
                  <span className="text-[10px] status-info px-1.5 py-0.5 rounded">{row.category}</span>
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <div className={cn(
                      'h-1.5 rounded-full',
                      row.confidence >= 95 ? 'bg-green-400' : row.confidence >= 90 ? 'bg-amber-400' : 'bg-red-400'
                    )} style={{ width: `${row.confidence * 0.4}px` }} />
                    <span className="tabular-nums text-[10px] text-muted-foreground">{row.confidence}%</span>
                  </div>
                </td>
                <td>
                  {row.flag && (
                    <div className="flex items-center gap-1">
                      <AlertTriangle size={10} className="text-amber-400 shrink-0" />
                      <span className="text-[10px] text-amber-400 truncate max-w-32">{row.flag}</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-secondary/30">
              <td colSpan={6} className="text-[11px] font-600 text-muted-foreground px-3 py-2">Total</td>
              <td className="num font-700 text-foreground">{fmtCAD(totalCAD)}</td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Immutability notice */}
      <div className="flex items-center gap-2 px-4 py-2 border-t border-border bg-secondary/20 shrink-0">
        <Lock size={10} className="text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">
          Sources are immutable. Corrections and overrides must be applied in Logic blocks downstream.
        </span>
      </div>
    </div>
  );
}

// ─── Calculations Section ─────────────────────────────────────────────────────
function CalculationsSection() {
  const totalNet = FAPI_CALCULATIONS.reduce((sum, r) => sum + r.netFAPI, 0);
  const totalGrossUp = FAPI_CALCULATIONS.reduce((sum, r) => sum + r.grossUpTax, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div>
          <h3 className="text-sm font-600 text-foreground">FAPI Calculations</h3>
          <p className="text-[11px] text-muted-foreground">
            Net FAPI: <span className="tabular-nums text-foreground font-600">{fmtCAD(totalNet)}</span>
            {' · '}Gross-up Tax: <span className="tabular-nums text-foreground font-600">{fmtCAD(totalGrossUp)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.success('Calculations re-run successfully')}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw size={11} /> Re-run
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Calculation table */}
        <div className="bg-card border border-border rounded overflow-hidden">
          <table className="workpaper-table">
            <thead>
              <tr>
                <th>Category</th>
                <th className="text-right">Gross Income (CAD)</th>
                <th className="text-right">FAT Deduction</th>
                <th className="text-right">Net FAPI</th>
                <th className="text-right">Tax Rate</th>
                <th className="text-right">Gross-Up Tax</th>
                <th>Protected</th>
              </tr>
            </thead>
            <tbody>
              {FAPI_CALCULATIONS.map((row) => (
                <tr key={row.id}>
                  <td className="font-500 text-[11px]">{row.category}</td>
                  <td className="num">{fmtCAD(row.grossIncome)}</td>
                  <td className="num text-amber-400">({fmtCAD(row.fatDeduction)})</td>
                  <td className="num font-600 text-foreground">{fmtCAD(row.netFAPI)}</td>
                  <td className="num text-muted-foreground">{(row.taxRate * 100).toFixed(1)}%</td>
                  <td className="num font-600 text-foreground">{fmtCAD(row.grossUpTax)}</td>
                  <td>
                    {row.protected && (
                      <div className="flex items-center gap-1">
                        <Lock size={10} className="text-primary" />
                        <span className="text-[10px] status-info px-1.5 py-0.5 rounded">Protected</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-secondary/30">
                <td className="text-[11px] font-600 text-muted-foreground px-3 py-2">Total</td>
                <td className="num font-700">{fmtCAD(FAPI_CALCULATIONS.reduce((s, r) => s + r.grossIncome, 0))}</td>
                <td className="num font-700 text-amber-400">({fmtCAD(FAPI_CALCULATIONS.reduce((s, r) => s + r.fatDeduction, 0))})</td>
                <td className="num font-700 text-foreground">{fmtCAD(totalNet)}</td>
                <td />
                <td className="num font-700 text-foreground">{fmtCAD(totalGrossUp)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Formula trace */}
        <div className="bg-card border border-border rounded p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calculator size={13} className="text-primary" />
            <span className="text-xs font-600 text-foreground">Formula Trace — Net FAPI (Dividends)</span>
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="text-muted-foreground">{`// FAPI Calculation — ITA s.95(1)`}</div>
            <div className="text-foreground">Gross FAPI Income = <span className="text-green-400">13,079,930</span> CAD</div>
            <div className="text-foreground">FAT Deduction (15%) = <span className="text-amber-400">(1,962,000)</span> CAD</div>
            <div className="text-foreground font-600">Net FAPI = <span className="text-primary">11,117,930</span> CAD</div>
            <div className="text-foreground">Gross-Up Tax (26.5%) = <span className="text-primary">2,946,251</span> CAD</div>
            <div className="text-muted-foreground text-[10px] mt-2">Source: Northstar_FAPI_FinancialStatements_2024.xlsx · FX: BoC Dec 31, 2024</div>
          </div>
        </div>

        {/* Exceptions */}
        <div className="bg-card border border-red-500/20 rounded p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={13} className="text-red-400" />
            <span className="text-xs font-600 text-foreground">Exceptions (2)</span>
          </div>
          <div className="space-y-2">
            {[
              { id: 'e1', msg: 'HK FX rate (0.1742) deviates from BoC reference (0.1751) by 0.52%', severity: 'warning' },
              { id: 'e2', msg: 'JP treaty analysis pending — withholding rate assumption unconfirmed', severity: 'error' },
            ].map(e => (
              <div key={e.id} className={cn(
                'flex items-start gap-2 p-2.5 rounded',
                e.severity === 'error' ? 'bg-red-500/10 border border-red-500/20' : 'bg-amber-500/10 border border-amber-500/20'
              )}>
                <AlertTriangle size={11} className={e.severity === 'error' ? 'text-red-400 mt-0.5 shrink-0' : 'text-amber-400 mt-0.5 shrink-0'} />
                <div className="flex-1">
                  <p className="text-[11px] text-foreground">{e.msg}</p>
                </div>
                <button
                  onClick={() => toast.success('Exception resolved')}
                  className="text-[10px] text-primary hover:underline shrink-0"
                >
                  Resolve
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Protected Results Section ────────────────────────────────────────────────
function ProtectedSection() {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div>
          <h3 className="text-sm font-600 text-foreground">Protected Results</h3>
          <p className="text-[11px] text-muted-foreground">Governed values — locked in runtime</p>
        </div>
        <button
          onClick={() => { setUnlocked(!unlocked); toast.info(unlocked ? 'Values locked' : 'Values unlocked — handle with care'); }}
          className={cn(
            'flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border transition-colors',
            unlocked
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
              : 'border-border text-muted-foreground hover:text-foreground'
          )}
        >
          {unlocked ? <Unlock size={11} /> : <Lock size={11} />}
          {unlocked ? 'Locked: Off' : 'Locked: On'}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'Net FAPI — Dividends', value: fmtCAD(11117930), source: 'Calculation Engine', locked: true },
            { label: 'Net FAPI — Interest', value: fmtCAD(3049564), source: 'Calculation Engine', locked: true },
            { label: 'Net FAPI — Royalties', value: fmtCAD(1754072), source: 'Calculation Engine', locked: true },
            { label: 'Total Net FAPI', value: fmtCAD(15921566), source: 'Aggregation', locked: true },
            { label: 'Gross-Up Tax (26.5%)', value: fmtCAD(4219215), source: 'Calculation Engine', locked: true },
            { label: 'FAT Deduction Total', value: fmtCAD(2809700), source: 'Calculation Engine', locked: true },
            { label: 'BoC FX Rate — USD/CAD', value: '1.3642', source: 'BoC Published Rate', locked: true },
            { label: 'Federal Tax Rate', value: '26.5%', source: 'Protected — ITA s.123', locked: true },
          ].map((item, i) => (
            <div
              key={i}
              className={cn(
                'bg-card border rounded p-3 transition-colors',
                item.locked && !unlocked ? 'border-primary/20 bg-primary/5' : 'border-amber-500/30 bg-amber-500/5'
              )}
            >
              <div className="flex items-start justify-between mb-1.5">
                <span className="text-[11px] font-500 text-foreground">{item.label}</span>
                <div className="flex items-center gap-1">
                  {item.locked && !unlocked ? (
                    <Lock size={10} className="text-primary" />
                  ) : (
                    <Unlock size={10} className="text-amber-400" />
                  )}
                </div>
              </div>
              <div className="tabular-nums text-base font-700 text-foreground mb-1">{item.value}</div>
              <div className="text-[10px] text-muted-foreground">Source: {item.source}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Review Section ───────────────────────────────────────────────────────────
function ReviewSection() {
  const [comment, setComment] = useState('');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div>
          <h3 className="text-sm font-600 text-foreground">Review & Validation</h3>
          <p className="text-[11px] text-muted-foreground">Current stage: Manager Review</p>
        </div>
        <StatusBadge status="Under Review" size="md" />
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Validation checklist */}
        <div className="bg-card border border-border rounded p-4">
          <div className="text-xs font-600 text-foreground mb-3">Output Readiness Checklist</div>
          <div className="space-y-2">
            {[
              { label: 'All source rows mapped to categories', done: true },
              { label: 'FX rates sourced and referenced', done: true },
              { label: 'Calculation engine run complete', done: true },
              { label: 'HK FX rate exception resolved', done: false },
              { label: 'JP treaty analysis memo uploaded', done: false },
              { label: 'Manager review sign-off', done: false },
              { label: 'Senior Manager review', done: false },
              { label: 'Partner sign-off', done: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className={cn(
                  'w-4 h-4 rounded flex items-center justify-center shrink-0',
                  item.done ? 'bg-green-400/20 border border-green-400/40' : 'bg-secondary border border-border'
                )}>
                  {item.done && <CheckCircle2 size={10} className="text-green-400" />}
                </div>
                <span className={cn('text-[11px]', item.done ? 'text-muted-foreground line-through' : 'text-foreground')}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Review comments */}
        <div>
          <div className="text-xs font-600 text-foreground mb-3">Review Comments</div>
          <div className="space-y-3">
            {FAPI_REVIEW_TRAIL.map((item, i) => (
              <div key={item.id} className={cn(
                'bg-card border rounded p-3 animate-fade-slide-up',
                item.type === 'change-request' ? 'border-amber-500/30' : 'border-border',
                `stagger-${i + 1}`
              )}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <AvatarInitials initials={item.author.split(' ').map(n => n[0]).join('')} name={item.author} size="xs" />
                    <span className="text-xs font-500 text-foreground">{item.author}</span>
                    <span className="text-[10px] text-muted-foreground">{item.role}</span>
                    {item.type === 'change-request' && (
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded', item.resolved ? 'status-approved' : 'status-warning')}>
                        {item.resolved ? 'Resolved' : 'Change Request'}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{item.timestamp}</span>
                </div>
                <p className="text-[11px] text-foreground/80 leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Add comment */}
        <div className="bg-card border border-border rounded p-3">
          <div className="text-[11px] font-500 text-foreground mb-2">Add Review Comment</div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add a comment, change request, or approval note..."
            className="w-full bg-secondary/50 border border-border rounded p-2.5 text-[11px] text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary/50 transition-colors"
            rows={3}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { if (comment) { toast.success('Comment added'); setComment(''); } }}
                className="text-xs px-2.5 py-1 rounded bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-colors flex items-center gap-1.5"
              >
                <Send size={10} /> Comment
              </button>
              <button
                onClick={() => toast.info('Change request submitted')}
                className="text-xs px-2.5 py-1 rounded border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors"
              >
                Request Change
              </button>
              <button
                onClick={() => toast.success('Approved and forwarded to Senior Manager')}
                className="text-xs px-2.5 py-1 rounded border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Output Section ───────────────────────────────────────────────────────────
function OutputSection() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div>
          <h3 className="text-sm font-600 text-foreground">Output Package</h3>
          <p className="text-[11px] text-muted-foreground">Ready when all review items are resolved</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {[
          { name: 'Excel Workpaper', desc: 'Full FAPI workpaper with all calculations and source trace', format: 'XLSX', ready: false, icon: <FileText size={16} className="text-green-400" /> },
          { name: 'PDF Report', desc: 'Formatted FAPI summary report for client delivery', format: 'PDF', ready: false, icon: <FileText size={16} className="text-red-400" /> },
          { name: 'Evidence Pack', desc: 'All source documents, FX references, and calculation trace', format: 'ZIP', ready: false, icon: <Package size={16} className="text-blue-400" /> },
          { name: 'Canonical JSON', desc: 'Structured output for downstream systems and ONESOURCE', format: 'JSON', ready: false, icon: <Database size={16} className="text-purple-400" /> },
          { name: 'Taxprep Handoff', desc: 'Pre-populated Taxprep data file for T2 integration', format: 'XML', ready: false, icon: <FileText size={16} className="text-amber-400" /> },
        ].map((output, i) => (
          <div
            key={i}
            className={cn(
              'bg-card border border-border rounded p-4 flex items-center gap-3',
              !output.ready && 'opacity-60'
            )}
          >
            <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center shrink-0">
              {output.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-500 text-foreground">{output.name}</span>
                <span className="text-[10px] status-pending px-1.5 py-0.5 rounded">{output.format}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">{output.desc}</div>
            </div>
            <button
              onClick={() => toast.info('Output generation requires all review items to be resolved')}
              className={cn(
                'text-xs px-3 py-1.5 rounded border transition-colors shrink-0 flex items-center gap-1.5',
                output.ready
                  ? 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                  : 'border-border text-muted-foreground cursor-not-allowed'
              )}
            >
              <Download size={11} />
              Generate
            </button>
          </div>
        ))}

        {/* Blocking items */}
        <div className="bg-amber-500/8 border border-amber-500/20 rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={12} className="text-amber-400" />
            <span className="text-xs font-600 text-amber-400">Output Blocked — 5 items pending</span>
          </div>
          <div className="space-y-1">
            {['HK FX rate exception', 'JP treaty memo', 'Manager sign-off', 'Senior Manager review', 'Partner sign-off'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <div className="w-1 h-1 rounded-full bg-amber-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AI Assistant Panel ───────────────────────────────────────────────────────
function AIPanel({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'I\'m reviewing the FAPI Workpaper 2025 for Northstar Holdings. I\'ve identified 2 items that need your attention before this workflow can proceed to Senior Manager review.' },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [
      ...prev,
      { role: 'user', content: input },
      { role: 'assistant', content: 'I\'ll analyze that and provide a recommendation. Note that any changes I suggest will require your explicit approval before being applied to the workpaper.' },
    ]);
    setInput('');
  };

  return (
    <div className="w-72 shrink-0 border-l border-border bg-card flex flex-col h-full animate-slide-in-right">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-primary" />
          <span className="text-xs font-600 text-foreground">AI Assistant</span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-secondary transition-colors">
          <X size={13} className="text-muted-foreground" />
        </button>
      </div>

      {/* AI disclaimer */}
      <div className="flex items-start gap-2 px-3 py-2 bg-primary/5 border-b border-border">
        <Info size={10} className="text-primary mt-0.5 shrink-0" />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          AI proposes. Humans approve. No changes are applied without explicit confirmation.
        </p>
      </div>

      {/* Suggestions */}
      <div className="px-3 py-2.5 border-b border-border">
        <div className="text-[10px] font-600 text-muted-foreground uppercase tracking-wider mb-2">Suggestions</div>
        <div className="space-y-2">
          {AI_SUGGESTIONS.map(s => (
            <div key={s.id} className="bg-secondary/50 border border-border rounded p-2.5">
              <p className="text-[10px] text-foreground/80 leading-relaxed mb-2">{s.content}</p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => toast.info(`AI proposal: "${s.action}" — review and confirm`)}
                  className="text-[10px] px-2 py-1 rounded bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-colors"
                >
                  {s.action}
                </button>
                <button
                  onClick={() => toast.info('Suggestion dismissed')}
                  className="text-[10px] px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-2.5">
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex gap-2', msg.role === 'user' && 'flex-row-reverse')}>
            {msg.role === 'assistant' && (
              <div className="w-5 h-5 rounded bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles size={9} className="text-primary" />
              </div>
            )}
            <div className={cn(
              'rounded p-2 max-w-[85%]',
              msg.role === 'assistant' ? 'bg-secondary/60 text-foreground' : 'bg-primary/15 text-foreground'
            )}>
              <p className="text-[10px] leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick prompts */}
      <div className="px-3 py-2 border-t border-border">
        <div className="flex flex-wrap gap-1 mb-2">
          {['Explain source trace', 'Suggest formula', 'Draft review comment', 'Summarize issues'].map(p => (
            <button
              key={p}
              onClick={() => setInput(p)}
              className="text-[9px] px-1.5 py-0.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask about this workflow..."
            className="flex-1 bg-secondary/50 border border-border rounded px-2 py-1.5 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            onClick={handleSend}
            className="p-1.5 rounded bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-colors"
          >
            <Send size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Workflow Execution Page ─────────────────────────────────────────────
export default function WorkflowExecution() {
  const [activeSection, setActiveSection] = useState('sources');
  const [showAI, setShowAI] = useState(true);

  const sectionContent: Record<string, React.ReactNode> = {
    sources: <SourcesSection />,
    mapping: (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <Activity size={32} className="mx-auto mb-3 opacity-30" />
          <div className="text-sm font-500">Keyword Mapping</div>
          <div className="text-xs mt-1">Mapping complete — 8 rows classified</div>
          <button onClick={() => setActiveSection('sources')} className="mt-3 text-xs text-primary hover:underline">
            View source rows →
          </button>
        </div>
      </div>
    ),
    calculations: <CalculationsSection />,
    protected: <ProtectedSection />,
    review: <ReviewSection />,
    output: <OutputSection />,
  };

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Tax LOS Dashboard', href: '/' },
        { label: 'Northstar Holdings Inc.', href: '/client/northstar' },
        { label: 'FAPI Workpaper 2025' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground">
            <StatusBadge status="Under Review" size="sm" />
            <span>Manager Review</span>
          </div>
          <button
            onClick={() => toast.success('Workflow run triggered')}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-colors"
          >
            <Play size={11} /> Run
          </button>
          <button
            onClick={() => setShowAI(!showAI)}
            className={cn(
              'flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border transition-colors',
              showAI ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            <Sparkles size={11} /> AI
          </button>
        </div>
      }
    >
      {/* Workflow top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-secondary/20 text-[11px] text-muted-foreground">
        <span className="font-600 text-foreground">Northstar Holdings Inc.</span>
        <ChevronRight size={11} />
        <span className="font-600 text-foreground">FAPI Workpaper 2025</span>
        <ChevronRight size={11} />
        <span>International Corporate Tax</span>
        <ChevronRight size={11} />
        <span>FY 2024</span>
        <div className="ml-auto flex items-center gap-3">
          <span>Preparer: <span className="text-foreground">Ryan Tran</span></span>
          <span>Manager: <span className="text-foreground">Alex Bouchard</span></span>
          <span>Partner: <span className="text-foreground">Margaret Chen</span></span>
          <span className="text-amber-400">Due: Jun 30, 2025</span>
        </div>
      </div>

      {/* Three-panel layout */}
      <div className="flex h-[calc(100vh-8.5rem)] overflow-hidden">
        {/* Left: Workpaper nav */}
        <WorkpaperNav activeSection={activeSection} onSelect={setActiveSection} />

        {/* Center: Workpaper content */}
        <div className="flex-1 overflow-hidden">
          {sectionContent[activeSection]}
        </div>

        {/* Right: AI panel */}
        {showAI && <AIPanel onClose={() => setShowAI(false)} />}
      </div>
    </AppShell>
  );
}
