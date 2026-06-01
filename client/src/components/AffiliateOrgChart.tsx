// AffiliateOrgChart — Northstar Holdings Inc. corporate structure
// Design: Precision Instrument — grayscale + deep navy (#0F2044)
// Shows parent → subsidiaries → sub-subsidiaries with ownership % and country of residence
// Clicking any node opens the same tax attributes panel as the world map

import { useState } from 'react';
import {
  Building2, MapPin, X, ChevronDown, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Org structure ────────────────────────────────────────────────────────────
interface OrgNode {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  ownership: number | null; // null = parent
  type: 'parent' | 'subsidiary' | 'sub-subsidiary';
  parentId: string | null;
  legalForm: string;
  taxYear: string;
  currency: string;
  taxableIncome: string;
  fapiIncome: string;
  exemptSurplus: string;
  taxableSurplus: string;
  preAcquisitionSurplus: string;
  children?: string[]; // child node IDs
}

const ORG_NODES: OrgNode[] = [
  {
    id: 'northstar-ca',
    name: 'Northstar Holdings Inc.',
    country: 'Canada',
    countryCode: 'CA',
    ownership: null,
    type: 'parent',
    parentId: null,
    legalForm: 'Corporation (QBCA)',
    taxYear: '2024',
    currency: 'CAD',
    taxableIncome: '45,200,000',
    fapiIncome: '—',
    exemptSurplus: '—',
    taxableSurplus: '—',
    preAcquisitionSurplus: '—',
    children: ['northstar-us', 'northstar-uk', 'northstar-de', 'northstar-lu', 'northstar-sg', 'northstar-au', 'northstar-mx'],
  },
  {
    id: 'northstar-us',
    name: 'Northstar Corp (US)',
    country: 'United States',
    countryCode: 'US',
    ownership: 100,
    type: 'subsidiary',
    parentId: 'northstar-ca',
    legalForm: 'Corporation (Delaware)',
    taxYear: '2024',
    currency: 'USD',
    taxableIncome: '22,400,000',
    fapiIncome: '1,200,000',
    exemptSurplus: '—',
    taxableSurplus: '18,700,000',
    preAcquisitionSurplus: '4,500,000',
    children: ['northstar-finance-llc'],
  },
  {
    id: 'northstar-finance-llc',
    name: 'Northstar Finance LLC',
    country: 'United States',
    countryCode: 'US',
    ownership: 100,
    type: 'sub-subsidiary',
    parentId: 'northstar-us',
    legalForm: 'LLC (Delaware)',
    taxYear: '2024',
    currency: 'USD',
    taxableIncome: '3,100,000',
    fapiIncome: '2,900,000',
    exemptSurplus: '—',
    taxableSurplus: '3,100,000',
    preAcquisitionSurplus: '—',
    children: [],
  },
  {
    id: 'northstar-uk',
    name: 'Northstar UK Ltd',
    country: 'United Kingdom',
    countryCode: 'GB',
    ownership: 100,
    type: 'subsidiary',
    parentId: 'northstar-ca',
    legalForm: 'Private Limited Company',
    taxYear: '2024',
    currency: 'GBP',
    taxableIncome: '8,120,000',
    fapiIncome: '—',
    exemptSurplus: '14,300,000',
    taxableSurplus: '2,100,000',
    preAcquisitionSurplus: '3,400,000',
    children: [],
  },
  {
    id: 'northstar-de',
    name: 'Northstar GmbH',
    country: 'Germany',
    countryCode: 'DE',
    ownership: 100,
    type: 'subsidiary',
    parentId: 'northstar-ca',
    legalForm: 'GmbH',
    taxYear: '2024',
    currency: 'EUR',
    taxableIncome: '5,670,000',
    fapiIncome: '320,000',
    exemptSurplus: '9,800,000',
    taxableSurplus: '1,450,000',
    preAcquisitionSurplus: '2,100,000',
    children: ['northstar-fr', 'northstar-ie'],
  },
  {
    id: 'northstar-fr',
    name: 'Northstar Paris SAS',
    country: 'France',
    countryCode: 'FR',
    ownership: 100,
    type: 'sub-subsidiary',
    parentId: 'northstar-de',
    legalForm: 'SAS',
    taxYear: '2024',
    currency: 'EUR',
    taxableIncome: '2,340,000',
    fapiIncome: '180,000',
    exemptSurplus: '4,120,000',
    taxableSurplus: '890,000',
    preAcquisitionSurplus: '1,200,000',
    children: [],
  },
  {
    id: 'northstar-ie',
    name: 'Northstar Ireland Ltd',
    country: 'Ireland',
    countryCode: 'IE',
    ownership: 100,
    type: 'sub-subsidiary',
    parentId: 'northstar-de',
    legalForm: 'Private Limited Company',
    taxYear: '2024',
    currency: 'EUR',
    taxableIncome: '6,780,000',
    fapiIncome: '4,200,000',
    exemptSurplus: '12,400,000',
    taxableSurplus: '6,780,000',
    preAcquisitionSurplus: '800,000',
    children: [],
  },
  {
    id: 'northstar-lu',
    name: 'Northstar Capital S.à r.l.',
    country: 'Luxembourg',
    countryCode: 'LU',
    ownership: 100,
    type: 'subsidiary',
    parentId: 'northstar-ca',
    legalForm: 'S.à r.l.',
    taxYear: '2024',
    currency: 'EUR',
    taxableIncome: '1,890,000',
    fapiIncome: '1,650,000',
    exemptSurplus: '6,200,000',
    taxableSurplus: '440,000',
    preAcquisitionSurplus: '900,000',
    children: [],
  },
  {
    id: 'northstar-sg',
    name: 'Northstar Asia Pte Ltd',
    country: 'Singapore',
    countryCode: 'SG',
    ownership: 100,
    type: 'subsidiary',
    parentId: 'northstar-ca',
    legalForm: 'Private Limited',
    taxYear: '2024',
    currency: 'SGD',
    taxableIncome: '4,560,000',
    fapiIncome: '210,000',
    exemptSurplus: '7,800,000',
    taxableSurplus: '980,000',
    preAcquisitionSurplus: '1,600,000',
    children: [],
  },
  {
    id: 'northstar-au',
    name: 'Northstar Australia Pty Ltd',
    country: 'Australia',
    countryCode: 'AU',
    ownership: 100,
    type: 'subsidiary',
    parentId: 'northstar-ca',
    legalForm: 'Proprietary Limited',
    taxYear: '2024',
    currency: 'AUD',
    taxableIncome: '3,240,000',
    fapiIncome: '—',
    exemptSurplus: '5,100,000',
    taxableSurplus: '720,000',
    preAcquisitionSurplus: '1,100,000',
    children: [],
  },
  {
    id: 'northstar-mx',
    name: 'Northstar México S.A.',
    country: 'Mexico',
    countryCode: 'MX',
    ownership: 100,
    type: 'subsidiary',
    parentId: 'northstar-ca',
    legalForm: 'S.A. de C.V.',
    taxYear: '2024',
    currency: 'MXN',
    taxableIncome: '1,120,000',
    fapiIncome: '890,000',
    exemptSurplus: '1,800,000',
    taxableSurplus: '340,000',
    preAcquisitionSurplus: '500,000',
    children: [],
  },
];

const NODE_MAP = Object.fromEntries(ORG_NODES.map(n => [n.id, n]));

// ─── Country flag emoji helper ─────────────────────────────────────────────────
function countryFlag(code: string): string {
  const flags: Record<string, string> = {
    CA: '🇨🇦', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷',
    LU: '🇱🇺', SG: '🇸🇬', AU: '🇦🇺', MX: '🇲🇽', IE: '🇮🇪',
  };
  return flags[code] ?? '🌐';
}

// ─── Node card ─────────────────────────────────────────────────────────────────
function OrgNodeCard({
  node,
  isSelected,
  onClick,
  size = 'md',
}: {
  node: OrgNode;
  isSelected: boolean;
  onClick: () => void;
  size?: 'lg' | 'md' | 'sm';
}) {
  const hasFapi = node.fapiIncome !== '—' && node.fapiIncome !== '0';

  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-xl border text-left transition-all duration-150 active:scale-95',
        size === 'lg' ? 'px-4 py-3 min-w-[200px]' : size === 'md' ? 'px-3 py-2.5 min-w-[160px]' : 'px-2.5 py-2 min-w-[140px]',
        isSelected
          ? 'bg-[#0F2044] border-[#0F2044] shadow-lg shadow-[#0F2044]/20 text-white'
          : 'bg-white border-slate-200 hover:border-[#0F2044]/40 hover:shadow-sm text-slate-800'
      )}
    >
      <div className="flex items-start gap-2">
        <div className={cn(
          'rounded-lg flex items-center justify-center shrink-0',
          size === 'lg' ? 'w-8 h-8' : 'w-6 h-6',
          isSelected ? 'bg-white/20' : 'bg-slate-100'
        )}>
          <Building2 size={size === 'lg' ? 15 : 12} className={isSelected ? 'text-white' : 'text-[#0F2044]'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn(
            'font-semibold leading-tight truncate',
            size === 'lg' ? 'text-[13px]' : 'text-[11px]',
            isSelected ? 'text-white' : 'text-[#0F2044]'
          )}>
            {node.name}
          </div>
          <div className={cn(
            'flex items-center gap-1 mt-0.5',
            size === 'lg' ? 'text-[11px]' : 'text-[10px]',
            isSelected ? 'text-white/70' : 'text-slate-400'
          )}>
            <span>{countryFlag(node.countryCode)}</span>
            <span>{node.country}</span>
            {node.ownership !== null && (
              <span className={cn(
                'ml-1 px-1 rounded text-[9px] font-semibold',
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              )}>
                {node.ownership}%
              </span>
            )}
          </div>
          {hasFapi && (
            <div className={cn(
              'mt-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full inline-block',
              isSelected ? 'bg-amber-400/30 text-amber-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            )}>
              FAPI
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Tax attributes panel ──────────────────────────────────────────────────────
function TaxPanel({ node, onClose }: { node: OrgNode; onClose: () => void }) {
  const [affiliateTab, setAffiliateTab] = useState<'income' | 'surplus'>('income');

  return (
    <div className="w-80 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shrink-0 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base">{countryFlag(node.countryCode)}</span>
            <span className="text-[13px] font-bold text-[#0F2044] leading-tight">{node.name}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
            <MapPin size={9} />
            {node.country} · {node.legalForm}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <X size={12} className="text-slate-500" />
        </button>
      </div>

      {/* Mini tabs */}
      <div className="flex border-b border-slate-100">
        {(['income', 'surplus'] as const).map(t => (
          <button
            key={t}
            onClick={() => setAffiliateTab(t)}
            className={cn(
              'flex-1 text-[11px] py-2 font-medium transition-colors',
              affiliateTab === t
                ? 'text-[#0F2044] border-b-2 border-[#0F2044]'
                : 'text-slate-400 hover:text-slate-600'
            )}
          >
            {t === 'income' ? 'Income' : 'Surplus Balances'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-3">
        <div className="text-[10px] text-slate-400 mb-2">FY {node.taxYear} · {node.currency}</div>

        {affiliateTab === 'income' ? (
          <div className="space-y-2">
            {[
              { label: 'Taxable Income / (Loss)', value: node.taxableIncome, color: 'text-slate-800' },
              {
                label: 'FAPI Income',
                value: node.fapiIncome,
                color: node.fapiIncome !== '—' && node.fapiIncome !== '0' ? 'text-amber-700' : 'text-slate-400'
              },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-[11px] text-slate-600">{row.label}</span>
                <span className={cn('text-[12px] font-semibold tabular-nums', row.color)}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {[
              { label: 'Exempt Surplus', value: node.exemptSurplus, color: 'text-emerald-700' },
              { label: 'Taxable Surplus', value: node.taxableSurplus, color: 'text-slate-800' },
              { label: 'Pre-Acquisition Surplus', value: node.preAcquisitionSurplus, color: 'text-slate-600' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-[11px] text-slate-600">{row.label}</span>
                <span className={cn('text-[12px] font-semibold tabular-nums', row.color)}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-3 space-y-1.5 border-t border-slate-100 pt-3">
        <button
          onClick={() => toast.info('Open FAPI Calculator — coming soon')}
          className="w-full text-[11px] font-semibold py-2 rounded-lg bg-[#0F2044] text-white hover:bg-[#1a3060] transition-colors"
        >
          Open in FAPI Calculator →
        </button>
        <button
          onClick={() => toast.info('Open Surplus Calculator — coming soon')}
          className="w-full text-[11px] py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300 transition-colors"
        >
          Open in Surplus Calculator
        </button>
      </div>
    </div>
  );
}

// ─── Connector SVG lines ───────────────────────────────────────────────────────
// We render the org chart as a flex layout and overlay SVG connectors
// using a ref-based approach. For simplicity, we use CSS border-based connectors.

// ─── Org chart tree ────────────────────────────────────────────────────────────
function OrgTree({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const parent = ORG_NODES.find(n => n.type === 'parent')!;
  const directChildren = ORG_NODES.filter(n => n.parentId === parent.id);

  return (
    <div className="flex-1 overflow-auto p-6">
      {/* Parent */}
      <div className="flex justify-center mb-0">
        <div className="flex flex-col items-center">
          <OrgNodeCard
            node={parent}
            isSelected={selectedId === parent.id}
            onClick={() => onSelect(parent.id)}
            size="lg"
          />
          {/* Vertical line down */}
          <div className="w-px h-6 bg-slate-300" />
        </div>
      </div>

      {/* Horizontal connector bar */}
      <div className="relative flex justify-center">
        <div
          className="h-px bg-slate-300"
          style={{ width: `${Math.min(directChildren.length * 180, 1100)}px` }}
        />
      </div>

      {/* Direct children */}
      <div className="flex justify-center gap-4 mt-0">
        {directChildren.map((child, idx) => {
          const grandChildren = ORG_NODES.filter(n => n.parentId === child.id);
          const isFirst = idx === 0;
          const isLast = idx === directChildren.length - 1;
          const isMiddle = !isFirst && !isLast;

          return (
            <div key={child.id} className="flex flex-col items-center">
              {/* Vertical line from bar down to card */}
              <div className="w-px h-6 bg-slate-300" />

              <OrgNodeCard
                node={child}
                isSelected={selectedId === child.id}
                onClick={() => onSelect(child.id)}
                size="md"
              />

              {/* Sub-children */}
              {grandChildren.length > 0 && (
                <>
                  <div className="w-px h-4 bg-slate-300" />
                  {/* Horizontal bar for grandchildren */}
                  {grandChildren.length > 1 && (
                    <div
                      className="h-px bg-slate-300"
                      style={{ width: `${grandChildren.length * 160}px` }}
                    />
                  )}
                  <div className="flex gap-3 mt-0">
                    {grandChildren.map(gc => (
                      <div key={gc.id} className="flex flex-col items-center">
                        <div className="w-px h-4 bg-slate-300" />
                        <OrgNodeCard
                          node={gc}
                          isSelected={selectedId === gc.id}
                          onClick={() => onSelect(gc.id)}
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-8 justify-center">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <div className="w-3 h-3 rounded bg-[#0F2044]" />
          Selected
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
          Has FAPI income
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-1 rounded">100%</span>
          Ownership
        </div>
      </div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────
export default function AffiliateOrgChart() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedNode = selectedId ? NODE_MAP[selectedId] : null;

  return (
    <div className="flex gap-4 h-full min-h-[520px]">
      {/* Chart area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden relative">
        {/* Header */}
        <div className="absolute top-3 left-3 z-10">
          <div className="text-[11px] font-semibold text-slate-700 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg px-2.5 py-1.5">
            <Building2 size={11} className="inline mr-1.5 text-[#0F2044]" />
            Corporate Structure — Northstar Holdings Inc.
          </div>
        </div>

        <OrgTree selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      {/* Side panel */}
      {selectedNode ? (
        <TaxPanel node={selectedNode} onClose={() => setSelectedId(null)} />
      ) : (
        <div className="w-80 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center shrink-0 text-center px-6">
          <Building2 size={32} className="text-slate-300 mb-3" />
          <div className="text-[13px] font-semibold text-slate-600 mb-1">Select an entity</div>
          <div className="text-[11px] text-slate-400 leading-relaxed">
            Click any entity in the org chart to view its tax attributes, surplus balances, and FAPI income.
          </div>
          <div className="mt-4 text-[10px] text-slate-400">
            {ORG_NODES.length} entities · {ORG_NODES.filter(n => n.fapiIncome !== '—' && n.fapiIncome !== '0').length} with FAPI income
          </div>
        </div>
      )}
    </div>
  );
}
