// Mock data for Tax Digital Workspace Studio
// Design: "Precision Instrument" — Bloomberg/terminal dark aesthetic

export type ClientTier = 'Platinum' | 'Strategic' | 'Standard';
export type WorkflowStatus = 'In Progress' | 'Under Review' | 'Approved' | 'Pending' | 'At Risk' | 'Complete' | 'Not Started' | 'Awaiting Partner Sign-off';
export type ReviewStage = 'Consultant' | 'Manager' | 'Senior Manager' | 'Partner' | 'Delivered';
export type BlockType = 'source' | 'logic' | 'review' | 'protected' | 'output' | 'ai';

export interface TeamMember {
  id: string;
  name: string;
  role: 'Consultant' | 'Manager' | 'Senior Manager' | 'Partner';
  initials: string;
}

export interface TaxTeam {
  id: string;
  name: string;
  color: string;
  abbreviation: string;
}

export interface WorkflowCard {
  id: string;
  name: string;
  team: string;
  teamColor: string;
  preparer: string;
  manager: string;
  seniorManager: string;
  partner: string;
  status: WorkflowStatus;
  reviewStage: ReviewStage;
  dueDate: string;
  lastActivity: string;
  outputReady: boolean;
  year: string;
  exceptions?: number;
  openItems?: number;
}

export interface Client {
  id: string;
  name: string;
  tier: ClientTier;
  leadPartner: string;
  partners: string[];
  teams: string[];
  workflows: WorkflowCard[];
  upcomingDeadlines: number;
  openReviewItems: number;
  atRiskDeliverables: number;
  lastActivity: string;
}

// ─── Tax Teams ────────────────────────────────────────────────────────────────
export const TAX_TEAMS: TaxTeam[] = [
  { id: 'compliance', name: 'Tax Compliance', color: '#2F81F7', abbreviation: 'TC' },
  { id: 'intl', name: 'International Corporate Tax', color: '#A371F7', abbreviation: 'ICT' },
  { id: 'incentives', name: 'Tax Incentives', color: '#3FB950', abbreviation: 'TI' },
  { id: 'ma', name: 'M&A Tax', color: '#F0883E', abbreviation: 'M&A' },
  { id: 'us', name: 'US Tax', color: '#58A6FF', abbreviation: 'US' },
  { id: 'indirect', name: 'Indirect Tax', color: '#D2A8FF', abbreviation: 'IND' },
  { id: 'tp', name: 'Transfer Pricing', color: '#56D364', abbreviation: 'TP' },
];

// ─── Team Members ─────────────────────────────────────────────────────────────
export const TEAM_MEMBERS: TeamMember[] = [
  { id: 'p1', name: 'Margaret Chen', role: 'Partner', initials: 'MC' },
  { id: 'p2', name: 'David Okafor', role: 'Partner', initials: 'DO' },
  { id: 'p3', name: 'Sarah Lindqvist', role: 'Partner', initials: 'SL' },
  { id: 'sm1', name: 'James Whitfield', role: 'Senior Manager', initials: 'JW' },
  { id: 'sm2', name: 'Priya Nair', role: 'Senior Manager', initials: 'PN' },
  { id: 'm1', name: 'Alex Bouchard', role: 'Manager', initials: 'AB' },
  { id: 'm2', name: 'Lena Hoffmann', role: 'Manager', initials: 'LH' },
  { id: 'c1', name: 'Ryan Tran', role: 'Consultant', initials: 'RT' },
  { id: 'c2', name: 'Aisha Kamara', role: 'Consultant', initials: 'AK' },
  { id: 'c3', name: 'Marcus Webb', role: 'Consultant', initials: 'MW' },
];

// ─── Northstar Holdings Workflows ─────────────────────────────────────────────
export const NORTHSTAR_WORKFLOWS: WorkflowCard[] = [
  {
    id: 'wf-fapi',
    name: 'FAPI Workpaper 2025',
    team: 'International Corporate Tax',
    teamColor: '#A371F7',
    preparer: 'Ryan Tran',
    manager: 'Alex Bouchard',
    seniorManager: 'James Whitfield',
    partner: 'Margaret Chen',
    status: 'Under Review',
    reviewStage: 'Manager',
    dueDate: '2025-06-30',
    lastActivity: '2 hours ago',
    outputReady: false,
    year: '2025',
    exceptions: 2,
    openItems: 3,
  },
  {
    id: 'wf-t2',
    name: 'T2 Corporate Return 2024',
    team: 'Tax Compliance',
    teamColor: '#2F81F7',
    preparer: 'Aisha Kamara',
    manager: 'Lena Hoffmann',
    seniorManager: 'Priya Nair',
    partner: 'David Okafor',
    status: 'In Progress',
    reviewStage: 'Consultant',
    dueDate: '2025-06-15',
    lastActivity: '4 hours ago',
    outputReady: false,
    year: '2024',
    exceptions: 0,
    openItems: 1,
  },
  {
    id: 'wf-t1134',
    name: 'T1134 Foreign Affiliate 2024',
    team: 'International Corporate Tax',
    teamColor: '#A371F7',
    preparer: 'Marcus Webb',
    manager: 'Alex Bouchard',
    seniorManager: 'James Whitfield',
    partner: 'Margaret Chen',
    status: 'In Progress',
    reviewStage: 'Consultant',
    dueDate: '2025-07-31',
    lastActivity: '1 day ago',
    outputReady: false,
    year: '2024',
    exceptions: 1,
    openItems: 2,
  },
  {
    id: 'wf-surplus',
    name: 'Surplus Calculations 2024',
    team: 'International Corporate Tax',
    teamColor: '#A371F7',
    preparer: 'Ryan Tran',
    manager: 'Alex Bouchard',
    seniorManager: 'James Whitfield',
    partner: 'Margaret Chen',
    status: 'Pending',
    reviewStage: 'Consultant',
    dueDate: '2025-08-15',
    lastActivity: '3 days ago',
    outputReady: false,
    year: '2024',
    exceptions: 0,
    openItems: 0,
  },
  {
    id: 'wf-pillar2',
    name: 'Pillar 2 GloBE Assessment 2024',
    team: 'International Corporate Tax',
    teamColor: '#A371F7',
    preparer: 'Aisha Kamara',
    manager: 'Lena Hoffmann',
    seniorManager: 'Priya Nair',
    partner: 'Margaret Chen',
    status: 'At Risk',
    reviewStage: 'Consultant',
    dueDate: '2025-05-31',
    lastActivity: '5 hours ago',
    outputReady: false,
    year: '2024',
    exceptions: 4,
    openItems: 6,
  },
  {
    id: 'wf-ma',
    name: 'M&A Transaction Memo — Project Maple',
    team: 'M&A Tax',
    teamColor: '#F0883E',
    preparer: 'Marcus Webb',
    manager: 'Lena Hoffmann',
    seniorManager: 'Priya Nair',
    partner: 'Sarah Lindqvist',
    status: 'Under Review',
    reviewStage: 'Senior Manager',
    dueDate: '2025-05-28',
    lastActivity: '1 hour ago',
    outputReady: false,
    year: '2025',
    exceptions: 0,
    openItems: 1,
  },
];

// ─── Clients ──────────────────────────────────────────────────────────────────
export const CLIENTS: Client[] = [
  {
    id: 'northstar',
    name: 'Northstar Holdings Inc.',
    tier: 'Platinum',
    leadPartner: 'Margaret Chen',
    partners: ['Margaret Chen', 'David Okafor', 'Sarah Lindqvist'],
    teams: ['Tax Compliance', 'International Corporate Tax', 'M&A Tax', 'US Tax'],
    workflows: NORTHSTAR_WORKFLOWS,
    upcomingDeadlines: 3,
    openReviewItems: 8,
    atRiskDeliverables: 2,
    lastActivity: '2 hours ago',
  },
  {
    id: 'meridian',
    name: 'Meridian Energy Corp.',
    tier: 'Strategic',
    leadPartner: 'David Okafor',
    partners: ['David Okafor'],
    teams: ['Tax Compliance', 'Transfer Pricing'],
    workflows: [
      {
        id: 'wf-mer-t2',
        name: 'T2 Corporate Return 2024',
        team: 'Tax Compliance',
        teamColor: '#2F81F7',
        preparer: 'Aisha Kamara',
        manager: 'Lena Hoffmann',
        seniorManager: 'Priya Nair',
        partner: 'David Okafor',
        status: 'Approved',
        reviewStage: 'Partner',
        dueDate: '2025-06-15',
        lastActivity: '2 days ago',
        outputReady: true,
        year: '2024',
        exceptions: 0,
        openItems: 0,
      },
      {
        id: 'wf-mer-tp',
        name: 'Transfer Pricing Documentation 2024',
        team: 'Transfer Pricing',
        teamColor: '#56D364',
        preparer: 'Marcus Webb',
        manager: 'Alex Bouchard',
        seniorManager: 'James Whitfield',
        partner: 'David Okafor',
        status: 'In Progress',
        reviewStage: 'Consultant',
        dueDate: '2025-09-30',
        lastActivity: '1 day ago',
        outputReady: false,
        year: '2024',
        exceptions: 0,
        openItems: 1,
      },
    ],
    upcomingDeadlines: 1,
    openReviewItems: 1,
    atRiskDeliverables: 0,
    lastActivity: '2 days ago',
  },
  {
    id: 'atlas',
    name: 'Atlas Financial Group',
    tier: 'Platinum',
    leadPartner: 'Sarah Lindqvist',
    partners: ['Sarah Lindqvist', 'Margaret Chen'],
    teams: ['Tax Compliance', 'International Corporate Tax', 'Indirect Tax'],
    workflows: [
      {
        id: 'wf-atl-t2',
        name: 'T2 Corporate Return 2024',
        team: 'Tax Compliance',
        teamColor: '#2F81F7',
        preparer: 'Ryan Tran',
        manager: 'Alex Bouchard',
        seniorManager: 'James Whitfield',
        partner: 'Sarah Lindqvist',
        status: 'Under Review',
        reviewStage: 'Senior Manager',
        dueDate: '2025-06-15',
        lastActivity: '6 hours ago',
        outputReady: false,
        year: '2024',
        exceptions: 1,
        openItems: 2,
      },
    ],
    upcomingDeadlines: 2,
    openReviewItems: 3,
    atRiskDeliverables: 1,
    lastActivity: '6 hours ago',
  },
  {
    id: 'cascade',
    name: 'Cascade Technologies Ltd.',
    tier: 'Standard',
    leadPartner: 'David Okafor',
    partners: ['David Okafor'],
    teams: ['Tax Compliance', 'Tax Incentives'],
    workflows: [
      {
        id: 'wf-cas-t2',
        name: 'T2 Corporate Return 2024',
        team: 'Tax Compliance',
        teamColor: '#2F81F7',
        preparer: 'Aisha Kamara',
        manager: 'Lena Hoffmann',
        seniorManager: 'Priya Nair',
        partner: 'David Okafor',
        status: 'Complete',
        reviewStage: 'Delivered',
        dueDate: '2025-04-30',
        lastActivity: '1 week ago',
        outputReady: true,
        year: '2024',
        exceptions: 0,
        openItems: 0,
      },
      {
        id: 'wf-cas-rd',
        name: 'R&D Tax Credit Claim 2024',
        team: 'Tax Incentives',
        teamColor: '#3FB950',
        preparer: 'Marcus Webb',
        manager: 'Alex Bouchard',
        seniorManager: 'James Whitfield',
        partner: 'David Okafor',
        status: 'In Progress',
        reviewStage: 'Consultant',
        dueDate: '2025-07-15',
        lastActivity: '3 days ago',
        outputReady: false,
        year: '2024',
        exceptions: 0,
        openItems: 1,
      },
    ],
    upcomingDeadlines: 1,
    openReviewItems: 1,
    atRiskDeliverables: 0,
    lastActivity: '3 days ago',
  },
  {
    id: 'vantage',
    name: 'Vantage Capital Partners',
    tier: 'Strategic',
    leadPartner: 'Sarah Lindqvist',
    partners: ['Sarah Lindqvist'],
    teams: ['M&A Tax', 'Transfer Pricing'],
    workflows: [
      {
        id: 'wf-van-ma',
        name: 'M&A Transaction Memo — Project Cedar',
        team: 'M&A Tax',
        teamColor: '#F0883E',
        preparer: 'Ryan Tran',
        manager: 'Lena Hoffmann',
        seniorManager: 'Priya Nair',
        partner: 'Sarah Lindqvist',
        status: 'At Risk',
        reviewStage: 'Consultant',
        dueDate: '2025-05-25',
        lastActivity: '30 minutes ago',
        outputReady: false,
        year: '2025',
        exceptions: 3,
        openItems: 5,
      },
    ],
    upcomingDeadlines: 2,
    openReviewItems: 5,
    atRiskDeliverables: 1,
    lastActivity: '30 minutes ago',
  },
];

// ─── FAPI Workpaper Detail Data ────────────────────────────────────────────────
export interface FAPISourceRow {
  id: string;
  entity: string;
  country: string;
  incomeType: string;
  grossAmount: number;
  currency: string;
  fxRate: number;
  cadAmount: number;
  category: string;
  confidence: number;
  flag?: string;
}

export const FAPI_SOURCE_ROWS: FAPISourceRow[] = [
  { id: 'r1', entity: 'Northstar US LLC', country: 'USA', incomeType: 'Dividend', grossAmount: 4250000, currency: 'USD', fxRate: 1.3642, cadAmount: 5797850, category: 'FAPI — Dividends', confidence: 98, },
  { id: 'r2', entity: 'Northstar DE GmbH', country: 'Germany', incomeType: 'Interest', grossAmount: 1820000, currency: 'EUR', fxRate: 1.4821, cadAmount: 2697422, category: 'FAPI — Interest', confidence: 95, },
  { id: 'r3', entity: 'Northstar UK Ltd', country: 'UK', incomeType: 'Royalty', grossAmount: 980000, currency: 'GBP', fxRate: 1.7234, cadAmount: 1688932, category: 'FAPI — Royalties', confidence: 92, },
  { id: 'r4', entity: 'Northstar SG Pte', country: 'Singapore', incomeType: 'Dividend', grossAmount: 2100000, currency: 'SGD', fxRate: 1.0012, cadAmount: 2102520, category: 'FAPI — Dividends', confidence: 97, },
  { id: 'r5', entity: 'Northstar HK Ltd', country: 'Hong Kong', incomeType: 'Interest', grossAmount: 650000, currency: 'HKD', fxRate: 0.1742, cadAmount: 113230, category: 'FAPI — Interest', confidence: 89, flag: 'Low confidence — verify FX rate' },
  { id: 'r6', entity: 'Northstar CH AG', country: 'Switzerland', incomeType: 'Dividend', grossAmount: 3400000, currency: 'CHF', fxRate: 1.5234, cadAmount: 5179560, category: 'FAPI — Dividends', confidence: 99, },
  { id: 'r7', entity: 'Northstar AU Pty', country: 'Australia', incomeType: 'Royalty', grossAmount: 420000, currency: 'AUD', fxRate: 0.8921, cadAmount: 374682, category: 'FAPI — Royalties', confidence: 94, },
  { id: 'r8', entity: 'Northstar JP KK', country: 'Japan', incomeType: 'Interest', grossAmount: 85000000, currency: 'JPY', fxRate: 0.009142, cadAmount: 777070, category: 'FAPI — Interest', confidence: 91, flag: 'Pending treaty analysis' },
];

export interface FAPICalculationRow {
  id: string;
  category: string;
  grossIncome: number;
  fatDeduction: number;
  netFAPI: number;
  taxRate: number;
  grossUpTax: number;
  notes?: string;
  protected: boolean;
}

export const FAPI_CALCULATIONS: FAPICalculationRow[] = [
  { id: 'c1', category: 'FAPI — Dividends', grossIncome: 13079930, fatDeduction: 1962000, netFAPI: 11117930, taxRate: 0.265, grossUpTax: 2946251, protected: true },
  { id: 'c2', category: 'FAPI — Interest', grossIncome: 3587722, fatDeduction: 538158, netFAPI: 3049564, taxRate: 0.265, grossUpTax: 808134, protected: true },
  { id: 'c3', category: 'FAPI — Royalties', grossIncome: 2063614, fatDeduction: 309542, netFAPI: 1754072, taxRate: 0.265, grossUpTax: 464829, protected: true },
];

export interface ReviewComment {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  content: string;
  type: 'comment' | 'change-request' | 'approval' | 'rejection';
  resolved?: boolean;
}

export const FAPI_REVIEW_TRAIL: ReviewComment[] = [
  { id: 'rv1', author: 'Ryan Tran', role: 'Consultant', timestamp: '2025-05-15 09:14', content: 'First pass complete. All source rows mapped. FX rates applied from BoC published rates. Two items flagged for manager review: HK FX rate and JP treaty analysis.', type: 'comment' },
  { id: 'rv2', author: 'Alex Bouchard', role: 'Manager', timestamp: '2025-05-16 14:22', content: 'Reviewed dividend and interest categories. Calculations look correct. Please confirm the HK FX rate source — I want to see the BoC reference date used.', type: 'change-request', resolved: false },
  { id: 'rv3', author: 'Ryan Tran', role: 'Consultant', timestamp: '2025-05-16 15:45', content: 'HK FX rate sourced from BoC published rate 2024-12-31. Reference added to evidence pack. JP treaty analysis is pending — will upload memo by EOD.', type: 'comment' },
  { id: 'rv4', author: 'Alex Bouchard', role: 'Manager', timestamp: '2025-05-17 10:08', content: 'HK FX confirmed. Awaiting JP treaty memo before sign-off. FAT deduction calculation looks correct — matches prior year methodology.', type: 'comment' },
];

export interface WorkflowBlock {
  id: string;
  type: BlockType;
  label: string;
  subtype?: string;
  x: number;
  y: number;
  status?: 'complete' | 'active' | 'pending' | 'error';
  connections?: string[];
}

export const FAPI_WORKFLOW_BLOCKS: WorkflowBlock[] = [
  { id: 'b1', type: 'source', label: 'Excel Upload', subtype: 'Excel / Workbook', x: 80, y: 80, status: 'complete', connections: ['b4'] },
  { id: 'b2', type: 'source', label: 'PDF Upload', subtype: 'PDF / Document', x: 80, y: 200, status: 'complete', connections: ['b4'] },
  { id: 'b3', type: 'source', label: 'Currency Rate', subtype: 'BoC FX Rates', x: 80, y: 320, status: 'complete', connections: ['b5'] },
  { id: 'b4', type: 'logic', label: 'Keyword Mapper', subtype: 'Income Classification', x: 280, y: 140, status: 'complete', connections: ['b5'] },
  { id: 'b5', type: 'logic', label: 'Calculation Engine', subtype: 'FAPI / FAT / Net', x: 480, y: 200, status: 'active', connections: ['b6', 'b7'] },
  { id: 'b6', type: 'review', label: 'Exception Check', subtype: 'Low Confidence Warning', x: 680, y: 120, status: 'error', connections: ['b8'] },
  { id: 'b7', type: 'protected', label: 'Net FAPI', subtype: 'Protected Result', x: 680, y: 280, status: 'active', connections: ['b8'] },
  { id: 'b8', type: 'review', label: 'Approval Gate', subtype: 'Manager Sign-off', x: 880, y: 200, status: 'pending', connections: ['b9', 'b10'] },
  { id: 'b9', type: 'output', label: 'Excel Export', subtype: 'Workpaper Output', x: 1080, y: 120, status: 'pending' },
  { id: 'b10', type: 'output', label: 'Evidence Pack', subtype: 'PDF + JSON', x: 1080, y: 280, status: 'pending' },
];

// ─── Dashboard Stats ───────────────────────────────────────────────────────────
export const DASHBOARD_STATS = {
  totalClients: 5,
  activeWorkflows: 12,
  pendingReviews: 8,
  upcomingDeadlines: 9,
  atRiskDeliverables: 3,
  completedThisMonth: 4,
};

export const RECENT_ACTIVITY = [
  { id: 'a1', type: 'review', text: 'Alex Bouchard requested changes on FAPI Workpaper 2025 — Northstar Holdings', time: '2 hours ago', icon: 'message' },
  { id: 'a2', type: 'upload', text: 'Ryan Tran uploaded 3 source documents to T1134 Foreign Affiliate 2024', time: '4 hours ago', icon: 'upload' },
  { id: 'a3', type: 'ai', text: 'AI Assistant suggested 4 keyword mappings for Northstar FAPI — 2 accepted', time: '5 hours ago', icon: 'ai' },
  { id: 'a4', type: 'approval', text: 'Sarah Lindqvist approved M&A Transaction Memo — Project Maple for partner review', time: '6 hours ago', icon: 'check' },
  { id: 'a5', type: 'exception', text: 'Pillar 2 GloBE Assessment flagged 4 exceptions — immediate attention required', time: '8 hours ago', icon: 'alert' },
  { id: 'a6', type: 'complete', text: 'T2 Corporate Return 2024 — Cascade Technologies delivered to client', time: '1 week ago', icon: 'complete' },
];

// ─── Executive Overview — Lines of Service ────────────────────────────────────
export interface LineOfService {
  id: string;
  name: string;
  abbreviation: string;
  color: string;           // hex accent color
  bgClass: string;         // tailwind bg utility for card header
  leadPartner: string;
  leadPartnerInitials: string;
  activeClients: number;
  activeWorkflows: number;
  pendingReviews: number;
  atRisk: number;
  upcomingDeadlines: number;
  completedMTD: number;
  revenueYTD: string;      // formatted string
  trend: 'up' | 'down' | 'flat';
  trendPct: string;
  description: string;
  sharedDataClients: string[];   // clients whose data is shared across LOS
  keyDeliverables: string[];
}

export const LINES_OF_SERVICE: LineOfService[] = [
  {
    id: 'compliance',
    name: 'Tax Compliance',
    abbreviation: 'TC',
    color: '#1B5FD4',
    bgClass: 'bg-blue-600',
    leadPartner: 'David Okafor',
    leadPartnerInitials: 'DO',
    activeClients: 5,
    activeWorkflows: 5,
    pendingReviews: 3,
    atRisk: 0,
    upcomingDeadlines: 4,
    completedMTD: 2,
    revenueYTD: '$1.2M',
    trend: 'up',
    trendPct: '+8%',
    description: 'Corporate T2 returns, provincial filings, and annual compliance obligations for all client entities.',
    sharedDataClients: ['northstar', 'meridian', 'atlas', 'cascade'],
    keyDeliverables: ['T2 Corporate Returns', 'Provincial Filings', 'Instalment Schedules'],
  },
  {
    id: 'intl',
    name: 'International Corporate Tax',
    abbreviation: 'ICT',
    color: '#7C3AED',
    bgClass: 'bg-violet-600',
    leadPartner: 'Margaret Chen',
    leadPartnerInitials: 'MC',
    activeClients: 3,
    activeWorkflows: 4,
    pendingReviews: 4,
    atRisk: 2,
    upcomingDeadlines: 3,
    completedMTD: 0,
    revenueYTD: '$2.1M',
    trend: 'up',
    trendPct: '+14%',
    description: 'FAPI, T1134 foreign affiliate reporting, surplus calculations, Pillar 2 GloBE assessments, and cross-border structuring.',
    sharedDataClients: ['northstar', 'atlas'],
    keyDeliverables: ['FAPI Workpapers', 'T1134 Schedules', 'Surplus Calculations', 'Pillar 2 Reports'],
  },
  {
    id: 'ma',
    name: 'M&A Tax',
    abbreviation: 'M&A',
    color: '#D97706',
    bgClass: 'bg-amber-600',
    leadPartner: 'Sarah Lindqvist',
    leadPartnerInitials: 'SL',
    activeClients: 2,
    activeWorkflows: 2,
    pendingReviews: 2,
    atRisk: 1,
    upcomingDeadlines: 2,
    completedMTD: 0,
    revenueYTD: '$3.4M',
    trend: 'up',
    trendPct: '+22%',
    description: 'Transaction structuring, due diligence, tax opinions, and post-acquisition integration for M&A mandates.',
    sharedDataClients: ['northstar', 'vantage'],
    keyDeliverables: ['Transaction Memos', 'Due Diligence Reports', 'Tax Opinions'],
  },
  {
    id: 'indirect',
    name: 'Indirect Tax',
    abbreviation: 'IND',
    color: '#0891B2',
    bgClass: 'bg-cyan-600',
    leadPartner: 'David Okafor',
    leadPartnerInitials: 'DO',
    activeClients: 2,
    activeWorkflows: 2,
    pendingReviews: 1,
    atRisk: 0,
    upcomingDeadlines: 1,
    completedMTD: 1,
    revenueYTD: '$0.6M',
    trend: 'flat',
    trendPct: '0%',
    description: 'GST/HST, PST, customs duties, and indirect tax compliance and advisory for domestic and cross-border transactions.',
    sharedDataClients: ['atlas', 'cascade'],
    keyDeliverables: ['GST/HST Returns', 'Indirect Tax Reviews', 'Customs Opinions'],
  },
  {
    id: 'rd',
    name: 'R&D / Tax Incentives',
    abbreviation: 'R&D',
    color: '#16A34A',
    bgClass: 'bg-green-600',
    leadPartner: 'David Okafor',
    leadPartnerInitials: 'DO',
    activeClients: 2,
    activeWorkflows: 2,
    pendingReviews: 1,
    atRisk: 0,
    upcomingDeadlines: 2,
    completedMTD: 1,
    revenueYTD: '$0.8M',
    trend: 'up',
    trendPct: '+5%',
    description: 'SR&ED claims, investment tax credits, government incentive programs, and innovation-related tax planning.',
    sharedDataClients: ['cascade'],
    keyDeliverables: ['SR&ED Claims', 'ITC Calculations', 'CRA Audit Support'],
  },
  {
    id: 'us',
    name: 'US Tax',
    abbreviation: 'US',
    color: '#2563EB',
    bgClass: 'bg-blue-700',
    leadPartner: 'Margaret Chen',
    leadPartnerInitials: 'MC',
    activeClients: 2,
    activeWorkflows: 2,
    pendingReviews: 1,
    atRisk: 0,
    upcomingDeadlines: 1,
    completedMTD: 0,
    revenueYTD: '$1.1M',
    trend: 'up',
    trendPct: '+11%',
    description: 'US federal and state tax compliance, cross-border US/Canada planning, GILTI, BEAT, and treaty analysis.',
    sharedDataClients: ['northstar'],
    keyDeliverables: ['US Federal Returns', 'State Filings', 'GILTI/BEAT Analysis'],
  },
  {
    id: 'tp',
    name: 'Transfer Pricing',
    abbreviation: 'TP',
    color: '#059669',
    bgClass: 'bg-emerald-600',
    leadPartner: 'Sarah Lindqvist',
    leadPartnerInitials: 'SL',
    activeClients: 2,
    activeWorkflows: 2,
    pendingReviews: 1,
    atRisk: 0,
    upcomingDeadlines: 2,
    completedMTD: 0,
    revenueYTD: '$0.9M',
    trend: 'flat',
    trendPct: '+2%',
    description: 'Intercompany pricing policies, contemporaneous documentation, benchmarking studies, and APA applications.',
    sharedDataClients: ['meridian', 'vantage'],
    keyDeliverables: ['TP Documentation', 'Benchmarking Studies', 'APA Applications'],
  },
  {
    id: 'pe',
    name: 'Private Enterprise',
    abbreviation: 'PE',
    color: '#9333EA',
    bgClass: 'bg-purple-600',
    leadPartner: 'David Okafor',
    leadPartnerInitials: 'DO',
    activeClients: 1,
    activeWorkflows: 1,
    pendingReviews: 0,
    atRisk: 0,
    upcomingDeadlines: 1,
    completedMTD: 1,
    revenueYTD: '$0.4M',
    trend: 'down',
    trendPct: '-3%',
    description: 'Owner-managed business planning, estate and succession planning, family trust structures, and CCPC optimization.',
    sharedDataClients: [],
    keyDeliverables: ['Owner-Manager Plans', 'Estate Plans', 'Trust Structures'],
  },
  {
    id: 'litigation',
    name: 'Tax Litigation',
    abbreviation: 'LIT',
    color: '#DC2626',
    bgClass: 'bg-red-600',
    leadPartner: 'Margaret Chen',
    leadPartnerInitials: 'MC',
    activeClients: 1,
    activeWorkflows: 1,
    pendingReviews: 1,
    atRisk: 1,
    upcomingDeadlines: 1,
    completedMTD: 0,
    revenueYTD: '$0.7M',
    trend: 'up',
    trendPct: '+18%',
    description: 'CRA audit defence, objections, Tax Court proceedings, and voluntary disclosures.',
    sharedDataClients: ['northstar'],
    keyDeliverables: ['CRA Objections', 'Tax Court Filings', 'Voluntary Disclosures'],
  },
];

// ─── Cross-LOS Client Intelligence ────────────────────────────────────────────
export interface CrossLOSClientRow {
  clientId: string;
  clientName: string;
  tier: ClientTier;
  activeLOS: string[];       // LOS abbreviations active for this client
  sharedDataSets: string[];  // e.g. "Entity List", "Financial Statements"
  totalWorkflows: number;
  atRisk: number;
  openReviews: number;
  nearestDeadline: string;
  leadPartner: string;
  leadPartnerInitials: string;
  totalRevenueYTD: string;
}

export const CROSS_LOS_CLIENTS: CrossLOSClientRow[] = [
  {
    clientId: 'northstar',
    clientName: 'Northstar Holdings Inc.',
    tier: 'Platinum',
    activeLOS: ['TC', 'ICT', 'M&A', 'US', 'LIT'],
    sharedDataSets: ['Entity List', 'Financial Statements', 'Org Chart', 'FX Rates'],
    totalWorkflows: 6,
    atRisk: 2,
    openReviews: 8,
    nearestDeadline: 'May 28',
    leadPartner: 'Margaret Chen',
    leadPartnerInitials: 'MC',
    totalRevenueYTD: '$4.2M',
  },
  {
    clientId: 'meridian',
    clientName: 'Meridian Energy Corp.',
    tier: 'Strategic',
    activeLOS: ['TC', 'TP'],
    sharedDataSets: ['Entity List', 'Financial Statements'],
    totalWorkflows: 2,
    atRisk: 0,
    openReviews: 1,
    nearestDeadline: 'Jun 15',
    leadPartner: 'David Okafor',
    leadPartnerInitials: 'DO',
    totalRevenueYTD: '$1.1M',
  },
  {
    clientId: 'atlas',
    clientName: 'Atlas Financial Group',
    tier: 'Platinum',
    activeLOS: ['TC', 'ICT', 'IND'],
    sharedDataSets: ['Entity List', 'Financial Statements', 'Org Chart'],
    totalWorkflows: 3,
    atRisk: 1,
    openReviews: 3,
    nearestDeadline: 'Jun 15',
    leadPartner: 'Sarah Lindqvist',
    leadPartnerInitials: 'SL',
    totalRevenueYTD: '$2.3M',
  },
  {
    clientId: 'cascade',
    clientName: 'Cascade Technologies Ltd.',
    tier: 'Standard',
    activeLOS: ['TC', 'R&D', 'IND'],
    sharedDataSets: ['Financial Statements', 'R&D Project List'],
    totalWorkflows: 2,
    atRisk: 0,
    openReviews: 1,
    nearestDeadline: 'Jul 15',
    leadPartner: 'David Okafor',
    leadPartnerInitials: 'DO',
    totalRevenueYTD: '$0.8M',
  },
  {
    clientId: 'vantage',
    clientName: 'Vantage Capital Partners',
    tier: 'Strategic',
    activeLOS: ['M&A', 'TP'],
    sharedDataSets: ['Entity List', 'Transaction Documents'],
    totalWorkflows: 1,
    atRisk: 1,
    openReviews: 5,
    nearestDeadline: 'May 25',
    leadPartner: 'Sarah Lindqvist',
    leadPartnerInitials: 'SL',
    totalRevenueYTD: '$1.8M',
  },
];

// ─── Executive Summary Stats ───────────────────────────────────────────────────
export const EXECUTIVE_STATS = {
  totalClients: 5,
  totalLOS: 9,
  activeLOSEngagements: 9,
  totalActiveWorkflows: 21,
  atRiskDeliverables: 4,
  pendingReviews: 14,
  upcomingDeadlines: 17,
  totalRevenueYTD: '$10.2M',
  revenueTarget: '$14.0M',
  revenueAttainment: 73,
  crossLOSClients: 4,   // clients active in 2+ LOS
};
