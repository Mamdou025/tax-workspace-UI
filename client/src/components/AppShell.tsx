// AppShell — Sinaxe TaxWorkbench
// Design: Narrow icon-only collapsible sidebar (56px collapsed / 200px expanded).
// Matches the Genspark-style reference: icon column on left, workspace fills the rest.
// Grayscale + deep navy palette. No top bar — sidebar is the only chrome.

import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Layers, LayoutDashboard, Building2, FileText,
  Wrench, BarChart3, Settings, HelpCircle, ChevronRight, ChevronLeft,
  LogOut, Workflow, Bell, Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface NavItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  href: string;
  badge?: number;
  badgeColor?: 'amber' | 'red';
}

const NAV_ITEMS: NavItem[] = [
  { icon: Layers,         label: 'Tax BU Overview',        href: '/bu-overview' },
  { icon: LayoutDashboard,label: 'Practitioner Dashboard', href: '/dashboard' },
  { icon: Building2,      label: 'Client Workspace',       href: '/client/northstar', badge: 8,  badgeColor: 'amber' },
  { icon: FileText,       label: 'Workflow Execution',     href: '/workflow/fapi',    badge: 2,  badgeColor: 'red' },
  { icon: Wrench,         label: 'Workflow Builder',       href: '/builder' },
];

const BOTTOM_NAV: NavItem[] = [
  { icon: BarChart3,   label: 'Analytics', href: '/analytics' },
  { icon: Settings,    label: 'Settings',  href: '/settings' },
  { icon: HelpCircle,  label: 'Help',      href: '/help' },
];

interface AppShellProps {
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  hideTopBar?: boolean;
}

export default function AppShell({ children, breadcrumbs, actions, hideTopBar }: AppShellProps) {
  const [expanded, setExpanded] = useState(false);
  const [location] = useLocation();

  const isActive = (item: NavItem) => {
    if (item.href === '/bu-overview') return location === '/bu-overview';
    if (item.href === '/dashboard') return location === '/dashboard';
    return location.startsWith(item.href);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Narrow sidebar ───────────────────────────────────────────────────── */}
      <aside
        className={cn(
          'flex flex-col border-r border-border bg-sidebar shrink-0 z-30',
          'transition-all duration-200 ease-out',
          expanded ? 'w-[200px]' : 'w-[56px]'
        )}
      >
        {/* Logo mark */}
        <div className={cn(
          'flex items-center h-14 border-b border-sidebar-border shrink-0',
          expanded ? 'px-3 gap-2.5' : 'justify-center'
        )}>
          <div className="w-8 h-8 rounded-lg bg-[#0F2044] flex items-center justify-center shrink-0">
            <Workflow size={15} className="text-white" />
          </div>
          {expanded && (
            <div className="min-w-0">
              <div className="text-[11px] font-700 text-[#0F2044] leading-tight truncate">Sinaxe</div>
              <div className="text-[10px] text-slate-400 leading-tight truncate">TaxWorkbench</div>
            </div>
          )}
        </div>

        {/* Home button — always navigates back to Workbench */}
        <div className="px-1.5 pt-2 pb-1">
          <Tooltip delayDuration={expanded ? 9999 : 80}>
            <TooltipTrigger asChild>
              <Link href="/">
                <div className={cn(
                  'relative flex items-center rounded-lg transition-all duration-150 cursor-pointer',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  expanded ? 'gap-2.5 px-2.5 py-2' : 'justify-center w-9 h-9 mx-auto',
                  location === '/'
                    ? 'bg-[#0F2044]/10 text-[#0F2044]'
                    : 'text-slate-500'
                )}>
                  {location === '/' && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-[#0F2044]" />
                  )}
                  <Home size={18} className={location === '/' ? 'text-[#0F2044]' : 'text-slate-400'} />
                  {expanded && <span className="flex-1 truncate text-[12px] font-500">Workbench</span>}
                </div>
              </Link>
            </TooltipTrigger>
            {!expanded && (
              <TooltipContent side="right" className="text-xs">Workbench (Home)</TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Divider */}
        <div className="mx-3 border-t border-sidebar-border mb-1" />

        {/* Main nav */}
        <nav className="flex-1 py-1 px-1.5 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Tooltip key={item.href} delayDuration={expanded ? 9999 : 80}>
                <TooltipTrigger asChild>
                  <Link href={item.href}>
                    <div className={cn(
                      'relative flex items-center rounded-lg transition-all duration-150 cursor-pointer',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      expanded ? 'gap-2.5 px-2.5 py-2' : 'justify-center w-9 h-9 mx-auto',
                      active
                        ? 'bg-[#0F2044]/10 text-[#0F2044]'
                        : 'text-slate-500'
                    )}>
                      {/* Active indicator */}
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-[#0F2044]" />
                      )}
                      <Icon size={18} className={active ? 'text-[#0F2044]' : 'text-slate-400'} />
                      {expanded && (
                        <>
                          <span className="flex-1 truncate text-[12px] font-500">{item.label}</span>
                          {item.badge && (
                            <span className={cn(
                              'text-[9px] font-700 px-1.5 py-0.5 rounded-full leading-none',
                              item.badgeColor === 'amber'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-600'
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {/* Collapsed badge dot */}
                      {!expanded && item.badge && (
                        <span className={cn(
                          'absolute top-1 right-1 w-1.5 h-1.5 rounded-full',
                          item.badgeColor === 'amber' ? 'bg-amber-500' : 'bg-red-500'
                        )} />
                      )}
                    </div>
                  </Link>
                </TooltipTrigger>
                {!expanded && (
                  <TooltipContent side="right" className="text-xs">
                    {item.label}
                    {item.badge && (
                      <span className={cn('ml-1.5', item.badgeColor === 'amber' ? 'text-amber-500' : 'text-red-400')}>
                        {item.badge}
                      </span>
                    )}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom nav */}
        <div className="py-2 px-1.5 border-t border-sidebar-border space-y-0.5">
          {BOTTOM_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Tooltip key={item.href} delayDuration={expanded ? 9999 : 80}>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => toast.info('Feature coming soon')}
                    className={cn(
                      'flex items-center rounded-lg transition-all duration-150 cursor-pointer',
                      'hover:bg-sidebar-accent text-slate-400 hover:text-slate-600',
                      expanded ? 'gap-2.5 px-2.5 py-2' : 'justify-center w-9 h-9 mx-auto'
                    )}
                  >
                    <Icon size={17} />
                    {expanded && <span className="text-[12px] font-500">{item.label}</span>}
                  </div>
                </TooltipTrigger>
                {!expanded && (
                  <TooltipContent side="right" className="text-xs">{item.label}</TooltipContent>
                )}
              </Tooltip>
            );
          })}

          {/* Collapse toggle */}
          <Tooltip delayDuration={80}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setExpanded(e => !e)}
                className={cn(
                  'flex items-center rounded-lg transition-all duration-150 w-full',
                  'hover:bg-sidebar-accent text-slate-400 hover:text-slate-600',
                  expanded ? 'gap-2.5 px-2.5 py-2' : 'justify-center w-9 h-9 mx-auto'
                )}
              >
                {expanded
                  ? <><ChevronLeft size={17} /><span className="text-[12px] font-500">Collapse</span></>
                  : <ChevronRight size={17} />
                }
              </button>
            </TooltipTrigger>
            {!expanded && <TooltipContent side="right" className="text-xs">Expand</TooltipContent>}
          </Tooltip>

          {/* User avatar */}
          <div className={cn(
            'flex items-center mt-1 pt-2 border-t border-sidebar-border',
            expanded ? 'gap-2 px-2.5 py-1.5' : 'justify-center py-1.5'
          )}>
            <div className="w-7 h-7 rounded-full bg-[#0F2044] flex items-center justify-center text-[10px] font-700 text-white shrink-0">
              MC
            </div>
            {expanded && (
              <>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-500 text-slate-700 truncate">Margaret Chen</div>
                  <div className="text-[10px] text-slate-400 truncate">Partner</div>
                </div>
                <LogOut size={13} className="text-slate-400 shrink-0" />
              </>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main content area ─────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Contextual top bar — only shown on inner pages (not the workbench home) */}
        {!hideTopBar && breadcrumbs && (
          <header className="h-12 border-b border-border flex items-center px-5 gap-3 shrink-0 bg-background/95 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 flex-1 min-w-0 text-xs text-slate-500">
              {breadcrumbs.map((crumb, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight size={11} className="text-slate-300 shrink-0" />}
                  {crumb.href ? (
                    <Link href={crumb.href}>
                      <span className="hover:text-slate-700 transition-colors cursor-pointer truncate">{crumb.label}</span>
                    </Link>
                  ) : (
                    <span className="text-slate-800 font-600 truncate">{crumb.label}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <button
                onClick={() => toast.info('Notifications — coming soon')}
                className="relative p-1.5 rounded hover:bg-slate-100 transition-colors"
              >
                <Bell size={15} className="text-slate-400" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
              </button>
            </div>
          </header>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
