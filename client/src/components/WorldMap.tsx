// WorldMap.tsx
// Renders a proper SVG world map using topojson-client + countries-50m.json
// Active countries are highlighted in deep navy; clicking opens the affiliate panel.
// Uses a simple equirectangular projection (no d3-geo dependency needed).

import { useState, useEffect, useRef } from 'react';
import { feature } from 'topojson-client';
import { Globe, MapPin, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AffiliateData {
  name: string;
  taxableIncome: string;
  fapiIncome: string;
  exemptSurplus: string;
  taxableSurplus: string;
  preAcquisitionSurplus: string;
  taxYear: string;
  currency: string;
}

interface CountryData {
  countryName: string;
  affiliates: AffiliateData[];
}

// ─── Foreign affiliates data ──────────────────────────────────────────────────
const FOREIGN_AFFILIATES: Record<string, CountryData> = {
  FR: {
    countryName: 'France',
    affiliates: [{
      name: 'Northstar Paris SAS',
      taxableIncome: '2,340,000', fapiIncome: '180,000',
      exemptSurplus: '4,120,000', taxableSurplus: '890,000',
      preAcquisitionSurplus: '1,200,000', taxYear: '2024', currency: 'EUR',
    }],
  },
  DE: {
    countryName: 'Germany',
    affiliates: [{
      name: 'Northstar GmbH',
      taxableIncome: '5,670,000', fapiIncome: '320,000',
      exemptSurplus: '9,800,000', taxableSurplus: '1,450,000',
      preAcquisitionSurplus: '2,100,000', taxYear: '2024', currency: 'EUR',
    }],
  },
  GB: {
    countryName: 'United Kingdom',
    affiliates: [{
      name: 'Northstar UK Ltd',
      taxableIncome: '8,120,000', fapiIncome: '0',
      exemptSurplus: '14,300,000', taxableSurplus: '2,100,000',
      preAcquisitionSurplus: '3,400,000', taxYear: '2024', currency: 'GBP',
    }],
  },
  US: {
    countryName: 'United States',
    affiliates: [
      {
        name: 'Northstar Corp (US)',
        taxableIncome: '22,400,000', fapiIncome: '1,200,000',
        exemptSurplus: '0', taxableSurplus: '18,700,000',
        preAcquisitionSurplus: '4,500,000', taxYear: '2024', currency: 'USD',
      },
      {
        name: 'Northstar Finance LLC',
        taxableIncome: '3,100,000', fapiIncome: '2,900,000',
        exemptSurplus: '0', taxableSurplus: '3,100,000',
        preAcquisitionSurplus: '0', taxYear: '2024', currency: 'USD',
      },
    ],
  },
  LU: {
    countryName: 'Luxembourg',
    affiliates: [{
      name: 'Northstar Capital S.à r.l.',
      taxableIncome: '1,890,000', fapiIncome: '1,650,000',
      exemptSurplus: '6,200,000', taxableSurplus: '440,000',
      preAcquisitionSurplus: '900,000', taxYear: '2024', currency: 'EUR',
    }],
  },
  SG: {
    countryName: 'Singapore',
    affiliates: [{
      name: 'Northstar Asia Pte Ltd',
      taxableIncome: '4,560,000', fapiIncome: '210,000',
      exemptSurplus: '7,800,000', taxableSurplus: '980,000',
      preAcquisitionSurplus: '1,600,000', taxYear: '2024', currency: 'SGD',
    }],
  },
  AU: {
    countryName: 'Australia',
    affiliates: [{
      name: 'Northstar Australia Pty Ltd',
      taxableIncome: '3,240,000', fapiIncome: '0',
      exemptSurplus: '5,100,000', taxableSurplus: '720,000',
      preAcquisitionSurplus: '1,100,000', taxYear: '2024', currency: 'AUD',
    }],
  },
  MX: {
    countryName: 'Mexico',
    affiliates: [{
      name: 'Northstar México S.A.',
      taxableIncome: '1,120,000', fapiIncome: '890,000',
      exemptSurplus: '1,800,000', taxableSurplus: '340,000',
      preAcquisitionSurplus: '500,000', taxYear: '2024', currency: 'MXN',
    }],
  },
  IE: {
    countryName: 'Ireland',
    affiliates: [{
      name: 'Northstar Ireland Ltd',
      taxableIncome: '6,780,000', fapiIncome: '4,200,000',
      exemptSurplus: '2,300,000', taxableSurplus: '6,780,000',
      preAcquisitionSurplus: '800,000', taxYear: '2024', currency: 'EUR',
    }],
  },
};

// ISO numeric → ISO alpha-2 mapping (zero-padded strings as they appear in topojson)
const NUMERIC_TO_ALPHA2: Record<string, string> = {
  '250': 'FR',
  '276': 'DE',
  '826': 'GB',
  '840': 'US',
  '442': 'LU',
  '702': 'SG',
  '036': 'AU',
  '484': 'MX',
  '372': 'IE',
  '124': 'CA',
};

// ─── Simple equirectangular projection ───────────────────────────────────────
// Maps [lon, lat] → [x, y] in a 960×500 viewBox
function project(lon: number, lat: number): [number, number] {
  const x = (lon + 180) * (960 / 360);
  const y = (90 - lat) * (500 / 180);
  return [x, y];
}

// Convert a GeoJSON geometry to SVG path string
function geometryToPath(geometry: GeoJSON.Geometry): string {
  const parts: string[] = [];

  function ringToPath(coords: number[][]): string {
    return coords.map((c, i) => {
      const [x, y] = project(c[0], c[1]);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ') + ' Z';
  }

  if (geometry.type === 'Polygon') {
    parts.push(ringToPath(geometry.coordinates[0]));
  } else if (geometry.type === 'MultiPolygon') {
    for (const poly of geometry.coordinates) {
      parts.push(ringToPath(poly[0]));
    }
  }
  return parts.join(' ');
}

// ─── Side Panel ───────────────────────────────────────────────────────────────
function AffiliatePanel({
  countryCode,
  onClose,
}: {
  countryCode: string;
  onClose: () => void;
}) {
  const countryData = FOREIGN_AFFILIATES[countryCode];
  const [selectedAffiliate, setSelectedAffiliate] = useState(countryData.affiliates[0].name);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const affiliate = countryData.affiliates.find(a => a.name === selectedAffiliate)!;

  return (
    <div className="w-72 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shrink-0 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
        <div>
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-[#0F2044]" />
            <span className="text-[13px] font-bold text-[#0F2044]">{countryData.countryName}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {countryData.affiliates.length} foreign affiliate{countryData.affiliates.length !== 1 ? 's' : ''}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <X size={12} className="text-slate-500" />
        </button>
      </div>

      {/* Affiliate selector */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Foreign Affiliate</div>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="w-full flex items-center justify-between text-[12px] font-semibold text-[#0F2044] bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 hover:border-slate-300 transition-colors"
          >
            <span className="truncate">{selectedAffiliate}</span>
            <ChevronDown size={13} className="text-slate-400 shrink-0 ml-2" />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
              {countryData.affiliates.map(a => (
                <button
                  key={a.name}
                  onClick={() => { setSelectedAffiliate(a.name); setDropdownOpen(false); }}
                  className={cn(
                    'w-full text-left px-3 py-2 text-[12px] transition-colors',
                    a.name === selectedAffiliate
                      ? 'bg-slate-50 text-[#0F2044] font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {a.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tax attributes */}
      <div className="flex-1 overflow-auto px-4 py-3 space-y-3">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Tax Attributes — FY {affiliate.taxYear} ({affiliate.currency})
        </div>

        {/* Income */}
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-2">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Income</div>
          {[
            { label: 'Taxable Income / (Loss)', value: affiliate.taxableIncome, color: 'text-slate-800' },
            { label: 'FAPI Income', value: affiliate.fapiIncome, color: affiliate.fapiIncome !== '0' ? 'text-amber-700' : 'text-slate-400' },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-[11px] text-slate-600">{row.label}</span>
              <span className={cn('text-[12px] font-semibold tabular-nums font-mono', row.color)}>
                {row.value === '0' ? '—' : row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Surplus balances */}
        <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-2">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Surplus Balances</div>
          {[
            { label: 'Exempt Surplus', value: affiliate.exemptSurplus, color: 'text-emerald-700' },
            { label: 'Taxable Surplus', value: affiliate.taxableSurplus, color: 'text-slate-800' },
            { label: 'Pre-Acquisition Surplus', value: affiliate.preAcquisitionSurplus, color: 'text-slate-600' },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-[11px] text-slate-600">{row.label}</span>
              <span className={cn('text-[12px] font-semibold tabular-nums font-mono', row.color)}>
                {row.value === '0' ? '—' : row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="pt-1 space-y-1.5">
          <button
            onClick={() => toast.info('Open FAPI Calculator for this affiliate — coming soon')}
            className="w-full text-[11px] font-semibold py-2 rounded-lg bg-[#0F2044] text-white hover:bg-[#1a3060] transition-colors"
          >
            Open in FAPI Calculator →
          </button>
          <button
            onClick={() => toast.info('Open Surplus Calculator — coming soon')}
            className="w-full text-[11px] py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800 transition-colors"
          >
            Open in Surplus Calculator
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── World Map ────────────────────────────────────────────────────────────────
export default function WorldMap() {
  const [paths, setPaths] = useState<Array<{ id: string; alpha2: string | null; d: string }>>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const activeCountries = Object.keys(FOREIGN_AFFILIATES);

  useEffect(() => {
    fetch('/countries-50m.json')
      .then(r => r.json())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((topo: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const geojson = feature(topo as any, (topo as any).objects.countries) as unknown as GeoJSON.FeatureCollection;

        const result = geojson.features.map(f => {
          const numericId = String(f.id ?? '');
          const alpha2 = NUMERIC_TO_ALPHA2[numericId] ?? null;
          const d = geometryToPath(f.geometry);
          return { id: numericId, alpha2, d };
        });
        setPaths(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleClick(alpha2: string | null) {
    if (!alpha2 || !activeCountries.includes(alpha2)) return;
    setSelectedCountry(alpha2);
  }

  return (
    <div className="flex gap-4 h-full min-h-[480px]">
      {/* Map */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden relative">
        {/* Legend */}
        <div className="absolute top-3 left-3 z-10">
          <div className="text-[11px] font-semibold text-slate-700 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
            <Globe size={11} className="text-[#0F2044]" />
            Foreign Affiliates — Northstar Holdings Inc.
          </div>
        </div>
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <div className="w-3 h-3 rounded-sm bg-[#0F2044]/25 border border-[#0F2044]/40" />
            Active affiliate
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <div className="w-3 h-3 rounded-sm bg-[#0F2044] border border-[#0F2044]" />
            Selected
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            Loading map…
          </div>
        ) : (
          <svg
            viewBox="0 0 960 500"
            className="w-full h-full"
            style={{ background: '#e8eef4' }}
          >
            {paths.map(({ id, alpha2, d }) => {
              if (!d) return null;
              const isActive = alpha2 !== null && activeCountries.includes(alpha2);
              const isSelected = alpha2 !== null && selectedCountry === alpha2;
              const isHovered = alpha2 !== null && hoveredCountry === alpha2;
              const isCanada = alpha2 === 'CA';

              return (
                <path
                  key={id}
                  d={d}
                  fill={
                    isSelected ? '#0F2044' :
                    isCanada ? '#1e3a5f' :
                    isActive && isHovered ? '#1a3060' :
                    isActive ? '#0F2044' :
                    '#c8d4e0'
                  }
                  fillOpacity={
                    isSelected ? 1 :
                    isCanada ? 0.12 :
                    isActive && isHovered ? 0.55 :
                    isActive ? 0.28 :
                    1
                  }
                  stroke={isActive || isCanada ? '#0F2044' : '#b0bec5'}
                  strokeWidth={isSelected ? 1.2 : isActive ? 0.6 : 0.3}
                  strokeOpacity={isSelected ? 1 : isActive ? 0.5 : 0.4}
                  className={isActive ? 'cursor-pointer' : 'cursor-default'}
                  onMouseEnter={() => isActive && setHoveredCountry(alpha2)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => handleClick(alpha2)}
                />
              );
            })}

            {/* Country name labels for active countries */}
            {paths
              .filter(p => p.alpha2 && activeCountries.includes(p.alpha2) && p.alpha2 !== 'CA')
              .map(({ alpha2 }) => {
                if (!alpha2) return null;
                const data = FOREIGN_AFFILIATES[alpha2];
                // Approximate label positions
                const labelPos: Record<string, [number, number]> = {
                  FR: [108, 210], DE: [130, 195], GB: [90, 185],
                  IE: [75, 190], LU: [118, 205], US: [200, 230],
                  MX: [175, 280], SG: [720, 310], AU: [750, 380],
                };
                const [lx, ly] = labelPos[alpha2] ?? [0, 0];
                if (!lx) return null;
                const isSelected = selectedCountry === alpha2;
                return (
                  <g key={`label-${alpha2}`} className="cursor-pointer" onClick={() => handleClick(alpha2)}>
                    <circle cx={lx} cy={ly} r="4" fill={isSelected ? '#0F2044' : '#0F2044'} fillOpacity={isSelected ? 1 : 0.7} />
                    <text
                      x={lx + 6} y={ly + 4}
                      fontSize="9"
                      fill={isSelected ? '#0F2044' : '#334155'}
                      fontWeight={isSelected ? '700' : '500'}
                      fontFamily="IBM Plex Sans, sans-serif"
                    >
                      {data.countryName}
                    </text>
                  </g>
                );
              })}
          </svg>
        )}

        {/* Hover tooltip */}
        {hoveredCountry && !selectedCountry && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-[#0F2044] text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none z-20">
            <MapPin size={10} className="inline mr-1" />
            {FOREIGN_AFFILIATES[hoveredCountry]?.countryName} — {FOREIGN_AFFILIATES[hoveredCountry]?.affiliates.length} affiliate{FOREIGN_AFFILIATES[hoveredCountry]?.affiliates.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Side panel */}
      {selectedCountry ? (
        <AffiliatePanel
          countryCode={selectedCountry}
          onClose={() => setSelectedCountry(null)}
        />
      ) : (
        <div className="w-72 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center shrink-0 text-center px-6">
          <Globe size={32} className="text-slate-300 mb-3" />
          <div className="text-[13px] font-semibold text-slate-600 mb-1">Select a country</div>
          <div className="text-[11px] text-slate-400 leading-relaxed">
            Click on a highlighted country to view foreign affiliate details and tax attributes.
          </div>
          <div className="mt-4 text-[10px] text-slate-400">
            {activeCountries.length} countries with active affiliates
          </div>
        </div>
      )}
    </div>
  );
}
