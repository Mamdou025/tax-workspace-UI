// Screen 4: Admin Workflow Builder Canvas
// Design: "Precision Instrument" — Professional full-screen workflow builder
// Layout: Top bar | Left palette | Center canvas | Right inspector | Bottom tabs

import { useState, useRef, useCallback } from 'react';
import {
  Save, Play, Upload, Download, ChevronDown, Plus, Trash2,
  Settings, Sparkles, Lock, FileText, Database, Calculator,
  ClipboardCheck, Package, Activity, Zap, Eye, EyeOff,
  AlertTriangle, CheckCircle2, ArrowRight, MoreHorizontal,
  Layers, Terminal, GitBranch, Globe, Search, Filter,
  Code, Cpu, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { FAPI_WORKFLOW_BLOCKS, type WorkflowBlock, type BlockType } from '@/lib/data';
import { Link } from 'wouter';

// ─── Block type config ────────────────────────────────────────────────────────
const BLOCK_CONFIG: Record<BlockType, {
  label: string; color: string; bgColor: string; borderColor: string;
  icon: React.ReactNode; description: string;
}> = {
  source: {
    label: 'Source', color: '#2F81F7', bgColor: '#2F81F718', borderColor: '#2F81F730',
    icon: <Database size={12} />, description: 'Raw evidence or reference data',
  },
  logic: {
    label: 'Logic', color: '#A371F7', bgColor: '#A371F718', borderColor: '#A371F730',
    icon: <Calculator size={12} />, description: 'Transforms, classifies, calculates',
  },
  review: {
    label: 'Review', color: '#F0883E', bgColor: '#F0883E18', borderColor: '#F0883E30',
    icon: <ClipboardCheck size={12} />, description: 'Validates and gates approval',
  },
  protected: {
    label: 'Protected', color: '#3FB950', bgColor: '#3FB95018', borderColor: '#3FB95030',
    icon: <Lock size={12} />, description: 'Governed inputs and results',
  },
  output: {
    label: 'Output', color: '#56D364', bgColor: '#56D36418', borderColor: '#56D36430',
    icon: <Package size={12} />, description: 'Final deliverables and handoffs',
  },
  ai: {
    label: 'AI / Agent', color: '#D2A8FF', bgColor: '#D2A8FF18', borderColor: '#D2A8FF30',
    icon: <Sparkles size={12} />, description: 'AI proposes — humans approve',
  },
};

// ─── Block palette items ──────────────────────────────────────────────────────
const PALETTE_ITEMS: { type: BlockType; subtype: string; label: string }[] = [
  // Source
  { type: 'source', subtype: 'Manual Entry', label: 'Manual Entry' },
  { type: 'source', subtype: 'Excel / Workbook', label: 'Excel Upload' },
  { type: 'source', subtype: 'PDF / Document', label: 'PDF Upload' },
  { type: 'source', subtype: 'Currency Rate', label: 'Currency Rate' },
  { type: 'source', subtype: 'Keyword Rules', label: 'Keyword Rules' },
  { type: 'source', subtype: 'API Source', label: 'API Source' },
  { type: 'source', subtype: 'Database Query', label: 'Database Query' },
  { type: 'source', subtype: 'AI Search Result', label: 'AI Search Result' },
  // Logic
  { type: 'logic', subtype: 'Keyword Mapper', label: 'Keyword Mapper' },
  { type: 'logic', subtype: 'Calculation Engine', label: 'Calculation Engine' },
  { type: 'logic', subtype: 'Category Rollup', label: 'Category Rollup' },
  { type: 'logic', subtype: 'Formula', label: 'Formula Block' },
  { type: 'logic', subtype: 'Condition', label: 'Condition Block' },
  { type: 'logic', subtype: 'Transformation', label: 'Transformation' },
  { type: 'logic', subtype: 'Script', label: 'Script Block' },
  // Review
  { type: 'review', subtype: 'Required Input Check', label: 'Required Input Check' },
  { type: 'review', subtype: 'Low Confidence Warning', label: 'Low Confidence Warning' },
  { type: 'review', subtype: 'Manual Override Review', label: 'Manual Override Review' },
  { type: 'review', subtype: 'Approval Gate', label: 'Approval Gate' },
  { type: 'review', subtype: 'Reviewer Sign-off', label: 'Reviewer Sign-off' },
  { type: 'review', subtype: 'Output Readiness Check', label: 'Output Readiness Check' },
  // Protected
  { type: 'protected', subtype: 'FX Rate', label: 'FX Rate' },
  { type: 'protected', subtype: 'Tax Rate', label: 'Tax Rate' },
  { type: 'protected', subtype: 'Official Tax Line', label: 'Official Tax Line' },
  { type: 'protected', subtype: 'Final Reviewed Amount', label: 'Final Reviewed Amount' },
  // Output
  { type: 'output', subtype: 'Excel Export', label: 'Excel Export' },
  { type: 'output', subtype: 'PDF Report', label: 'PDF Report' },
  { type: 'output', subtype: 'Evidence Pack', label: 'Evidence Pack' },
  { type: 'output', subtype: 'Canonical JSON', label: 'Canonical JSON' },
  { type: 'output', subtype: 'Taxprep Handoff', label: 'Taxprep Handoff' },
  // AI
  { type: 'ai', subtype: 'Ask about workflow', label: 'Ask Workflow' },
  { type: 'ai', subtype: 'Suggest mapping', label: 'Suggest Mapping' },
  { type: 'ai', subtype: 'Suggest formula', label: 'Suggest Formula' },
  { type: 'ai', subtype: 'Draft review comment', label: 'Draft Comment' },
];

// ─── Canvas Block ─────────────────────────────────────────────────────────────
function CanvasBlock({
  block, selected, onSelect
}: {
  block: WorkflowBlock; selected: boolean; onSelect: (id: string) => void;
}) {
  const config = BLOCK_CONFIG[block.type];
  const statusIcon = block.status === 'complete' ? (
    <CheckCircle2 size={10} className="text-emerald-600" />
  ) : block.status === 'active' ? (
    <div className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" />
  ) : block.status === 'error' ? (
    <AlertTriangle size={10} className="text-red-500" />
  ) : (
    <div className="w-2 h-2 rounded-full bg-border" />
  );

  return (
    <div
      className={cn('wf-node absolute', selected && 'selected')}
      style={{
        left: block.x,
        top: block.y,
        minWidth: 140,
        backgroundColor: config.bgColor,
        borderColor: selected ? config.color : config.borderColor,
        boxShadow: selected ? `0 0 0 2px ${config.color}30` : undefined,
      }}
      onClick={() => onSelect(block.id)}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span style={{ color: config.color }}>{config.icon}</span>
        <span className="text-[10px] font-600 uppercase tracking-wider" style={{ color: config.color }}>
          {config.label}
        </span>
        <div className="ml-auto">{statusIcon}</div>
      </div>
      <div className="text-[12px] font-500 text-foreground">{block.label}</div>
      {block.subtype && (
        <div className="text-[10px] text-muted-foreground mt-0.5">{block.subtype}</div>
      )}
    </div>
  );
}

// ─── SVG Connections ──────────────────────────────────────────────────────────
function CanvasConnections({ blocks }: { blocks: WorkflowBlock[] }) {
  const blockMap = Object.fromEntries(blocks.map(b => [b.id, b]));

  const paths: { from: WorkflowBlock; to: WorkflowBlock }[] = [];
  blocks.forEach(b => {
    b.connections?.forEach(toId => {
      if (blockMap[toId]) paths.push({ from: b, to: blockMap[toId] });
    });
  });

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ width: 1200, height: 600 }}>
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="oklch(0.55 0.01 240)" />
        </marker>
      </defs>
      {paths.map(({ from, to }, i) => {
        const x1 = from.x + 140;
        const y1 = from.y + 30;
        const x2 = to.x;
        const y2 = to.y + 30;
        const mx = (x1 + x2) / 2;
        return (
          <path
            key={i}
            d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
            fill="none"
            stroke="oklch(0.55 0.01 240 / 60%)"
            strokeWidth="1.5"
            markerEnd="url(#arrow)"
          />
        );
      })}
    </svg>
  );
}

// ─── Block Inspector ──────────────────────────────────────────────────────────
function BlockInspector({ block, onClose }: { block: WorkflowBlock | null; onClose: () => void }) {
  if (!block) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <Layers size={28} className="text-muted-foreground/30 mb-3" />
        <div className="text-xs text-muted-foreground">Select a block to inspect its properties</div>
      </div>
    );
  }

  const config = BLOCK_CONFIG[block.type];

  return (
    <div className="flex flex-col h-full animate-slide-in-right">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span style={{ color: config.color }}>{config.icon}</span>
          <span className="text-xs font-600 text-foreground">Block Inspector</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: config.bgColor, color: config.color, border: `1px solid ${config.borderColor}` }}>
          {config.label}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Block identity */}
        <div className="space-y-2">
          <div className="text-[10px] font-600 text-muted-foreground uppercase tracking-wider">Identity</div>
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Label</label>
            <input
              defaultValue={block.label}
              className="w-full bg-secondary/50 border border-border rounded px-2 py-1.5 text-[11px] text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Subtype</label>
            <input
              defaultValue={block.subtype || ''}
              className="w-full bg-secondary/50 border border-border rounded px-2 py-1.5 text-[11px] text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        {/* Type-specific properties */}
        {block.type === 'source' && (
          <div className="space-y-2">
            <div className="text-[10px] font-600 text-muted-foreground uppercase tracking-wider">Source Config</div>
            <div className="bg-secondary/30 border border-border rounded p-2.5 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Lock size={9} className="text-primary" />
                <span className="font-600 text-foreground">Immutability Rule</span>
              </div>
              Sources are read-only. Corrections must happen in downstream Logic blocks.
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">File Reference</label>
              <input
                placeholder="e.g. Northstar_FAPI_2024.xlsx"
                className="w-full bg-secondary/50 border border-border rounded px-2 py-1.5 text-[11px] text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>
        )}

        {block.type === 'logic' && (
          <div className="space-y-2">
            <div className="text-[10px] font-600 text-muted-foreground uppercase tracking-wider">Logic Config</div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">Formula / Rule</label>
              <textarea
                defaultValue={block.subtype?.includes('FAPI') ? 'Net FAPI = Gross Income - FAT Deduction\nGross-Up Tax = Net FAPI × Tax Rate' : ''}
                placeholder="Enter formula or rule..."
                className="w-full bg-secondary/50 border border-border rounded px-2 py-1.5 text-[11px] font-mono text-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
                rows={4}
              />
            </div>
          </div>
        )}

        {block.type === 'protected' && (
          <div className="space-y-2">
            <div className="text-[10px] font-600 text-muted-foreground uppercase tracking-wider">Protected Config</div>
            <div className="bg-green-500/8 border border-green-500/20 rounded p-2.5 text-[10px]">
              <div className="flex items-center gap-1.5 mb-1">
                <Shield size={9} className="text-emerald-600" />
                <span className="font-600 text-emerald-600">Governed Value</span>
              </div>
              <span className="text-muted-foreground">This value is locked in runtime. Editable only in builder draft mode.</span>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">Default Value</label>
              <input
                placeholder="e.g. 0.265"
                className="w-full bg-secondary/50 border border-border rounded px-2 py-1.5 text-[11px] font-mono text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>
        )}

        {block.type === 'review' && (
          <div className="space-y-2">
            <div className="text-[10px] font-600 text-muted-foreground uppercase tracking-wider">Review Config</div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">Required Reviewer Role</label>
              <select className="w-full bg-secondary/50 border border-border rounded px-2 py-1.5 text-[11px] text-foreground focus:outline-none focus:border-primary/50 transition-colors">
                <option value="manager">Manager</option>
                <option value="senior-manager">Senior Manager</option>
                <option value="partner">Partner</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">Blocking Condition</label>
              <textarea
                placeholder="Condition that must be true to pass..."
                className="w-full bg-secondary/50 border border-border rounded px-2 py-1.5 text-[11px] font-mono text-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
                rows={3}
              />
            </div>
          </div>
        )}

        {block.type === 'ai' && (
          <div className="space-y-2">
            <div className="text-[10px] font-600 text-muted-foreground uppercase tracking-wider">AI Config</div>
            <div className="bg-purple-500/8 border border-purple-500/20 rounded p-2.5 text-[10px]">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles size={9} className="text-violet-600" />
                <span className="font-600 text-violet-600">AI Proposal Rule</span>
              </div>
              <span className="text-muted-foreground">AI proposes changes. All proposals require explicit human approval before being applied.</span>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">Prompt Template</label>
              <textarea
                placeholder="e.g. Analyze the source rows and suggest keyword mappings for FAPI income classification..."
                className="w-full bg-secondary/50 border border-border rounded px-2 py-1.5 text-[11px] text-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
                rows={4}
              />
            </div>
          </div>
        )}

        {/* Connections */}
        <div className="space-y-2">
          <div className="text-[10px] font-600 text-muted-foreground uppercase tracking-wider">Connections</div>
          <div className="text-[10px] text-muted-foreground">
            {block.connections?.length ? (
              <div className="space-y-1">
                {block.connections.map(id => (
                  <div key={id} className="flex items-center gap-1.5">
                    <ArrowRight size={9} className="text-primary" />
                    <span className="text-foreground">{id}</span>
                  </div>
                ))}
              </div>
            ) : (
              'No outgoing connections'
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <button
            onClick={() => toast.success('Block configuration saved')}
            className="flex-1 text-xs py-1.5 rounded bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => toast.info('Block test run triggered')}
            className="flex-1 text-xs py-1.5 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            Test
          </button>
          <button
            onClick={() => toast.info('Block deleted')}
            className="p-1.5 rounded border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Builder Page ─────────────────────────────────────────────────────────────
export default function WorkflowBuilder() {
  const [blocks, setBlocks] = useState<WorkflowBlock[]>(FAPI_WORKFLOW_BLOCKS);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [activeBottomTab, setActiveBottomTab] = useState('structure');
  const [showGrid, setShowGrid] = useState(true);
  const [paletteFilter, setPaletteFilter] = useState<BlockType | 'all'>('all');
  const [paletteSearch, setPaletteSearch] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);

  const selected = blocks.find(b => b.id === selectedBlock) || null;

  const filteredPalette = PALETTE_ITEMS.filter(item => {
    const matchesType = paletteFilter === 'all' || item.type === paletteFilter;
    const matchesSearch = !paletteSearch || item.label.toLowerCase().includes(paletteSearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  const addBlock = (type: BlockType, subtype: string, label: string) => {
    const newBlock: WorkflowBlock = {
      id: `b${Date.now()}`,
      type,
      label,
      subtype,
      x: 200 + Math.random() * 400,
      y: 100 + Math.random() * 200,
      status: 'pending',
    };
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlock(newBlock.id);
    toast.success(`Added ${label} block`);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Builder top bar */}
      <div className="h-12 border-b border-border flex items-center px-4 gap-3 shrink-0 bg-card/80 backdrop-blur-sm">
        <Link href="/">
          <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <div className="w-5 h-5 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Activity size={11} className="text-primary" />
            </div>
            <span className="text-xs">InScope</span>
          </div>
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-600 text-foreground">FAPI Workflow Template</span>
        <span className="text-[10px] status-info px-1.5 py-0.5 rounded">Draft</span>

        <div className="flex-1" />

        {/* Builder actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={cn(
              'p-1.5 rounded border transition-colors text-xs',
              showGrid ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
            )}
            title="Toggle grid"
          >
            <Layers size={13} />
          </button>
          <button
            onClick={() => toast.info('Workflow imported')}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <Upload size={11} /> Import
          </button>
          <button
            onClick={() => toast.info('Workflow exported')}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <Download size={11} /> Export
          </button>
          <button
            onClick={() => toast.success('Workflow saved')}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <Save size={11} /> Save
          </button>
          <button
            onClick={() => toast.success('Test run started')}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <Play size={11} /> Test
          </button>
          <button
            onClick={() => toast.success('Workflow published to runtime')}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Zap size={11} /> Publish
          </button>
        </div>
      </div>

      {/* Main builder area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Block palette */}
        <div className="w-52 shrink-0 border-r border-border bg-sidebar flex flex-col overflow-hidden">
          <div className="px-3 py-2.5 border-b border-sidebar-border">
            <div className="text-[10px] font-600 text-muted-foreground uppercase tracking-wider mb-2">Block Palette</div>
            <input
              value={paletteSearch}
              onChange={e => setPaletteSearch(e.target.value)}
              placeholder="Search blocks..."
              className="w-full bg-secondary/50 border border-border rounded px-2 py-1.5 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Type filter tabs */}
          <div className="flex flex-wrap gap-1 px-2 py-2 border-b border-sidebar-border">
            {(['all', 'source', 'logic', 'review', 'protected', 'output', 'ai'] as const).map(t => (
              <button
                key={t}
                onClick={() => setPaletteFilter(t)}
                className={cn(
                  'text-[9px] px-1.5 py-0.5 rounded capitalize transition-colors',
                  paletteFilter === t
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Palette items */}
          <div className="flex-1 overflow-y-auto py-1">
            {Object.entries(
              filteredPalette.reduce((acc, item) => {
                if (!acc[item.type]) acc[item.type] = [];
                acc[item.type].push(item);
                return acc;
              }, {} as Record<string, typeof filteredPalette>)
            ).map(([type, items]) => {
              const config = BLOCK_CONFIG[type as BlockType];
              return (
                <div key={type} className="mb-1">
                  <div className="flex items-center gap-1.5 px-3 py-1.5">
                    <span style={{ color: config.color }}>{config.icon}</span>
                    <span className="text-[9px] font-600 uppercase tracking-wider" style={{ color: config.color }}>
                      {config.label}
                    </span>
                  </div>
                  {items.map(item => (
                    <button
                      key={item.subtype}
                      onClick={() => addBlock(item.type, item.subtype, item.label)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-sidebar-accent transition-colors group"
                    >
                      <div
                        className="w-1 h-1 rounded-full shrink-0"
                        style={{ backgroundColor: config.color }}
                      />
                      <span className="text-[11px] text-sidebar-foreground group-hover:text-foreground transition-colors truncate">
                        {item.label}
                      </span>
                      <Plus size={9} className="ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Canvas + Bottom tabs */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas */}
          <div
            ref={canvasRef}
            className="flex-1 relative overflow-auto"
            style={{
              backgroundImage: showGrid
                ? 'radial-gradient(circle, oklch(1 0 0 / 8%) 1px, transparent 1px)'
                : 'none',
              backgroundSize: '24px 24px',
            }}
          >
            <div className="relative" style={{ width: 1200, height: 600 }}>
              <CanvasConnections blocks={blocks} />
              {blocks.map(block => (
                <CanvasBlock
                  key={block.id}
                  block={block}
                  selected={selectedBlock === block.id}
                  onSelect={setSelectedBlock}
                />
              ))}
            </div>

            {/* Canvas hint */}
            {blocks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Layers size={40} className="mx-auto mb-3 opacity-20" />
                  <div className="text-sm">Drag blocks from the palette to build your workflow</div>
                </div>
              </div>
            )}

            {/* Block type legend */}
            <div className="absolute top-3 right-3 bg-card/90 border border-border rounded p-2.5 backdrop-blur-sm">
              <div className="text-[9px] font-600 text-muted-foreground uppercase tracking-wider mb-1.5">Block Types</div>
              {Object.entries(BLOCK_CONFIG).map(([type, config]) => (
                <div key={type} className="flex items-center gap-1.5 mb-1">
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: config.bgColor, border: `1px solid ${config.borderColor}` }} />
                  <span className="text-[9px] text-muted-foreground">{config.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom tabs */}
          <div className="border-t border-border bg-card/50 shrink-0">
            <div className="flex items-center border-b border-border px-3">
              {[
                { id: 'structure', label: 'Structure', icon: <Layers size={11} /> },
                { id: 'sources', label: 'Sources', icon: <Database size={11} /> },
                { id: 'outputs', label: 'Outputs', icon: <Package size={11} /> },
                { id: 'logs', label: 'Run Logs', icon: <Terminal size={11} /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveBottomTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 text-[11px] px-3 py-2 border-b-2 transition-colors',
                    activeBottomTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="px-4 py-2.5 h-24 overflow-auto">
              {activeBottomTab === 'structure' && (
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span>Blocks: <span className="text-foreground font-500">{blocks.length}</span></span>
                  <span>Sources: <span className="text-foreground font-500">{blocks.filter(b => b.type === 'source').length}</span></span>
                  <span>Logic: <span className="text-foreground font-500">{blocks.filter(b => b.type === 'logic').length}</span></span>
                  <span>Review: <span className="text-foreground font-500">{blocks.filter(b => b.type === 'review').length}</span></span>
                  <span>Protected: <span className="text-foreground font-500">{blocks.filter(b => b.type === 'protected').length}</span></span>
                  <span>Outputs: <span className="text-foreground font-500">{blocks.filter(b => b.type === 'output').length}</span></span>
                  <span className="ml-auto text-[10px]">Source → Logic → Review/Validation → Protected → Output</span>
                </div>
              )}
              {activeBottomTab === 'sources' && (
                <div className="text-[11px] text-muted-foreground">
                  {blocks.filter(b => b.type === 'source').map(b => (
                    <span key={b.id} className="inline-flex items-center gap-1 mr-3">
                      <Database size={9} className="text-blue-600" /> {b.label}
                    </span>
                  ))}
                </div>
              )}
              {activeBottomTab === 'outputs' && (
                <div className="text-[11px] text-muted-foreground">
                  {blocks.filter(b => b.type === 'output').map(b => (
                    <span key={b.id} className="inline-flex items-center gap-1 mr-3">
                      <Package size={9} className="text-emerald-600" /> {b.label}
                    </span>
                  ))}
                </div>
              )}
              {activeBottomTab === 'logs' && (
                <div className="font-mono text-[10px] text-muted-foreground space-y-0.5">
                  <div><span className="text-emerald-600">[OK]</span> Source blocks loaded — 3 sources</div>
                  <div><span className="text-emerald-600">[OK]</span> Keyword Mapper executed — 8 rows classified</div>
                  <div><span className="text-primary">[RUN]</span> Calculation Engine running — FAPI / FAT / Net</div>
                  <div><span className="text-amber-600">[WARN]</span> Exception Check: 2 exceptions flagged</div>
                  <div><span className="text-muted-foreground">[WAIT]</span> Approval Gate: awaiting manager sign-off</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Inspector */}
        <div className="w-64 shrink-0 border-l border-border bg-card overflow-hidden">
          <BlockInspector block={selected} onClose={() => setSelectedBlock(null)} />
        </div>
      </div>
    </div>
  );
}
