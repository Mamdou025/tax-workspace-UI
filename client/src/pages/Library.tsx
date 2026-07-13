/**
 * Library — organize and find threads, workstreams, workpapers, artifacts
 * Views: By client | By workstream | Pinned
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { FolderOpen, Users, GitFork, Pin, ChevronRight, FileText, MessageSquare, Calculator } from 'lucide-react';
import LeftNavRail from '@/components/LeftNavRail';

const PURPLE = '#6B21A8';

type View = 'client' | 'workstream' | 'pinned';

const BY_CLIENT = [
  {
    client: 'Northstar Inc.',
    items: [
      { id: 'n1', type: 'workpaper', title: 'FAPI Workpaper FY2025', time: '2h ago', route: '/fapi' },
      { id: 'n2', type: 'thread',    title: 'FAPI Readiness Thread', time: '2h ago', route: '/chat' },
      { id: 'n3', type: 'workpaper', title: 'T1134 Filing FY2025',   time: '1d ago', route: '/t1134' },
    ],
  },
  {
    client: 'Meridian Energy Corp.',
    items: [
      { id: 'm1', type: 'thread',    title: 'Q2 Provision Review',         time: '18m ago', route: '/chat' },
      { id: 'm2', type: 'workpaper', title: 'Surplus Account Analysis',    time: '3d ago',  route: '/surplus' },
    ],
  },
  {
    client: 'Atlas Financial Group',
    items: [
      { id: 'a1', type: 'thread', title: 'Intercompany Reconciliation', time: '1h ago', route: '/chat' },
    ],
  },
  {
    client: 'Cascade Technologies Ltd.',
    items: [
      { id: 'c1', type: 'workpaper', title: 'T1134 Compliance Review', time: 'Yesterday', route: '/t1134' },
      { id: 'c2', type: 'thread',    title: 'Transfer Pricing Benchmark', time: '2h ago', route: '/chat' },
    ],
  },
];

const BY_WORKSTREAM = [
  { id: 'w1', label: 'FAPI Readiness',           clients: 3, period: 'FY 2025', route: '/fapi',    status: '4 items need input' },
  { id: 'w2', label: 'T1134 Compliance',          clients: 2, period: 'FY 2025', route: '/t1134',   status: '2 forms in progress' },
  { id: 'w3', label: 'Surplus Accounts',          clients: 2, period: 'FY 2025', route: '/surplus', status: 'On track' },
  { id: 'w4', label: 'Q2 Tax Provision Review',   clients: 5, period: 'Q2 2025', route: '/chat',    status: 'Running' },
  { id: 'w5', label: 'Transfer Pricing Benchmark',clients: 1, period: 'FY 2025', route: '/chat',    status: 'In review' },
];

const PINNED = [
  { id: 'p1', type: 'workpaper', title: 'FAPI Workpaper — Northstar FY2025', context: 'Northstar Inc.', route: '/fapi' },
  { id: 'p2', type: 'workpaper', title: 'T1134 — Cascade Technologies',       context: 'Cascade Tech',   route: '/t1134' },
  { id: 'p3', type: 'thread',    title: 'FAPI Readiness Thread',              context: 'SAS Paris',      route: '/chat' },
];

const TYPE_ICON: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  workpaper: FileText,
  thread:    MessageSquare,
  calc:      Calculator,
};

export default function Library() {
  const [, navigate] = useLocation();
  const [view, setView] = useState<View>('client');

  const tabs: { id: View; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'client',     label: 'By client',     icon: Users },
    { id: 'workstream', label: 'By workstream', icon: GitFork },
    { id: 'pinned',     label: 'Pinned',        icon: Pin },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--is-bg)', display: 'flex', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
      <LeftNavRail />

      <div style={{ flex: 1, paddingLeft: 88, paddingRight: 32, paddingTop: 32, paddingBottom: 60, maxWidth: 860, margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <FolderOpen size={18} style={{ color: PURPLE }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--is-text-primary)', letterSpacing: '-0.02em' }}>Library</span>
        </div>

        {/* Tab bar */}
        <div
          style={{
            display: 'inline-flex', gap: 4,
            background: 'var(--is-surface)',
            borderRadius: 14, padding: 4,
            boxShadow: 'var(--is-shadow-in)',
            marginBottom: 24,
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = view === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: active ? 700 : 500,
                  color: active ? 'var(--is-text-primary)' : 'var(--is-text-secondary)',
                  background: active ? 'var(--is-bg)' : 'transparent',
                  boxShadow: active ? 'var(--is-shadow-sm)' : 'none',
                  transition: 'all 160ms var(--is-ease-out)',
                }}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* By client */}
        {view === 'client' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {BY_CLIENT.map((group) => (
              <div
                key={group.client}
                style={{ background: 'var(--is-surface)', borderRadius: 'var(--is-radius)', border: '1px solid var(--is-border)', boxShadow: 'var(--is-shadow-card)', overflow: 'hidden' }}
              >
                <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid var(--is-border-soft)' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--is-text-primary)' }}>{group.client}</span>
                </div>
                {group.items.map((item) => {
                  const Icon = TYPE_ICON[item.type] ?? FileText;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.route)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', borderBottom: '1px solid var(--is-border-soft)', transition: 'background 140ms ease-out' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--is-surface-2)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Icon size={13} style={{ color: 'var(--is-text-secondary)', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--is-text-primary)' }}>{item.title}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, color: 'var(--is-text-tertiary)' }}>{item.time}</span>
                        <ChevronRight size={11} style={{ color: 'var(--is-text-tertiary)' }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* By workstream */}
        {view === 'workstream' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {BY_WORKSTREAM.map((ws) => (
              <button
                key={ws.id}
                onClick={() => navigate(ws.route)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--is-surface)', borderRadius: 'var(--is-radius)', border: '1px solid var(--is-border)', boxShadow: 'var(--is-shadow-card)', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'box-shadow 140ms ease-out' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--is-shadow-out)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--is-shadow-card)'; }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--is-text-primary)', marginBottom: 3 }}>{ws.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--is-text-secondary)' }}>{ws.clients} client{ws.clients !== 1 ? 's' : ''} · {ws.period}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--is-text-secondary)', background: 'var(--is-surface-2)', padding: '3px 8px', borderRadius: 999 }}>{ws.status}</span>
                  <ChevronRight size={13} style={{ color: 'var(--is-text-tertiary)' }} />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Pinned */}
        {view === 'pinned' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PINNED.map((item) => {
              const Icon = TYPE_ICON[item.type] ?? FileText;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.route)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--is-surface)', borderRadius: 'var(--is-radius)', border: '1px solid var(--is-border)', boxShadow: 'var(--is-shadow-card)', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'box-shadow 140ms ease-out' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--is-shadow-out)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--is-shadow-card)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--is-surface-2)', boxShadow: 'var(--is-shadow-in)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={15} style={{ color: PURPLE }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--is-text-primary)' }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--is-text-secondary)', marginTop: 2 }}>{item.context}</div>
                    </div>
                  </div>
                  <ChevronRight size={13} style={{ color: 'var(--is-text-tertiary)' }} />
                </button>
              );
            })}
            {PINNED.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--is-text-tertiary)', fontSize: 13 }}>
                No pinned items yet. Pin workpapers or threads to find them quickly here.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
