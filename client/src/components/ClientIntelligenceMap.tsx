// 360 Client Intelligence MAP
// Design: Hub-and-spoke diagram. Client group at center (selectable).
// LOS satellite cards positioned around the hub matching the ASCII layout from spec.
// Active LOS = full opacity with deliverables. Inactive = dimmed placeholder.
// SVG connector lines drawn from hub center to each card.
// Grayscale + deep navy palette. Status colors only for at-risk / review signals.

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, FileText, AlertTriangle, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CROSS_LOS_CLIENTS, LINES_OF_SERVICE, type CrossLOSClientRow } from '@/lib/data';
import { toast } from 'sonner';

// ─── Per-client, per-LOS deliverable data ─────────────────────────────────────
// Maps clientId → losAbbreviation → { deliverables, status, atRisk }
const CLIENT_LOS_DATA: Record<string, Record<string, {
  deliverables: string[];
  status: 'active' | 'review' | 'at-risk' | 'complete';
  openItems?: number;
}>> = {
  northstar: {
    TC:  { deliverables: ['T2 Corporate Return 2024', 'T1134 Foreign Affiliate', 'FAPI Workpaper 2025'], status: 'review', openItems: 2 },
    ICT: { deliverables: ['FAPI Workpaper 2025', 'Surplus Calculations', 'Pillar 2 GloBE Assessment'], status: 'at-risk', openItems: 4 },
    'M&A': { deliverables: ['Reorg Memo — Project Maple', 'Tax Steps Plan', 'PowerPoint Report'], status: 'review', openItems: 1 },
    US:  { deliverables: ['US Federal Return 2024', 'GILTI Analysis', 'State Filings'], status: 'active' },
    LIT: { deliverables: ['CRA Objection — 2021', 'Voluntary Disclosure', 'Tax Court Filing'], status: 'at-risk', openItems: 1 },
  },
  meridian: {
    TC:  { deliverables: ['T2 Corporate Return 2024', 'Instalment Schedules'], status: 'active' },
    TP:  { deliverables: ['T106 Filing', 'IC Pricing Agreements', 'Benchmark Studies'], status: 'review', openItems: 1 },
  },
  atlas: {
    TC:  { deliverables: ['T2 Corporate Return 2024', 'Provincial Filings'], status: 'active' },
    ICT: { deliverables: ['FAPI Workpaper 2025', 'T1134 Schedules'], status: 'review', openItems: 3 },
    IND: { deliverables: ['GST/HST Return Q1', 'Indirect Tax Review'], status: 'active' },
  },
  cascade: {
    TC:  { deliverables: ['T2 Corporate Return 2024'], status: 'complete' },
    'R&D': { deliverables: ['SR&ED Claim 2024', 'ITC Calculations', 'Technical Reports'], status: 'active' },
    IND: { deliverables: ['GST/HST Return Q1'], status: 'active' },
  },
  vantage: {
    'M&A': { deliverables: ['M&A Memo — Project Cedar', 'Due Diligence Report', 'Tax Steps Plan'], status: 'at-risk', openItems: 5 },
    TP:  { deliverables: ['T106 Filing', 'Transaction TP Study'], status: 'active' },
  },
};

// ─── LOS positions in the hub-and-spoke layout ────────────────────────────────
// Matches the ASCII diagram: TP top, TC left, M&A right, IND left-bottom, Pillar2/ICT right-bottom,
// R&D bottom, US top-right, PE bottom-left, LIT top-left
// We use a 6-position clock layout: top, top-right, right, bottom-right, bottom, bottom-left, left, top-left
// Plus center = client hub
//
// Actual layout (8 positions around a center):
//   [TL]  [TC]  [TR]
//   [ML]  HUB   [MR]
//   [BL]  [BC]  [BR]
//
// Mapping:
//   TC  = top-left     ICT = top-center    M&A = top-right
//   IND = mid-left                         US  = mid-right
//   PE  = bot-left     R&D = bot-center    LIT = bot-right  (TP goes above hub)
//
// We'll use a CSS grid approach for precise positioning.

const LOS_POSITIONS: Record<string, { row: number; col: number }> = {
  TC:    { row: 0, col: 0 },  // top-left
  TP:    { row: 0, col: 1 },  // top-center
  'M&A': { row: 0, col: 2 },  // top-right
  IND:   { row: 1, col: 0 },  // mid-left
  // col 1 = hub
  US:    { row: 1, col: 2 },  // mid-right
  PE:    { row: 2, col: 0 },  // bot-left
  'R&D': { row: 2, col: 1 },  // bot-center
  LIT:   { row: 2, col: 2 },  // bot-right
  ICT:   { row: 3, col: 1 },  // extra row below — we'll handle specially
};

// ─── Status pill ──────────────────────────────────────────────────────────────
function StatusPill({ status, openItems }: { status: string; openItems?: number }) {
  if (status === 'at-risk') return (
    <span className="flex items-center gap-1 text-[10px] font-600 text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
      <AlertTriangle size={8} /> {openItems ? `${openItems} exc.` : 'At Risk'}
    </span>
  );
  if (status === 'review') return (
    <span className="flex items-center gap-1 text-[10px] font-600 text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
      <Clock size={8} /> {openItems ? `${openItems} open` : 'In Review'}
    </span>
  );
  if (status === 'complete') return (
    <span className="flex items-center gap-1 text-[10px] font-600 text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
      <CheckCircle2 size={8} /> Complete
    </span>
  );
  return (
    <span className="text-[10px] font-500 text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
      Active
    </span>
  );
}

// ─── LOS Satellite Card ───────────────────────────────────────────────────────
function LOSSatelliteCard({
  losAbbr,
  clientData,
  isActive,
}: {
  losAbbr: string;
  clientData?: { deliverables: string[]; status: string; openItems?: number };
  isActive: boolean;
}) {
  const los = LINES_OF_SERVICE.find(l => l.abbreviation === losAbbr);
  if (!los) return null;

  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-all duration-200 h-full',
        isActive
          ? 'bg-white border-slate-200 shadow-sm'
          : 'bg-slate-50/60 border-slate-150 opacity-40'
      )}
    >
      {/* Card header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-[#0F2044] flex items-center justify-center shrink-0">
            <span className="text-[8px] font-700 text-white leading-none">{los.abbreviation}</span>
          </div>
          <span className={cn(
            'text-[11px] font-700 leading-tight',
            isActive ? 'text-[#0F2044]' : 'text-slate-400'
          )}>
            {los.name}
          </span>
        </div>
        {isActive && clientData && (
          <StatusPill status={clientData.status} openItems={clientData.openItems} />
        )}
      </div>

      {/* Deliverables list */}
      {isActive && clientData ? (
        <ul className="space-y-1">
          {clientData.deliverables.map(d => (
            <li key={d} className="flex items-start gap-1.5 text-[11px] text-slate-600">
              <FileText size={9} className="text-slate-400 mt-0.5 shrink-0" />
              <span className="leading-tight">{d}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[11px] text-slate-400 italic">Not engaged for this client</p>
      )}

      {/* Lead partner */}
      {isActive && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center">
            <span className="text-[8px] font-600 text-slate-500">{los.leadPartnerInitials}</span>
          </div>
          <span className="text-[10px] text-slate-400">{los.leadPartner}</span>
        </div>
      )}
    </div>
  );
}

// ─── Client Hub (center selector) ────────────────────────────────────────────
function ClientHub({
  selected,
  onSelect,
}: {
  selected: CrossLOSClientRow;
  onSelect: (c: CrossLOSClientRow) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex flex-col items-center">
      {/* Hub box */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'w-full max-w-[200px] rounded-xl border-2 border-[#0F2044] bg-[#0F2044] px-4 py-3 shadow-lg',
          'hover:shadow-xl transition-shadow duration-150 text-left'
        )}
      >
        <div className="text-[10px] font-600 text-white/50 uppercase tracking-wider mb-1">Client Group</div>
        <div className="text-[13px] font-700 text-white leading-tight mb-1">{selected.clientName}</div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-white/60">{selected.tier} · {selected.activeLOS.length} LOS active</span>
            <span className="text-[10px] text-white/50">{selected.totalRevenueYTD} YTD</span>
          </div>
          <ChevronDown
            size={14}
            className={cn('text-white/60 transition-transform duration-150', open && 'rotate-180')}
          />
        </div>
      </button>

      {/* Shared data badges */}
      <div className="mt-2 flex flex-wrap justify-center gap-1 max-w-[200px]">
        {selected.sharedDataSets.map(ds => (
          <span
            key={ds}
            className="text-[9px] px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-500"
          >
            {ds}
          </span>
        ))}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-2 z-50 w-56 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-fade-slide-up">
          <div className="px-3 py-2 border-b border-slate-100">
            <span className="text-[10px] font-600 text-slate-400 uppercase tracking-wider">Select Client</span>
          </div>
          {CROSS_LOS_CLIENTS.map(c => (
            <button
              key={c.clientId}
              onClick={() => { onSelect(c); setOpen(false); }}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-slate-50 transition-colors',
                c.clientId === selected.clientId && 'bg-slate-50'
              )}
            >
              <div>
                <div className="text-[12px] font-600 text-slate-800">{c.clientName}</div>
                <div className="text-[10px] text-slate-400">{c.tier} · {c.activeLOS.length} LOS</div>
              </div>
              {c.clientId === selected.clientId && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#0F2044] shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SVG Connector Lines ──────────────────────────────────────────────────────
// Draws lines from the hub (center of grid) to each active LOS card.
// Uses a ResizeObserver to get real positions.
function ConnectorLines({
  containerRef,
  hubRef,
  cardRefs,
  activeLOS,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  hubRef: React.RefObject<HTMLDivElement | null>;
  cardRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  activeLOS: string[];
}) {
  const [lines, setLines] = useState<Array<{ x1: number; y1: number; x2: number; y2: number; active: boolean; key: string }>>([]);

  useEffect(() => {
    function compute() {
      if (!containerRef.current || !hubRef.current) return;
      const cr = containerRef.current.getBoundingClientRect();
      const hr = hubRef.current.getBoundingClientRect();
      const hx = hr.left + hr.width / 2 - cr.left;
      const hy = hr.top + hr.height / 2 - cr.top;

      const newLines = Object.entries(cardRefs.current).map(([abbr, el]) => {
        if (!el) return null;
        const er = el.getBoundingClientRect();
        const ex = er.left + er.width / 2 - cr.left;
        const ey = er.top + er.height / 2 - cr.top;
        return { x1: hx, y1: hy, x2: ex, y2: ey, active: activeLOS.includes(abbr), key: abbr };
      }).filter(Boolean) as typeof lines;

      setLines(newLines);
    }

    compute();
    const ro = new ResizeObserver(compute);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', compute);
    return () => { ro.disconnect(); window.removeEventListener('resize', compute); };
  }, [containerRef, hubRef, cardRefs, activeLOS]);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden
    >
      {lines.map(l => (
        <line
          key={l.key}
          x1={l.x1} y1={l.y1}
          x2={l.x2} y2={l.y2}
          stroke={l.active ? '#CBD5E1' : '#E2E8F0'}
          strokeWidth={l.active ? 1.5 : 1}
          strokeDasharray={l.active ? undefined : '4 4'}
          opacity={l.active ? 0.8 : 0.4}
        />
      ))}
    </svg>
  );
}

// ─── Main 360 Map Component ───────────────────────────────────────────────────
export default function ClientIntelligenceMap() {
  const [selectedClient, setSelectedClient] = useState<CrossLOSClientRow>(CROSS_LOS_CLIENTS[0]);
  const containerRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const clientLosData = CLIENT_LOS_DATA[selectedClient.clientId] ?? {};
  const activeLOS = selectedClient.activeLOS;

  // All 9 LOS abbreviations in layout order
  const ALL_LOS = ['TC', 'TP', 'M&A', 'IND', 'US', 'PE', 'R&D', 'LIT', 'ICT'];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-700 text-[#0F2044]">360° Client Intelligence MAP</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Select a client to see all active Lines of Service and their deliverables
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-3 h-px bg-slate-300 inline-block" />
            Active LOS
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-3 h-px bg-slate-200 inline-block border-dashed border-t border-slate-300" style={{ borderTopStyle: 'dashed' }} />
            Not engaged
          </div>
        </div>
      </div>

      {/* Map area */}
      <div
        ref={containerRef}
        className="relative p-6"
        style={{ minHeight: 520 }}
      >
        {/* SVG lines layer */}
        <ConnectorLines
          containerRef={containerRef}
          hubRef={hubRef}
          cardRefs={cardRefs}
          activeLOS={activeLOS}
        />

        {/* Grid layout — 3 cols × 3 rows + center hub */}
        {/* We use a CSS grid: 3 columns, 3 rows. Hub is at [1,1] (center). */}
        <div
          className="relative z-10 grid gap-4"
          style={{
            gridTemplateColumns: '1fr auto 1fr',
            gridTemplateRows: 'auto auto auto',
            alignItems: 'center',
          }}
        >
          {/* Row 0: TC | TP | M&A */}
          <div
            ref={el => { cardRefs.current['TC'] = el; }}
            style={{ gridRow: 1, gridColumn: 1 }}
          >
            <LOSSatelliteCard
              losAbbr="TC"
              clientData={clientLosData['TC']}
              isActive={activeLOS.includes('TC')}
            />
          </div>

          <div
            ref={el => { cardRefs.current['TP'] = el; }}
            style={{ gridRow: 1, gridColumn: 2 }}
          >
            <LOSSatelliteCard
              losAbbr="TP"
              clientData={clientLosData['TP']}
              isActive={activeLOS.includes('TP')}
            />
          </div>

          <div
            ref={el => { cardRefs.current['M&A'] = el; }}
            style={{ gridRow: 1, gridColumn: 3 }}
          >
            <LOSSatelliteCard
              losAbbr="M&A"
              clientData={clientLosData['M&A']}
              isActive={activeLOS.includes('M&A')}
            />
          </div>

          {/* Row 1: IND | HUB | US */}
          <div
            ref={el => { cardRefs.current['IND'] = el; }}
            style={{ gridRow: 2, gridColumn: 1 }}
          >
            <LOSSatelliteCard
              losAbbr="IND"
              clientData={clientLosData['IND']}
              isActive={activeLOS.includes('IND')}
            />
          </div>

          {/* CENTER HUB */}
          <div
            ref={hubRef}
            style={{ gridRow: 2, gridColumn: 2 }}
            className="flex justify-center"
          >
            <ClientHub selected={selectedClient} onSelect={setSelectedClient} />
          </div>

          <div
            ref={el => { cardRefs.current['US'] = el; }}
            style={{ gridRow: 2, gridColumn: 3 }}
          >
            <LOSSatelliteCard
              losAbbr="US"
              clientData={clientLosData['US']}
              isActive={activeLOS.includes('US')}
            />
          </div>

          {/* Row 2: PE | R&D | LIT */}
          <div
            ref={el => { cardRefs.current['PE'] = el; }}
            style={{ gridRow: 3, gridColumn: 1 }}
          >
            <LOSSatelliteCard
              losAbbr="PE"
              clientData={clientLosData['PE']}
              isActive={activeLOS.includes('PE')}
            />
          </div>

          <div
            ref={el => { cardRefs.current['R&D'] = el; }}
            style={{ gridRow: 3, gridColumn: 2 }}
          >
            <LOSSatelliteCard
              losAbbr="R&D"
              clientData={clientLosData['R&D']}
              isActive={activeLOS.includes('R&D')}
            />
          </div>

          <div
            ref={el => { cardRefs.current['LIT'] = el; }}
            style={{ gridRow: 3, gridColumn: 3 }}
          >
            <LOSSatelliteCard
              losAbbr="LIT"
              clientData={clientLosData['LIT']}
              isActive={activeLOS.includes('LIT')}
            />
          </div>
        </div>

        {/* ICT — extra row below, centered */}
        <div className="relative z-10 flex justify-center mt-4">
          <div
            ref={el => { cardRefs.current['ICT'] = el; }}
            className="w-full max-w-[240px]"
          >
            <LOSSatelliteCard
              losAbbr="ICT"
              clientData={clientLosData['ICT']}
              isActive={activeLOS.includes('ICT')}
            />
          </div>
        </div>
      </div>

      {/* Footer — shared data summary */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-600 text-slate-400 uppercase tracking-wider">Shared Data Sets:</span>
          {selectedClient.sharedDataSets.map(ds => (
            <span
              key={ds}
              className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 bg-white text-slate-600"
            >
              {ds}
            </span>
          ))}
        </div>
        <button
          onClick={() => {
            if (selectedClient.clientId === 'northstar') {
              window.location.href = '/client/northstar';
            } else {
              toast.info(`${selectedClient.clientName} — client workspace coming soon`);
            }
          }}
          className="flex items-center gap-1 text-[11px] text-[#1B5FD4] hover:underline"
        >
          Open Client Workspace <ChevronRight size={11} />
        </button>
      </div>
    </div>
  );
}
