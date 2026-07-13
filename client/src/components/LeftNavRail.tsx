/**
 * LeftNavRail — narrow floating neumorphic vertical navigation rail
 * Items: Home, Workflow Builder, Dashboard, Library, Settings (bottom)
 * Icon-only, tooltips on hover, neumorphic active state
 */

import { useLocation } from 'wouter';
import { Home, GitFork, BarChart2, FolderOpen, Settings } from 'lucide-react';

const PURPLE = '#6B21A8';

const NAV_ITEMS = [
  { id: 'home',    icon: Home,       label: 'Home',             route: '/' },
  { id: 'builder', icon: GitFork,    label: 'Workflow Builder', route: '/builder' },
  { id: 'dash',    icon: BarChart2,  label: 'Dashboard',        route: '/dashboard' },
  { id: 'library', icon: FolderOpen, label: 'Library',          route: '/library' },
];

const BOTTOM_ITEMS = [
  { id: 'settings', icon: Settings, label: 'Settings', route: '/settings' },
];

function NavItem({
  icon: Icon, label, route, active, onClick,
}: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label: string; route: string; active: boolean; onClick: () => void;
}) {
  return (
    <div style={{ position: 'relative' }} className="nav-rail-item-wrapper">
      <button
        onClick={onClick}
        aria-label={label}
        title={label}
        style={{
          width: 44, height: 44, borderRadius: 14,
          background: active ? 'var(--is-surface-2)' : 'transparent',
          boxShadow: active ? 'var(--is-shadow-in)' : 'none',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 180ms var(--is-ease-out)',
          color: active ? PURPLE : 'var(--is-text-secondary)',
          outline: 'none',
        }}
        onFocus={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 2px var(--is-accent-ring), ${active ? 'var(--is-shadow-in)' : 'var(--is-shadow-sm)'}`; }}
        onBlur={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = active ? 'var(--is-shadow-in)' : 'none'; }}
        onMouseEnter={(e) => {
          if (!active) (e.currentTarget as HTMLElement).style.boxShadow = 'var(--is-shadow-sm)';
        }}
        onMouseLeave={(e) => {
          if (!active) (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        }}
      >
        <Icon size={18} style={{ flexShrink: 0 }} />
      </button>

      {/* Tooltip */}
      <div
        className="nav-rail-tooltip"
        style={{
          position: 'absolute', left: 'calc(100% + 12px)', top: '50%', transform: 'translateY(-50%)',
          background: 'var(--is-text-primary)', color: '#fff',
          fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
          padding: '5px 10px', borderRadius: 8,
          pointerEvents: 'none', opacity: 0,
          transition: 'opacity 120ms ease-out',
          zIndex: 200,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function LeftNavRail() {
  const [location, navigate] = useLocation();

  const isActive = (route: string) => {
    if (route === '/') return location === '/';
    return location.startsWith(route);
  };

  return (
    <>
      <style>{`
        .nav-rail-item-wrapper:hover .nav-rail-tooltip { opacity: 1 !important; }
        @media (prefers-reduced-motion: reduce) {
          .nav-rail-item-wrapper button { transition: none !important; }
        }
      `}</style>
      <nav
        aria-label="Main navigation"
        style={{
          position: 'fixed', left: 16, top: '50%', transform: 'translateY(-50%)',
          width: 60, zIndex: 100,
          background: 'var(--is-surface)',
          borderRadius: 22,
          boxShadow: 'var(--is-shadow-out)',
          border: '1px solid var(--is-border)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '14px 8px',
          gap: 6,
        }}
      >
        {/* Brand dot */}
        <div style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <svg width={22} height={22} viewBox="0 0 22 22">
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2;
              return <circle key={i} cx={11 + 8 * Math.cos(a)} cy={11 + 8 * Math.sin(a)} r={1.2} fill={PURPLE} opacity={0.6} />;
            })}
            <circle cx={11} cy={11} r={3} fill={PURPLE} opacity={0.85} />
          </svg>
        </div>

        {/* Main items */}
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            route={item.route}
            active={isActive(item.route)}
            onClick={() => navigate(item.route)}
          />
        ))}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Bottom items */}
        {BOTTOM_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            route={item.route}
            active={isActive(item.route)}
            onClick={() => navigate(item.route)}
          />
        ))}
      </nav>
    </>
  );
}
