/**
 * InScopeSidebar — collapsible neumorphic sidebar
 *
 * Collapsed: 64px wide, icon-only with tooltips
 * Expanded:  240px wide, labels + sub-folders
 *
 * Items:
 *  1. Home
 *  2. Workflow Builder
 *  3. Scopes  (folder icon, collapsible)
 *       └─ My Scopes
 *       └─ Shared Scopes
 *       Each sub-folder has a workstream/client toggle
 *  4. Settings (bottom)
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  Home, GitFork, FolderOpen, Settings,
  ChevronRight, ChevronLeft, ChevronDown,
  Users, GitBranch, MessageSquare, FileText,
  Pin,
} from 'lucide-react';

const PURPLE = '#6B21A8';
const BG = '#F4F5F8';
const SURFACE = '#F8F9FB';
const SURFACE2 = '#EDEEF2';
const TEXT_PRIMARY = '#202735';
const TEXT_SECONDARY = '#7C8493';
const TEXT_TERTIARY = '#A8AEBA';
const BORDER = 'rgba(0,0,0,0.07)';
const SHADOW_OUT = '8px 8px 18px rgba(158,158,178,0.36), -8px -8px 18px rgba(255,255,255,0.82)';
const SHADOW_IN = 'inset 5px 5px 12px rgba(158,158,178,0.32), inset -5px -5px 12px rgba(255,255,255,0.80)';
const SHADOW_SM = '4px 4px 10px rgba(158,158,178,0.28), -4px -4px 10px rgba(255,255,255,0.76)';

const COLLAPSED_W = 64;
const EXPANDED_W = 240;

// ─── Thread data (mock — replace with real data when available) ───────────────

const MY_SCOPES_THREADS = [
  { id: 's1', title: 'FAPI Readiness — Northstar',    client: 'Northstar Inc.',      workstream: 'FAPI',    route: '/fapi' },
  { id: 's2', title: 'T1134 Compliance — Cascade',    client: 'Cascade Tech',        workstream: 'T1134',   route: '/t1134' },
  { id: 's3', title: 'Q2 Provision Review',           client: 'Meridian Energy',     workstream: 'Provision', route: '/chat' },
  { id: 's4', title: 'Surplus — Atlas Financial',     client: 'Atlas Financial',     workstream: 'Surplus', route: '/surplus' },
  { id: 's5', title: 'TP Benchmark Update',           client: 'Northstar Inc.',      workstream: 'TP',      route: '/chat' },
];

const SHARED_SCOPES_THREADS = [
  { id: 'sh1', title: 'FAPI — SAS Paris',             client: 'SAS Paris',           workstream: 'FAPI',    route: '/fapi' },
  { id: 'sh2', title: 'GILTI Analysis',               client: 'Multiple',            workstream: 'GILTI',   route: '/chat' },
  { id: 'sh3', title: 'Intercompany Reconciliation',  client: 'Atlas Financial',     workstream: 'IC Recon', route: '/chat' },
];

type GroupBy = 'workstream' | 'client';

function groupThreads(threads: typeof MY_SCOPES_THREADS, by: GroupBy) {
  const map = new Map<string, typeof threads>();
  for (const t of threads) {
    const key = by === 'workstream' ? t.workstream : t.client;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }
  return map;
}

// ─── Toggle pill ──────────────────────────────────────────────────────────────

function GroupToggle({ value, onChange }: { value: GroupBy; onChange: (v: GroupBy) => void }) {
  return (
    <div
      style={{
        display: 'flex', borderRadius: 10, overflow: 'hidden',
        background: SURFACE2, boxShadow: SHADOW_IN,
        margin: '6px 0 8px',
      }}
    >
      {(['workstream', 'client'] as GroupBy[]).map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            flex: 1, padding: '5px 0', fontSize: 10, fontWeight: value === opt ? 700 : 500,
            color: value === opt ? TEXT_PRIMARY : TEXT_TERTIARY,
            background: value === opt ? SURFACE : 'transparent',
            boxShadow: value === opt ? SHADOW_SM : 'none',
            border: 'none', cursor: 'pointer', borderRadius: 8,
            transition: 'all 160ms ease-out',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}
        >
          {opt === 'workstream'
            ? <><GitBranch size={9} />{' '}Workstream</>
            : <><Users size={9} />{' '}Client</>
          }
        </button>
      ))}
    </div>
  );
}

// ─── Thread list ──────────────────────────────────────────────────────────────

function ThreadList({
  threads, groupBy, navigate,
}: {
  threads: typeof MY_SCOPES_THREADS;
  groupBy: GroupBy;
  navigate: (path: string) => void;
}) {
  const groups = groupThreads(threads, groupBy);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Array.from(groups.entries()).map(([group, items]) => (
        <div key={group}>
          <div style={{ fontSize: 9, fontWeight: 700, color: TEXT_TERTIARY, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '6px 8px 3px' }}>
            {group}
          </div>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.route)}
              style={{
                width: '100%', textAlign: 'left', background: 'transparent', border: 'none',
                cursor: 'pointer', padding: '5px 8px', borderRadius: 8,
                display: 'flex', alignItems: 'center', gap: 7,
                transition: 'background 140ms ease-out',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = SURFACE2; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <MessageSquare size={10} style={{ color: TEXT_TERTIARY, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: TEXT_SECONDARY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.title}
              </span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Scopes folder ────────────────────────────────────────────────────────────

function ScopesFolder({
  label, threads, defaultOpen = false, navigate,
}: {
  label: string;
  threads: typeof MY_SCOPES_THREADS;
  defaultOpen?: boolean;
  navigate: (path: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [groupBy, setGroupBy] = useState<GroupBy>('workstream');

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', textAlign: 'left', background: 'transparent', border: 'none',
          cursor: 'pointer', padding: '6px 8px', borderRadius: 10,
          display: 'flex', alignItems: 'center', gap: 8,
          transition: 'background 140ms ease-out',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = SURFACE2; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <FileText size={12} style={{ color: TEXT_SECONDARY, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: TEXT_SECONDARY }}>{label}</span>
        <ChevronDown
          size={11}
          style={{
            color: TEXT_TERTIARY, flexShrink: 0,
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 200ms ease-out',
          }}
        />
      </button>

      {open && (
        <div style={{ paddingLeft: 12 }}>
          <GroupToggle value={groupBy} onChange={setGroupBy} />
          <ThreadList threads={threads} groupBy={groupBy} navigate={navigate} />
        </div>
      )}
    </div>
  );
}

// ─── Nav item ─────────────────────────────────────────────────────────────────

function NavItem({
  icon: Icon, label, active, onClick, collapsed,
}: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label: string; active: boolean; onClick: () => void; collapsed: boolean;
}) {
  return (
    <div style={{ position: 'relative' }} className="is-nav-item">
      <button
        onClick={onClick}
        aria-label={label}
        title={collapsed ? label : undefined}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          gap: collapsed ? 0 : 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '10px 0' : '10px 12px',
          borderRadius: 12, border: 'none', cursor: 'pointer',
          background: active ? SURFACE2 : 'transparent',
          boxShadow: active ? SHADOW_IN : 'none',
          color: active ? PURPLE : TEXT_SECONDARY,
          transition: 'all 180ms ease-out',
          fontFamily: 'inherit',
        }}
        onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = SURFACE2; }}
        onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <Icon size={16} style={{ flexShrink: 0 }} />
        {!collapsed && (
          <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? TEXT_PRIMARY : TEXT_SECONDARY, whiteSpace: 'nowrap' }}>
            {label}
          </span>
        )}
      </button>

      {/* Tooltip when collapsed */}
      {collapsed && (
        <div
          className="is-nav-tooltip"
          style={{
            position: 'absolute', left: 'calc(100% + 10px)', top: '50%', transform: 'translateY(-50%)',
            background: TEXT_PRIMARY, color: '#fff',
            fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
            padding: '5px 10px', borderRadius: 8,
            pointerEvents: 'none', opacity: 0,
            transition: 'opacity 120ms ease-out', zIndex: 300,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

// ─── InScopeSidebar ───────────────────────────────────────────────────────────

export default function InScopeSidebar({ onNewScope }: { onNewScope?: () => void } = {}) {
  const [location, navigate] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [scopesOpen, setScopesOpen] = useState(true);

  const w = collapsed ? COLLAPSED_W : EXPANDED_W;

  const isActive = (route: string) => {
    if (route === '/') return location === '/';
    return location.startsWith(route);
  };

  return (
    <>
      <style>{`
        .is-nav-item:hover .is-nav-tooltip { opacity: 1 !important; }
        @media (prefers-reduced-motion: reduce) {
          .is-nav-item button { transition: none !important; }
        }
      `}</style>

      <nav
        aria-label="Main navigation"
        style={{
          position: 'fixed', left: 12, top: 12, bottom: 12,
          width: w, zIndex: 100,
          background: SURFACE,
          borderRadius: 20,
          boxShadow: SHADOW_OUT,
          border: `1px solid ${BORDER}`,
          display: 'flex', flexDirection: 'column',
          padding: '14px 10px',
          transition: 'width 220ms cubic-bezier(0.23, 1, 0.32, 1)',
          overflow: 'hidden',
        }}
      >
        {/* Brand + collapse toggle */}
        <div
          style={{
            display: 'flex', alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            marginBottom: 18, paddingLeft: collapsed ? 0 : 4,
          }}
        >
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, userSelect: 'none', overflow: 'hidden' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: TEXT_PRIMARY, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>Sinaxe</span>
              <span style={{ fontSize: 8, color: TEXT_TERTIARY, verticalAlign: 'super' }}>™</span>
              <span style={{ fontSize: 13, fontWeight: 400, color: TEXT_SECONDARY, marginLeft: 2, whiteSpace: 'nowrap' }}>InScope</span>
            </div>
          )}
          {collapsed && (
            /* Mini brand dot when collapsed */
            <svg width={22} height={22} viewBox="0 0 22 22">
              {Array.from({ length: 10 }, (_, i) => {
                const a = (i / 10) * Math.PI * 2;
                return <circle key={i} cx={11 + 8 * Math.cos(a)} cy={11 + 8 * Math.sin(a)} r={1.2} fill={PURPLE} opacity={0.6} />;
              })}
              <circle cx={11} cy={11} r={3} fill={PURPLE} opacity={0.85} />
            </svg>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              width: 26, height: 26, borderRadius: 9, flexShrink: 0,
              background: SURFACE2, boxShadow: SHADOW_IN,
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: TEXT_SECONDARY,
            }}
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </div>

        {/* ── Main nav items ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <NavItem icon={Home}    label="Home"             active={isActive('/')}        onClick={() => navigate('/')}        collapsed={collapsed} />
          <NavItem icon={GitFork} label="Workflow Builder" active={isActive('/builder')} onClick={() => navigate('/builder')} collapsed={collapsed} />
        </div>

        {/* ── New Scope button ── */}
        <div style={{ marginTop: 12, padding: collapsed ? '0 2px' : '0 2px' }}>
          <button
            onClick={() => { if (onNewScope) onNewScope(); }}
            aria-label="New Scope"
            title={collapsed ? 'New Scope' : undefined}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center',
              gap: collapsed ? 0 : 9,
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '9px 0' : '9px 12px',
              borderRadius: 12, border: `1px dashed rgba(107,33,168,0.30)`,
              cursor: 'pointer', fontFamily: 'inherit',
              background: 'transparent',
              color: PURPLE,
              transition: 'all 180ms ease-out',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(107,33,168,0.06)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(107,33,168,0.55)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(107,33,168,0.30)';
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 300, lineHeight: 1, flexShrink: 0 }}>+</span>
            {!collapsed && (
              <span style={{ fontSize: 12, fontWeight: 600, color: PURPLE, whiteSpace: 'nowrap' }}>New Scope</span>
            )}
          </button>
        </div>

        {/* ── Scopes section ── */}
        <div style={{ marginTop: 16 }}>
          {!collapsed && (
            <div style={{ fontSize: 9, fontWeight: 700, color: TEXT_TERTIARY, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0 4px 6px' }}>
              Scopes
            </div>
          )}

          {collapsed ? (
            /* Collapsed: single folder icon */
            <NavItem
              icon={FolderOpen}
              label="Scopes"
              active={false}
              onClick={() => setCollapsed(false)}
              collapsed={collapsed}
            />
          ) : (
            /* Expanded: two sub-folders */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Scopes header row */}
              <button
                onClick={() => setScopesOpen((v) => !v)}
                style={{
                  width: '100%', textAlign: 'left', background: 'transparent', border: 'none',
                  cursor: 'pointer', padding: '7px 12px', borderRadius: 12,
                  display: 'flex', alignItems: 'center', gap: 9,
                  transition: 'background 140ms ease-out',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = SURFACE2; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <FolderOpen size={16} style={{ color: TEXT_SECONDARY, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: TEXT_SECONDARY }}>Scopes</span>
                <ChevronDown
                  size={11}
                  style={{
                    color: TEXT_TERTIARY, flexShrink: 0,
                    transform: scopesOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform 200ms ease-out',
                  }}
                />
              </button>

              {scopesOpen && (
                <div
                  style={{
                    paddingLeft: 10,
                    display: 'flex', flexDirection: 'column', gap: 4,
                    overflow: 'hidden',
                  }}
                >
                  <ScopesFolder
                    label="My Scopes"
                    threads={MY_SCOPES_THREADS}
                    defaultOpen={true}
                    navigate={navigate}
                  />
                  <ScopesFolder
                    label="Shared Scopes"
                    threads={SHARED_SCOPES_THREADS}
                    defaultOpen={false}
                    navigate={navigate}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Spacer ── */}
        <div style={{ flex: 1 }} />

        {/* ── Settings (bottom) ── */}
        <NavItem
          icon={Settings}
          label="Settings"
          active={isActive('/settings')}
          onClick={() => navigate('/settings')}
          collapsed={collapsed}
        />
      </nav>

      {/* Spacer div so page content doesn't go under the sidebar */}
      <div style={{ width: w + 12 + 12, flexShrink: 0, transition: 'width 220ms cubic-bezier(0.23, 1, 0.32, 1)' }} />
    </>
  );
}

// Export sidebar width constants for consumers
export const SIDEBAR_COLLAPSED_W = COLLAPSED_W + 12 + 12; // sidebar + left gap + right gap
export const SIDEBAR_EXPANDED_W  = EXPANDED_W  + 12 + 12;
