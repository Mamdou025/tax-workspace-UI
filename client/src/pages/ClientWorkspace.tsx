// Screen 2: Client Workspace
// Design: Clean, task-focused. Client switcher at top.
// Header: client name + tier only (no star, no lead partner/partners/teams row).
// Workflow cards: name + status signal + Open button + Details accordion.
// Status signals: "Under Review" (amber), "Awaiting Partner Sign-off" (red) only.
// No colored dots, no exceptions/open-items counts, no At Risk tag.
// Team-based access: T2 (TC team) is greyed out for ICT/M&A user.
// Tabs: Active Workflows | Tax Attributes (world map)
// Palette: grayscale + deep navy (#0F2044), status colors for signals only.

import { useState, useRef, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import {
  Building2, ChevronDown, ChevronRight,
  CheckCircle2, Clock, Upload, Activity,
  Lock, Globe, MapPin, X, ChevronUp, Network, Map
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import { AvatarInitials, TeamBadge } from '@/components/StatusBadge';
import WorldMap from '@/components/WorldMap';
import AffiliateOrgChart from '@/components/AffiliateOrgChart';
import {
  CLIENTS, TAX_TEAMS,
  type WorkflowCard
} from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ─── Review stage pipeline ─────────────────────────────────────────────────────
const REVIEW_STAGES: Array<WorkflowCard['reviewStage']> = [
  'Consultant', 'Manager', 'Senior Manager', 'Partner', 'Delivered'
];

// ─── Current user's teams (ICT + M&A) ─────────────────────────────────────────
const MY_TEAMS = ['International Corporate Tax', 'M&A / Structuring'];

// ─── Workflow card ─────────────────────────────────────────────────────────────
function WorkflowCardItem({ wf, restricted }: { wf: WorkflowCard; restricted?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const isFapi = wf.id === 'wf-fapi';
  const currentStageIdx = REVIEW_STAGES.indexOf(wf.reviewStage);
  const isAwaitingSignoff = wf.status === 'Awaiting Partner Sign-off';
  const isUnderReview = wf.status === 'Under Review';

  if (restricted) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3 opacity-50">
        <Lock size={13} className="text-slate-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-[13px] font-semibold text-slate-500 truncate block">{wf.name}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <TeamBadge
              name={wf.team}
              color={wf.teamColor}
              abbreviation={TAX_TEAMS.find(t => t.name === wf.team)?.abbreviation}
            />
            <span className="text-[10px] text-slate-400">FY {wf.year} · Due {wf.dueDate}</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 italic shrink-0">Not in your team</span>
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-white border rounded-xl overflow-hidden transition-all duration-150',
      isAwaitingSignoff ? 'border-red-300' : 'border-slate-200',
      'hover:border-slate-300 hover:shadow-sm'
    )}>
      {/* ── Always-visible row ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Name + status signal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold text-slate-800 truncate">{wf.name}</span>
            {isAwaitingSignoff && (
              <span className="text-[10px] text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full font-medium">
                Awaiting Partner Sign-off
              </span>
            )}
            {isUnderReview && (
              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                Under Review
              </span>
            )}
            {wf.status === 'Complete' && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                <CheckCircle2 size={9} />
                Complete
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <TeamBadge
              name={wf.team}
              color={wf.teamColor}
              abbreviation={TAX_TEAMS.find(t => t.name === wf.team)?.abbreviation}
            />
            <span className="text-[10px] text-slate-400">FY {wf.year} · Due {wf.dueDate}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isFapi ? (
            <a href="/workflow/fapi">
              <button className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#0F2044] text-white hover:bg-[#1a3060] active:scale-95 transition-all duration-100">
                Open Workflow →
              </button>
            </a>
          ) : (
            <button
              onClick={() => toast.info('Workflow execution — coming soon')}
              className="text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800 transition-colors"
            >
              Open Workflow
            </button>
          )}

          <button
            onClick={() => setExpanded(v => !v)}
            className={cn(
              'flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg border transition-colors',
              expanded
                ? 'border-slate-300 bg-slate-50 text-slate-700'
                : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'
            )}
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            <span>Details</span>
          </button>
        </div>
      </div>

      {/* ── Expandable details ─────────────────────────────────────────────── */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-4 space-y-4">
          {/* Review stage */}
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Review Stage</div>
            <div className="flex items-center gap-0">
              {REVIEW_STAGES.map((stage, i) => {
                const isDone = i < currentStageIdx;
                const isCurrent = i === currentStageIdx;
                const isLast = i === REVIEW_STAGES.length - 1;
                return (
                  <div key={stage} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-2.5 h-2.5 rounded-full border',
                        isDone ? 'bg-emerald-500 border-emerald-500' :
                        isCurrent ? 'bg-[#0F2044] border-[#0F2044]' :
                        'bg-white border-slate-300'
                      )} />
                      <span className={cn(
                        'text-[9px] mt-1 whitespace-nowrap',
                        isCurrent ? 'text-[#0F2044] font-semibold' :
                        isDone ? 'text-emerald-600' : 'text-slate-400'
                      )}>
                        {stage === 'Senior Manager' ? 'Sr. Mgr' : stage}
                      </span>
                    </div>
                    {!isLast && (
                      <div className={cn('flex-1 h-px mx-1 mb-3', isDone ? 'bg-emerald-400/50' : 'bg-slate-200')} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team */}
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Team</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {[
                { role: 'Preparer', name: wf.preparer },
                { role: 'Manager', name: wf.manager },
                { role: 'Sr. Manager', name: wf.seniorManager },
                { role: 'Partner', name: wf.partner },
              ].map(m => (
                <div key={m.role} className="flex items-center gap-2">
                  <AvatarInitials
                    initials={m.name.split(' ').map(n => n[0]).join('')}
                    name={m.name}
                    size="xs"
                  />
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider">{m.role}</div>
                    <div className="text-[11px] text-slate-700 font-medium">{m.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Milestones</div>
            <div className="space-y-1.5">
              {[
                { label: 'Source documents received', done: true },
                { label: 'First draft complete', done: currentStageIdx >= 1 },
                { label: 'Manager review', done: currentStageIdx >= 2 },
                { label: 'Partner sign-off', done: currentStageIdx >= 4 },
                { label: 'Delivered to client', done: wf.status === 'Complete' },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={cn(
                    'w-4 h-4 rounded-full flex items-center justify-center shrink-0',
                    m.done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  )}>
                    {m.done ? <CheckCircle2 size={10} /> : <Clock size={9} />}
                  </div>
                  <span className={cn('text-[11px]', m.done ? 'text-slate-400 line-through' : 'text-slate-700')}>
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1 border-t border-slate-200">
            <Activity size={10} />
            <span>Last activity: {wf.lastActivity}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tax Attributes World Map ──────────────────────────────────────────────────
// Foreign affiliates data for Northstar Holdings
const FOREIGN_AFFILIATES: Record<string, {
  countryName: string;
  affiliates: Array<{
    name: string;
    taxableIncome: string;
    fapiIncome: string;
    exemptSurplus: string;
    taxableSurplus: string;
    preAcquisitionSurplus: string;
    taxYear: string;
    currency: string;
  }>;
}> = {
  FR: {
    countryName: 'France',
    affiliates: [
      {
        name: 'Northstar Paris SAS',
        taxableIncome: '2,340,000',
        fapiIncome: '180,000',
        exemptSurplus: '4,120,000',
        taxableSurplus: '890,000',
        preAcquisitionSurplus: '1,200,000',
        taxYear: '2024',
        currency: 'EUR',
      },
    ],
  },
  DE: {
    countryName: 'Germany',
    affiliates: [
      {
        name: 'Northstar GmbH',
        taxableIncome: '5,670,000',
        fapiIncome: '320,000',
        exemptSurplus: '9,800,000',
        taxableSurplus: '1,450,000',
        preAcquisitionSurplus: '2,100,000',
        taxYear: '2024',
        currency: 'EUR',
      },
    ],
  },
  GB: {
    countryName: 'United Kingdom',
    affiliates: [
      {
        name: 'Northstar UK Ltd',
        taxableIncome: '8,120,000',
        fapiIncome: '0',
        exemptSurplus: '14,300,000',
        taxableSurplus: '2,100,000',
        preAcquisitionSurplus: '3,400,000',
        taxYear: '2024',
        currency: 'GBP',
      },
    ],
  },
  US: {
    countryName: 'United States',
    affiliates: [
      {
        name: 'Northstar Corp (US)',
        taxableIncome: '22,400,000',
        fapiIncome: '1,200,000',
        exemptSurplus: '0',
        taxableSurplus: '18,700,000',
        preAcquisitionSurplus: '4,500,000',
        taxYear: '2024',
        currency: 'USD',
      },
      {
        name: 'Northstar Finance LLC',
        taxableIncome: '3,100,000',
        fapiIncome: '2,900,000',
        exemptSurplus: '0',
        taxableSurplus: '3,100,000',
        preAcquisitionSurplus: '0',
        taxYear: '2024',
        currency: 'USD',
      },
    ],
  },
  LU: {
    countryName: 'Luxembourg',
    affiliates: [
      {
        name: 'Northstar Capital S.à r.l.',
        taxableIncome: '1,890,000',
        fapiIncome: '1,650,000',
        exemptSurplus: '6,200,000',
        taxableSurplus: '440,000',
        preAcquisitionSurplus: '900,000',
        taxYear: '2024',
        currency: 'EUR',
      },
    ],
  },
  SG: {
    countryName: 'Singapore',
    affiliates: [
      {
        name: 'Northstar Asia Pte Ltd',
        taxableIncome: '4,560,000',
        fapiIncome: '210,000',
        exemptSurplus: '7,800,000',
        taxableSurplus: '980,000',
        preAcquisitionSurplus: '1,600,000',
        taxYear: '2024',
        currency: 'SGD',
      },
    ],
  },
  AU: {
    countryName: 'Australia',
    affiliates: [
      {
        name: 'Northstar Australia Pty Ltd',
        taxableIncome: '3,240,000',
        fapiIncome: '0',
        exemptSurplus: '5,100,000',
        taxableSurplus: '720,000',
        preAcquisitionSurplus: '1,100,000',
        taxYear: '2024',
        currency: 'AUD',
      },
    ],
  },
  MX: {
    countryName: 'Mexico',
    affiliates: [
      {
        name: 'Northstar México S.A.',
        taxableIncome: '1,120,000',
        fapiIncome: '890,000',
        exemptSurplus: '1,800,000',
        taxableSurplus: '340,000',
        preAcquisitionSurplus: '500,000',
        taxYear: '2024',
        currency: 'MXN',
      },
    ],
  },
  IE: {
    countryName: 'Ireland',
    affiliates: [
      {
        name: 'Northstar Ireland Ltd',
        taxableIncome: '6,780,000',
        fapiIncome: '4,200,000',
        exemptSurplus: '2,300,000',
        taxableSurplus: '6,780,000',
        preAcquisitionSurplus: '800,000',
        taxYear: '2024',
        currency: 'EUR',
      },
    ],
  },
};

// SVG world map — simplified path data for key countries
// We use a simplified Mercator-style SVG map with country paths
const COUNTRY_PATHS: Record<string, { d: string; labelX: number; labelY: number; name: string }> = {
  CA: { name: 'Canada', labelX: 200, labelY: 120, d: 'M 120 80 L 340 80 L 340 160 L 280 160 L 280 180 L 200 180 L 200 160 L 120 160 Z' },
  US: { name: 'United States', labelX: 200, labelY: 210, d: 'M 130 185 L 310 185 L 310 250 L 130 250 Z' },
  MX: { name: 'Mexico', labelX: 185, labelY: 275, d: 'M 145 255 L 270 255 L 255 295 L 160 295 Z' },
  GB: { name: 'United Kingdom', labelX: 470, labelY: 130, d: 'M 460 115 L 490 115 L 490 145 L 460 145 Z' },
  IE: { name: 'Ireland', labelX: 448, labelY: 130, d: 'M 440 118 L 458 118 L 458 140 L 440 140 Z' },
  FR: { name: 'France', labelX: 475, labelY: 158, d: 'M 460 148 L 500 148 L 500 175 L 460 175 Z' },
  DE: { name: 'Germany', labelX: 498, labelY: 140, d: 'M 490 128 L 525 128 L 525 158 L 490 158 Z' },
  LU: { name: 'Luxembourg', labelX: 492, labelY: 155, d: 'M 488 150 L 498 150 L 498 162 L 488 162 Z' },
  SG: { name: 'Singapore', labelX: 720, labelY: 290, d: 'M 716 285 L 728 285 L 728 297 L 716 297 Z' },
  AU: { name: 'Australia', labelX: 745, labelY: 360, d: 'M 700 330 L 800 330 L 800 400 L 700 400 Z' },
};

// Background continents (simplified shapes for visual context)
const CONTINENT_PATHS = [
  // North America
  { d: 'M 100 70 L 350 70 L 350 310 L 220 310 L 200 340 L 160 340 L 140 310 L 100 310 Z', key: 'na' },
  // South America
  { d: 'M 200 345 L 290 345 L 310 450 L 240 490 L 195 450 Z', key: 'sa' },
  // Europe
  { d: 'M 430 90 L 560 90 L 570 200 L 430 200 Z', key: 'eu' },
  // Africa
  { d: 'M 450 210 L 560 210 L 570 380 L 490 400 L 440 370 Z', key: 'af' },
  // Asia
  { d: 'M 560 80 L 820 80 L 820 310 L 680 320 L 560 280 Z', key: 'as' },
  // Australia
  { d: 'M 690 325 L 820 325 L 820 410 L 690 410 Z', key: 'oc' },
];

function TaxAttributesMap() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedAffiliate, setSelectedAffiliate] = useState<string>('');
  const [affiliateDropdownOpen, setAffiliateDropdownOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const activeCountries = Object.keys(FOREIGN_AFFILIATES);

  function handleCountryClick(code: string) {
    if (!activeCountries.includes(code)) return;
    setSelectedCountry(code);
    const affiliates = FOREIGN_AFFILIATES[code].affiliates;
    setSelectedAffiliate(affiliates[0].name);
    setAffiliateDropdownOpen(false);
  }

  const countryData = selectedCountry ? FOREIGN_AFFILIATES[selectedCountry] : null;
  const affiliate = countryData?.affiliates.find(a => a.name === selectedAffiliate);

  return (
    <div className="flex gap-4 h-full min-h-[520px]">
      {/* Map */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden relative">
        <div className="absolute top-3 left-3 z-10">
          <div className="text-[11px] font-semibold text-slate-700 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg px-2.5 py-1.5">
            <Globe size={11} className="inline mr-1.5 text-[#0F2044]" />
            Foreign Affiliates — Northstar Holdings Inc.
          </div>
        </div>
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <div className="w-3 h-3 rounded-sm bg-[#0F2044]/20 border border-[#0F2044]/30" />
            Active affiliate
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <div className="w-3 h-3 rounded-sm bg-[#0F2044] border border-[#0F2044]" />
            Selected
          </div>
        </div>

        <svg
          viewBox="0 0 900 480"
          className="w-full h-full"
          style={{ background: '#f0f4f8' }}
        >
          {/* Ocean background */}
          <rect width="900" height="480" fill="#e8eef4" />

          {/* Continent backgrounds */}
          {CONTINENT_PATHS.map(c => (
            <path key={c.key} d={c.d} fill="#d4dce6" stroke="#c8d4e0" strokeWidth="0.5" />
          ))}

          {/* Active country fills */}
          {activeCountries.map(code => {
            const cp = COUNTRY_PATHS[code];
            if (!cp) return null;
            const isSelected = selectedCountry === code;
            const isHovered = hoveredCountry === code;
            return (
              <path
                key={code}
                d={cp.d}
                fill={isSelected ? '#0F2044' : isHovered ? '#1a3060' : '#0F2044'}
                fillOpacity={isSelected ? 1 : isHovered ? 0.5 : 0.2}
                stroke="#0F2044"
                strokeWidth={isSelected ? 1.5 : 0.8}
                strokeOpacity={isSelected ? 1 : 0.4}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredCountry(code)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick(code)}
              />
            );
          })}

          {/* Country labels for active countries */}
          {activeCountries.map(code => {
            const cp = COUNTRY_PATHS[code];
            if (!cp) return null;
            const isSelected = selectedCountry === code;
            return (
              <g key={`label-${code}`}>
                <circle
                  cx={cp.labelX}
                  cy={cp.labelY}
                  r="5"
                  fill={isSelected ? '#0F2044' : '#0F2044'}
                  fillOpacity={isSelected ? 1 : 0.6}
                  className="cursor-pointer"
                  onClick={() => handleCountryClick(code)}
                />
                <text
                  x={cp.labelX + 7}
                  y={cp.labelY + 4}
                  fontSize="8"
                  fill={isSelected ? '#0F2044' : '#334155'}
                  fontWeight={isSelected ? '700' : '500'}
                  fontFamily="IBM Plex Sans, sans-serif"
                  className="cursor-pointer select-none"
                  onClick={() => handleCountryClick(code)}
                >
                  {cp.name}
                </text>
              </g>
            );
          })}

          {/* Canada — always shown as home country */}
          <path
            d={COUNTRY_PATHS.CA?.d ?? ''}
            fill="#1e3a5f"
            fillOpacity={0.08}
            stroke="#1e3a5f"
            strokeWidth="1"
            strokeOpacity={0.2}
            strokeDasharray="3,2"
          />
          <text x="200" y="125" fontSize="8" fill="#1e3a5f" fontWeight="600" fontFamily="IBM Plex Sans, sans-serif" textAnchor="middle" opacity="0.6">
            Canada (Parent)
          </text>
        </svg>

        {/* Hover tooltip */}
        {hoveredCountry && !selectedCountry && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-[#0F2044] text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none">
            <MapPin size={10} className="inline mr-1" />
            {FOREIGN_AFFILIATES[hoveredCountry]?.countryName} — {FOREIGN_AFFILIATES[hoveredCountry]?.affiliates.length} affiliate{FOREIGN_AFFILIATES[hoveredCountry]?.affiliates.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Side panel */}
      {selectedCountry && countryData && affiliate ? (
        <div ref={panelRef} className="w-80 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shrink-0">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div>
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className="text-[#0F2044]" />
                <span className="text-[13px] font-bold text-[#0F2044]">{countryData.countryName}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{countryData.affiliates.length} foreign affiliate{countryData.affiliates.length !== 1 ? 's' : ''}</div>
            </div>
            <button
              onClick={() => setSelectedCountry(null)}
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
                onClick={() => setAffiliateDropdownOpen(v => !v)}
                className="w-full flex items-center justify-between text-[12px] font-semibold text-[#0F2044] bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 hover:border-slate-300 transition-colors"
              >
                <span className="truncate">{selectedAffiliate}</span>
                <ChevronDown size={13} className="text-slate-400 shrink-0 ml-2" />
              </button>
              {affiliateDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                  {countryData.affiliates.map(a => (
                    <button
                      key={a.name}
                      onClick={() => { setSelectedAffiliate(a.name); setAffiliateDropdownOpen(false); }}
                      className={cn(
                        'w-full text-left px-3 py-2 text-[12px] transition-colors',
                        a.name === selectedAffiliate ? 'bg-slate-50 text-[#0F2044] font-semibold' : 'text-slate-700 hover:bg-slate-50'
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
                  <span className={cn('text-[12px] font-semibold tabular-nums', row.color)}>
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
                  <span className={cn('text-[12px] font-semibold tabular-nums', row.color)}>
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
      ) : (
        <div className="w-80 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center shrink-0 text-center px-6">
          <Globe size={32} className="text-slate-300 mb-3" />
          <div className="text-[13px] font-semibold text-slate-600 mb-1">Select a country</div>
          <div className="text-[11px] text-slate-400 leading-relaxed">
            Click on a highlighted country on the map to view foreign affiliate details and tax attributes.
          </div>
          <div className="mt-4 text-[10px] text-slate-400">
            {activeCountries.length} countries with active affiliates
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tax Attributes Tab (map + org chart flip) ───────────────────────────────
function TaxAttributesTab({ clientName }: { clientName: string }) {
  const [view, setView] = useState<'map' | 'orgchart'>('map');

  return (
    <div className="flex flex-col h-full">
      {/* Header row with flip button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Tax Attributes</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {view === 'map'
              ? `Foreign affiliates of ${clientName} — click a country to view tax attributes`
              : `Corporate structure of ${clientName} — click an entity to view tax attributes`
            }
          </p>
        </div>

        {/* Flip toggle */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
          <button
            onClick={() => setView('map')}
            className={cn(
              'flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-md transition-all duration-150',
              view === 'map'
                ? 'bg-white text-[#0F2044] shadow-sm border border-slate-200'
                : 'text-slate-400 hover:text-slate-600'
            )}
          >
            <Globe size={12} />
            World Map
          </button>
          <button
            onClick={() => setView('orgchart')}
            className={cn(
              'flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-md transition-all duration-150',
              view === 'orgchart'
                ? 'bg-white text-[#0F2044] shadow-sm border border-slate-200'
                : 'text-slate-400 hover:text-slate-600'
            )}
          >
            <Network size={12} />
            Org Chart
          </button>
        </div>
      </div>

      {/* View content */}
      <div className="flex-1 min-h-0">
        {view === 'map' ? <WorldMap /> : <AffiliateOrgChart />}
      </div>
    </div>
  );
}

// ─── Client Workspace Page ────────────────────────────────────────────────────
export default function ClientWorkspace() {
  const [, params] = useRoute('/client/:clientId');
  const clientId = params?.clientId ?? 'northstar';
  const [selectedClientId, setSelectedClientId] = useState(clientId);
  const [, navigate] = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('workflows');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const client = CLIENTS.find(c => c.id === selectedClientId) ?? CLIENTS[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleClientChange(id: string) {
    setSelectedClientId(id);
    setDropdownOpen(false);
    navigate(`/client/${id}`);
  }

  // Separate workflows by team access
  const myWorkflows = client.workflows.filter(wf => MY_TEAMS.includes(wf.team));
  const restrictedWorkflows = client.workflows.filter(wf => !MY_TEAMS.includes(wf.team));

  // Group my workflows by category
  const annualWorkflows = myWorkflows.filter(w =>
    ['wf-fapi', 'wf-t1134', 'wf-surplus', 'wf-pillar2'].includes(w.id)
  );
  const consultingWorkflows = myWorkflows.filter(w => ['wf-ma'].includes(w.id));

  return (
    <AppShell
      breadcrumbs={[
        { label: 'InScope', href: '/' },
        { label: client.name },
      ]}
      actions={
        <button
          onClick={() => toast.info('Upload documents — coming soon')}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
        >
          <Upload size={12} />
          <span className="hidden sm:inline">Upload</span>
        </button>
      }
    >
      <div className="flex flex-col h-full">

        {/* ── Client header ──────────────────────────────────────────────────── */}
        <div className="border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-[#0F2044]" />
            </div>

            {/* Client name + tier + switcher */}
            <div className="flex-1 min-w-0" ref={dropdownRef}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDropdownOpen(v => !v)}
                  className="flex items-center gap-1.5 text-[17px] font-bold text-[#0F2044] hover:text-[#1a3060] transition-colors"
                >
                  {client.name}
                  <ChevronDown size={15} className={cn('text-slate-400 transition-transform duration-150', dropdownOpen && 'rotate-180')} />
                </button>
                <span className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full font-semibold border',
                  client.tier === 'Platinum' ? 'bg-slate-100 text-slate-600 border-slate-300' :
                  client.tier === 'Strategic' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-slate-50 text-slate-500 border-slate-200'
                )}>
                  {client.tier}
                </span>
              </div>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 min-w-[260px] py-1.5">
                  {CLIENTS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleClientChange(c.id)}
                      className={cn(
                        'flex items-center gap-3 w-full text-left px-3 py-2 transition-colors',
                        c.id === selectedClientId ? 'bg-slate-50 text-[#0F2044]' : 'text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Building2 size={13} className="text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold truncate">{c.name}</div>
                        <div className="text-[10px] text-slate-400">{c.leadPartner} · {c.tier}</div>
                      </div>
                      {c.id === selectedClientId && (
                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Workflow count only */}
            <div className="hidden lg:flex items-center gap-2 shrink-0 border-l border-slate-100 pl-4">
              <div className="text-center">
                <div className="text-xl font-bold text-[#0F2044] tabular-nums">{client.workflows.length}</div>
                <div className="text-[10px] text-slate-400">Workflows</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <div className="border-b border-slate-200 bg-white px-5">
              <TabsList className="bg-transparent h-10 gap-0 p-0">
                {[
                  { value: 'workflows', label: 'Active Workflows', icon: <Activity size={12} /> },
                  { value: 'taxattributes', label: 'Tax Attributes', icon: <Globe size={12} /> },
                ].map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      'flex items-center gap-1.5 text-xs px-3 py-2 rounded-none border-b-2 border-transparent',
                      'data-[state=active]:border-[#0F2044] data-[state=active]:text-[#0F2044] data-[state=active]:bg-transparent',
                      'text-slate-400 hover:text-slate-600 transition-colors'
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto bg-slate-50">

              {/* ── Active Workflows ──────────────────────────────────────── */}
              <TabsContent value="workflows" className="p-5 mt-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">Active Workflows</h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {myWorkflows.length} accessible · {restrictedWorkflows.length} restricted
                    </p>
                  </div>
                  <button
                    onClick={() => toast.info('New workflow — coming soon')}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#0F2044] text-white hover:bg-[#1a3060] transition-colors"
                  >
                    + New Workflow
                  </button>
                </div>

                {/* Annual recurring (my team) */}
                {annualWorkflows.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-px flex-1 bg-slate-200" />
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2">Annual Recurring</span>
                      <div className="h-px flex-1 bg-slate-200" />
                    </div>
                    <div className="space-y-2">
                      {annualWorkflows.map(wf => <WorkflowCardItem key={wf.id} wf={wf} />)}
                    </div>
                  </div>
                )}

                {/* Consulting (my team) */}
                {consultingWorkflows.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-px flex-1 bg-slate-200" />
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2">Consulting</span>
                      <div className="h-px flex-1 bg-slate-200" />
                    </div>
                    <div className="space-y-2">
                      {consultingWorkflows.map(wf => <WorkflowCardItem key={wf.id} wf={wf} />)}
                    </div>
                  </div>
                )}

                {/* Restricted workflows */}
                {restrictedWorkflows.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-px flex-1 bg-slate-200" />
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2">Other Teams</span>
                      <div className="h-px flex-1 bg-slate-200" />
                    </div>
                    <div className="space-y-2">
                      {restrictedWorkflows.map(wf => <WorkflowCardItem key={wf.id} wf={wf} restricted />)}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ── Tax Attributes ────────────────────────────────────────── */}
              <TabsContent value="taxattributes" className="p-5 mt-0 h-full">
                <TaxAttributesTab clientName={client.name} />
              </TabsContent>

            </div>
          </Tabs>
        </div>
      </div>
    </AppShell>
  );
}
