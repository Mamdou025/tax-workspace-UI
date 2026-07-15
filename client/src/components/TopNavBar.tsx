// TopNavBar — subtle horizontal page-navigation bar
// Role: page-level navigation only (Home, Workflow Builder, Dashboard)
// Style: very thin, low-contrast, sits above the main content area

import React from 'react';
import { useLocation } from 'wouter';
import { Home, GitFork, BarChart2 } from 'lucide-react';

const NAV_ITEMS = [
  { icon: Home,      label: 'Home',             route: '/' },
  { icon: GitFork,   label: 'Workflow Builder',  route: '/builder' },
  { icon: BarChart2, label: 'Dashboard',         route: '/dashboard' },
];

export default function TopNavBar() {
  const [location, navigate] = useLocation();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      padding: '10px 24px 0',
      flexShrink: 0,
      // No background — blends with the page bg
    }}>
      {NAV_ITEMS.map(({ icon: Icon, label, route }) => {
        const active = location === route || (route !== '/' && location.startsWith(route));
        return (
          <button
            key={route}
            onClick={() => navigate(route)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 20,
              border: 'none',
              background: active
                ? 'rgba(107,33,168,0.08)'
                : 'transparent',
              color: active
                ? '#6B21A8'
                : 'var(--is-text-tertiary)',
              fontSize: 12,
              fontWeight: active ? 600 : 400,
              fontFamily: 'inherit',
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              transition: 'all 150ms ease-out',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              if (!active) {
                const el = e.currentTarget as HTMLElement;
                el.style.color = 'var(--is-text-secondary)';
                el.style.background = 'rgba(0,0,0,0.04)';
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                const el = e.currentTarget as HTMLElement;
                el.style.color = 'var(--is-text-tertiary)';
                el.style.background = 'transparent';
              }
            }}
          >
            <Icon size={13} strokeWidth={active ? 2.2 : 1.8} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
