// Design: "Precision Instrument" — Status indicators with dot + label pattern
import { cn } from '@/lib/utils';
import type { WorkflowStatus, ReviewStage, ClientTier } from '@/lib/data';

interface StatusBadgeProps {
  status: WorkflowStatus | ReviewStage | ClientTier | string;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<string, { dot: string; className: string }> = {
  // Workflow statuses
  'In Progress': { dot: 'bg-blue-500', className: 'status-info' },
  'Under Review': { dot: 'bg-amber-500', className: 'status-warning' },
  'Approved': { dot: 'bg-emerald-500', className: 'status-approved' },
  'Pending': { dot: 'bg-slate-400', className: 'status-pending' },
  'At Risk': { dot: 'bg-red-500 animate-pulse-dot', className: 'status-error' },
  'Complete': { dot: 'bg-emerald-500', className: 'status-approved' },
  'Not Started': { dot: 'bg-slate-500', className: 'status-pending' },
  // Review stages
  'Consultant': { dot: 'bg-blue-500', className: 'status-info' },
  'Manager': { dot: 'bg-amber-500', className: 'status-warning' },
  'Senior Manager': { dot: 'bg-orange-400', className: 'status-warning' },
  'Partner': { dot: 'bg-violet-500', className: 'status-platinum' },
  'Delivered': { dot: 'bg-emerald-500', className: 'status-approved' },
  // Client tiers
  'Platinum': { dot: 'bg-violet-500', className: 'status-platinum' },
  'Strategic': { dot: 'bg-blue-500', className: 'status-info' },
  'Standard': { dot: 'bg-slate-400', className: 'status-pending' },
};

export default function StatusBadge({ status, size = 'sm', showDot = true, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || { dot: 'bg-slate-400', className: 'status-pending' };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-1.5 font-500',
        size === 'sm' ? 'text-[10px] py-0.5' : 'text-xs py-1',
        config.className,
        className
      )}
    >
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />
      )}
      {status}
    </span>
  );
}

// Team color badge
interface TeamBadgeProps {
  name: string;
  color: string;
  abbreviation?: string;
  size?: 'sm' | 'md';
}

export function TeamBadge({ name, color, abbreviation, size = 'sm' }: TeamBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-1.5 font-500',
        size === 'sm' ? 'text-[10px] py-0.5' : 'text-xs py-1'
      )}
      style={{
        backgroundColor: `${color}18`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      {abbreviation && <span className="font-700">{abbreviation}</span>}
      {!abbreviation && name}
    </span>
  );
}

// Avatar component
interface AvatarInitialsProps {
  initials: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md';
  color?: string;
}

export function AvatarInitials({ initials, name, size = 'sm', color }: AvatarInitialsProps) {
  const sizeClass = size === 'xs' ? 'w-5 h-5 text-[9px]' : size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs';
  return (
    <div
      className={cn('rounded-full flex items-center justify-center font-600 shrink-0', sizeClass)}
      style={{
        backgroundColor: color ? `${color}20` : 'oklch(0.6 0.2 250 / 15%)',
        color: color || 'oklch(0.7 0.2 250)',
        border: `1px solid ${color ? `${color}30` : 'oklch(0.6 0.2 250 / 25%)'}`,
      }}
      title={name}
    >
      {initials}
    </div>
  );
}
