// Design: "Precision Instrument" — Dark Bloomberg-style enterprise tax workspace
// AppShell: persistent sidebar + top contextual bar + main content area

import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard, Users, FileText, Settings, ChevronRight,
  Workflow, Bell, Search, HelpCircle, LogOut, ChevronLeft,
  Building2, Wrench, Sparkles, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
  badgeColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: <LayoutDashboard size={18} />, label: 'Tax LOS Dashboard', href: '/' },
  { icon: <Building2 size={18} />, label: 'Client Workspace', href: '/client/northstar', badge: 8, badgeColor: 'amber' },
  { icon: <FileText size={18} />, label: 'Workflow Execution', href: '/workflow/fapi', badge: 2, badgeColor: 'red' },
  { icon: <Wrench size={18} />, label: 'Workflow Builder', href: '/builder' },
];

const BOTTOM_NAV: NavItem[] = [
  { icon: <BarChart3 size={18} />, label: 'Analytics', href: '/analytics' },
  { icon: <Settings size={18} />, label: 'Settings', href: '/settings' },
  { icon: <HelpCircle size={18} />, label: 'Help', href: '/help' },
];

interface AppShellProps {
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  title?: string;
}

export default function AppShell({ children, breadcrumbs, actions, title }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();

  const sidebarWidth = collapsed ? 56 : 220;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className="flex flex-col border-r border-border bg-sidebar transition-all duration-200 shrink-0 z-20"
        style={{ width: sidebarWidth }}
      >
        {/* Logo */}
        <div className="flex items-center h-14 px-3 border-b border-sidebar-border shrink-0">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <Workflow size={14} className="text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-700 text-foreground leading-tight truncate" style={{ fontWeight: 700 }}>
                  Tax Workspace
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight truncate">
                  Studio
                </div>
              </div>
            </div>
          ) : (
            <div className="w-7 h-7 rounded bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto">
              <Workflow size={14} className="text-primary" />
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {!collapsed && (
            <div className="section-divider-label px-2 mb-2">Navigation</div>
          )}
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/'
              ? location === '/'
              : location.startsWith(item.href);
            return (
              <Tooltip key={item.href} delayDuration={collapsed ? 100 : 9999}>
                <TooltipTrigger asChild>
                  <Link href={item.href}>
                    <div
                      className={cn(
                        'flex items-center gap-2.5 px-2 py-2 rounded text-sm transition-all duration-150',
                        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        isActive
                          ? 'bg-primary/15 text-primary border-l-2 border-primary pl-[6px]'
                          : 'text-sidebar-foreground',
                        collapsed && 'justify-center px-0'
                      )}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate text-[13px]">{item.label}</span>
                          {item.badge && (
                            <span className={cn(
                              'text-[10px] font-600 px-1.5 py-0.5 rounded-full leading-none',
                              item.badgeColor === 'amber' ? 'status-warning' : 'status-error'
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="text-xs">
                    {item.label}
                    {item.badge && <span className="ml-1 text-amber-400">({item.badge})</span>}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom nav */}
        <div className="py-3 px-2 border-t border-sidebar-border space-y-0.5">
          {BOTTOM_NAV.map((item) => (
            <Tooltip key={item.href} delayDuration={collapsed ? 100 : 9999}>
              <TooltipTrigger asChild>
                <div
                  onClick={() => toast.info('Feature coming soon')}
                  className={cn(
                    'flex items-center gap-2.5 px-2 py-2 rounded text-sm transition-all duration-150 cursor-pointer',
                    'hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-accent-foreground',
                    collapsed && 'justify-center px-0'
                  )}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span className="text-[13px]">{item.label}</span>}
                </div>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="text-xs">{item.label}</TooltipContent>
              )}
            </Tooltip>
          ))}

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'flex items-center gap-2.5 px-2 py-2 rounded text-sm w-full transition-all duration-150',
              'hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-accent-foreground',
              collapsed && 'justify-center px-0'
            )}
          >
            {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span className="text-[13px]">Collapse</span></>}
          </button>

          {/* User */}
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 py-2 mt-1 border-t border-sidebar-border">
              <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-600 text-primary shrink-0">
                MC
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-500 text-foreground truncate">Margaret Chen</div>
                <div className="text-[10px] text-muted-foreground truncate">Partner</div>
              </div>
              <LogOut size={13} className="text-muted-foreground shrink-0" />
            </div>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-border flex items-center px-4 gap-3 shrink-0 bg-background/95 backdrop-blur-sm">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {breadcrumbs ? (
              breadcrumbs.map((crumb, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight size={12} className="text-muted-foreground shrink-0" />}
                  {crumb.href ? (
                    <Link href={crumb.href}>
                      <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer truncate">
                        {crumb.label}
                      </span>
                    </Link>
                  ) : (
                    <span className="text-xs text-foreground font-500 truncate">{crumb.label}</span>
                  )}
                </div>
              ))
            ) : (
              <span className="text-sm font-600 text-foreground">{title || 'Tax Workspace Studio'}</span>
            )}
          </div>

          {/* Search */}
          <button
            onClick={() => toast.info('Global search — coming soon')}
            className="flex items-center gap-2 px-3 py-1.5 rounded border border-border bg-secondary/50 text-muted-foreground text-xs hover:border-primary/40 transition-colors"
          >
            <Search size={12} />
            <span className="hidden sm:inline">Search clients, workflows...</span>
            <kbd className="hidden sm:inline text-[10px] bg-muted px-1 rounded">⌘K</kbd>
          </button>

          {/* Actions */}
          {actions}

          {/* Notifications */}
          <button
            onClick={() => toast.info('Notifications — coming soon')}
            className="relative p-2 rounded hover:bg-secondary transition-colors"
          >
            <Bell size={16} className="text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse-dot" />
          </button>

          {/* AI Assistant */}
          <button
            onClick={() => toast.info('AI Assistant panel — available in Workflow Execution view')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-primary/30 bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors"
          >
            <Sparkles size={12} />
            <span className="hidden sm:inline">AI Assist</span>
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
