/**
 * AgentChatContext — persistent AI-first chat thread
 * Design: InScope minimal — greyscale, no colour except status indicators
 * Persists thread in localStorage across page navigations
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';

// ─── Message Types ────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'agent';

export type ToolCardType =
  | 'context_check'
  | 'irl_draft'
  | 'mapping_progress'
  | 'fapi_preview'
  | 'approval_request';

export interface ContextCheckItem {
  label: string;
  status: 'checking' | 'found' | 'missing';
}

export interface IRLQuestion {
  id: string;
  category: string;
  question: string;
}

export interface ToolCard {
  type: ToolCardType;
  status: 'running' | 'waiting' | 'done' | 'cancelled';
  // context_check
  items?: ContextCheckItem[];
  // irl_draft
  to?: string;
  subject?: string;
  body?: string;
  questions?: IRLQuestion[];
  // mapping_progress
  steps?: { label: string; done: boolean }[];
  // fapi_preview
  fapiData?: {
    affiliate: string;
    currency: string;
    year: number;
    rows: { label: string; value: number | null; linked?: boolean }[];
    fapiAmount: number;
  };
  // approval_request
  approvalText?: string;
  approvalAction?: string;
}

export interface AgentMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  toolCard?: ToolCard;
  isStreaming?: boolean;
}

export interface AgentChatState {
  isOpen: boolean;
  messages: AgentMessage[];
  isAgentTyping: boolean;
  client: string;
}

interface AgentChatContextValue {
  state: AgentChatState;
  openChat: (initialPrompt?: string) => void;
  closeChat: () => void;
  sendMessage: (text: string) => void;
  approveCard: (messageId: string) => void;
  cancelCard: (messageId: string) => void;
  clearThread: () => void;
}

const STORAGE_KEY = 'inscope_agent_thread_v1';

const AgentChatContext = createContext<AgentChatContextValue | null>(null);

// ─── Agent Simulation Engine ──────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AgentChatProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AgentChatState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AgentChatState;
        // Reset streaming flags on restore
        return {
          ...parsed,
          isOpen: false,
          isAgentTyping: false,
          messages: parsed.messages.map((m) => ({ ...m, isStreaming: false })),
        };
      }
    } catch {
      // ignore
    }
    return {
      isOpen: false,
      messages: [],
      isAgentTyping: false,
      client: 'Northstar Inc.',
    };
  });

  const agentBusyRef = useRef(false);

  // Persist to localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [state]);

  const addMessage = useCallback((msg: AgentMessage) => {
    setState((s) => ({ ...s, messages: [...s.messages, msg] }));
  }, []);

  const updateMessage = useCallback((id: string, patch: Partial<AgentMessage>) => {
    setState((s) => ({
      ...s,
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  }, []);

  const setAgentTyping = useCallback((v: boolean) => {
    setState((s) => ({ ...s, isAgentTyping: v }));
  }, []);

  // ─── Agent Response Logic ───────────────────────────────────────────────────

  const runFapiAgent = useCallback(
    async (client: string) => {
      if (agentBusyRef.current) return;
      agentBusyRef.current = true;

      // Step 1 — agent acknowledges
      setAgentTyping(true);
      await sleep(900);
      setAgentTyping(false);
      const ack: AgentMessage = {
        id: `agent_${Date.now()}_ack`,
        role: 'agent',
        text: `On it. Let me check what source documents are available for **${client}** before we start.`,
        timestamp: Date.now(),
      };
      addMessage(ack);

      await sleep(600);

      // Step 2 — context check card
      const ctxId = `agent_${Date.now()}_ctx`;
      const ctxMsg: AgentMessage = {
        id: ctxId,
        role: 'agent',
        text: '',
        timestamp: Date.now(),
        toolCard: {
          type: 'context_check',
          status: 'running',
          items: [
            { label: 'Prior year FAPI workpaper (2023)', status: 'checking' },
            { label: 'Trial balance 2024', status: 'checking' },
            { label: 'Financial statements 2024', status: 'checking' },
            { label: 'CRA FAPI rules (Reg. 5907)', status: 'checking' },
          ],
        },
      };
      addMessage(ctxMsg);

      // Animate context check items
      await sleep(700);
      updateMessage(ctxId, {
        toolCard: {
          type: 'context_check',
          status: 'running',
          items: [
            { label: 'Prior year FAPI workpaper (2023)', status: 'found' },
            { label: 'Trial balance 2024', status: 'checking' },
            { label: 'Financial statements 2024', status: 'checking' },
            { label: 'CRA FAPI rules (Reg. 5907)', status: 'checking' },
          ],
        },
      });
      await sleep(600);
      updateMessage(ctxId, {
        toolCard: {
          type: 'context_check',
          status: 'running',
          items: [
            { label: 'Prior year FAPI workpaper (2023)', status: 'found' },
            { label: 'Trial balance 2024', status: 'missing' },
            { label: 'Financial statements 2024', status: 'missing' },
            { label: 'CRA FAPI rules (Reg. 5907)', status: 'found' },
          ],
        },
      });
      await sleep(400);
      updateMessage(ctxId, {
        toolCard: {
          type: 'context_check',
          status: 'done',
          items: [
            { label: 'Prior year FAPI workpaper (2023)', status: 'found' },
            { label: 'Trial balance 2024', status: 'missing' },
            { label: 'Financial statements 2024', status: 'missing' },
            { label: 'CRA FAPI rules (Reg. 5907)', status: 'found' },
          ],
        },
      });

      await sleep(500);

      // Step 3 — agent explains missing docs
      setAgentTyping(true);
      await sleep(1100);
      setAgentTyping(false);
      addMessage({
        id: `agent_${Date.now()}_missing`,
        role: 'agent',
        text: `I found the prior year workpaper and the CRA rules, but I'm missing the **2024 trial balance** and **financial statements**. I've drafted an Information Request Letter for your approval — please review before I send it to Northstar.`,
        timestamp: Date.now(),
      });

      await sleep(500);

      // Step 4 — IRL draft card
      const irlId = `agent_${Date.now()}_irl`;
      addMessage({
        id: irlId,
        role: 'agent',
        text: '',
        timestamp: Date.now(),
        toolCard: {
          type: 'irl_draft',
          status: 'waiting',
          to: 'finance@northstar.com',
          subject: '2024 FAPI Calculation — Source Document Request',
          body: `Dear Finance Team,\n\nIn connection with the preparation of the 2024 T1134 Information Return for Northstar Inc., we require the following documents to complete the Foreign Accrual Property Income (FAPI) calculations:\n\n1. Trial balance as at December 31, 2024 (local currency)\n2. Audited or draft financial statements for the year ended December 31, 2024\n3. Confirmation of any intercompany transactions or loans during 2024\n\nPlease provide these documents at your earliest convenience. Our filing deadline is October 31, 2025.\n\nThank you,\nSophia\nSinaxe Tax Advisory`,
          questions: [
            { id: 'q1', category: 'Financial Statements', question: 'Please provide the trial balance as at December 31, 2024 (local currency).' },
            { id: 'q2', category: 'Financial Statements', question: 'Please provide audited or draft financial statements for the year ended December 31, 2024.' },
            { id: 'q3', category: 'Intercompany', question: 'Were there any intercompany loans or transactions with Canadian affiliates during 2024?' },
            { id: 'q4', category: 'Structure', question: 'Has the ownership percentage in any foreign affiliate changed since December 31, 2023?' },
          ],
        },
      });

      agentBusyRef.current = false;
    },
    [addMessage, updateMessage, setAgentTyping]
  );

  const runFapiCalculation = useCallback(async () => {
    if (agentBusyRef.current) return;
    agentBusyRef.current = true;

    setAgentTyping(true);
    await sleep(800);
    setAgentTyping(false);
    addMessage({
      id: `agent_${Date.now()}_calc_start`,
      role: 'agent',
      text: 'Documents received. I\'m now mapping the trial balance data to the FAPI calculation engine.',
      timestamp: Date.now(),
    });

    await sleep(400);

    // Mapping progress card
    const mapId = `agent_${Date.now()}_map`;
    const steps = [
      { label: 'Parsing trial balance (EUR)', done: false },
      { label: 'Applying FX rate (EUR/CAD 1.4712)', done: false },
      { label: 'Identifying FAPI income streams', done: false },
      { label: 'Applying Reg. 5907(2) adjustments', done: false },
      { label: 'Cross-referencing prior year workpaper', done: false },
    ];
    addMessage({
      id: mapId,
      role: 'agent',
      text: '',
      timestamp: Date.now(),
      toolCard: { type: 'mapping_progress', status: 'running', steps },
    });

    for (let i = 0; i < steps.length; i++) {
      await sleep(650);
      updateMessage(mapId, {
        toolCard: {
          type: 'mapping_progress',
          status: i === steps.length - 1 ? 'done' : 'running',
          steps: steps.map((s, idx) => ({ ...s, done: idx <= i })),
        },
      });
    }

    await sleep(500);
    setAgentTyping(true);
    await sleep(900);
    setAgentTyping(false);
    addMessage({
      id: `agent_${Date.now()}_calc_done`,
      role: 'agent',
      text: 'Calculation complete. Here\'s the FAPI worksheet for your review:',
      timestamp: Date.now(),
    });

    await sleep(300);

    // FAPI preview card
    addMessage({
      id: `agent_${Date.now()}_fapi`,
      role: 'agent',
      text: '',
      timestamp: Date.now(),
      toolCard: {
        type: 'fapi_preview',
        status: 'waiting',
        fapiData: {
          affiliate: 'SAS Paris',
          currency: 'EUR',
          year: 2024,
          rows: [
            { label: 'Income per financial statements', value: 1240000 },
            { label: 'Book-to-tax adjustments (active business)', value: -180000 },
            { label: 'Book-to-tax adjustments (Canadian rules)', value: -42000 },
            { label: 'Reg. 5907(2) adjustments', value: -28500 },
            { label: 'Income taxes paid', value: -312000 },
            { label: 'Dividends paid', value: -150000 },
            { label: 'FAPI Amount (EUR)', value: 527500, linked: true },
            { label: 'FX Rate (EUR/CAD)', value: 1.4712 },
            { label: 'FAPI Amount (CAD)', value: 776070, linked: true },
          ],
          fapiAmount: 776070,
        },
      },
    });

    agentBusyRef.current = false;
  }, [addMessage, updateMessage, setAgentTyping]);

  // ─── Intent Parser ──────────────────────────────────────────────────────────

  const parseAndRespond = useCallback(
    async (text: string) => {
      const lower = text.toLowerCase();
      if (
        lower.includes('calculate fapi') ||
        lower.includes('fapi for') ||
        lower.includes('run fapi') ||
        lower.includes('fapi calculation')
      ) {
        await runFapiAgent(state.client);
        return;
      }

      if (
        lower.includes('documents received') ||
        lower.includes('sent the documents') ||
        lower.includes('files are ready') ||
        lower.includes('run the calculation') ||
        lower.includes('proceed with calculation')
      ) {
        await runFapiCalculation();
        return;
      }

      // Generic response
      setAgentTyping(true);
      await sleep(1000);
      setAgentTyping(false);
      addMessage({
        id: `agent_${Date.now()}_generic`,
        role: 'agent',
        text: `I understand you want to work on "${text}". Try typing **"Calculate FAPI for Northstar"** to see the full AI-first workflow, or navigate using the orbital stage.`,
        timestamp: Date.now(),
      });
    },
    [state.client, runFapiAgent, runFapiCalculation, addMessage, setAgentTyping]
  );

  // ─── Public API ─────────────────────────────────────────────────────────────

  const openChat = useCallback(
    (initialPrompt?: string) => {
      setState((s) => ({ ...s, isOpen: true }));
      if (initialPrompt) {
        const userMsg: AgentMessage = {
          id: `user_${Date.now()}`,
          role: 'user',
          text: initialPrompt,
          timestamp: Date.now(),
        };
        setState((s) => ({ ...s, isOpen: true, messages: [...s.messages, userMsg] }));
        setTimeout(() => parseAndRespond(initialPrompt), 100);
      }
    },
    [parseAndRespond]
  );

  const closeChat = useCallback(() => {
    setState((s) => ({ ...s, isOpen: false }));
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      const userMsg: AgentMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        text: text.trim(),
        timestamp: Date.now(),
      };
      addMessage(userMsg);
      setTimeout(() => parseAndRespond(text.trim()), 100);
    },
    [addMessage, parseAndRespond]
  );

  const approveCard = useCallback(
    (messageId: string) => {
      setState((s) => ({
        ...s,
        messages: s.messages.map((m) =>
          m.id === messageId && m.toolCard
            ? { ...m, toolCard: { ...m.toolCard, status: 'done' } }
            : m
        ),
      }));
      // After IRL approval, simulate sending and trigger calculation
      const msg = state.messages.find((m) => m.id === messageId);
      if (msg?.toolCard?.type === 'irl_draft') {
        setTimeout(() => {
          addMessage({
            id: `agent_${Date.now()}_irl_sent`,
            role: 'agent',
            text: '✓ IRL sent to finance@northstar.com via Outlook. I\'ll notify you when documents are received. In the meantime, you can type **"Documents received"** to simulate the client response and proceed with the calculation.',
            timestamp: Date.now(),
          });
        }, 400);
      }
      if (msg?.toolCard?.type === 'fapi_preview') {
        setTimeout(() => {
          addMessage({
            id: `agent_${Date.now()}_fapi_approved`,
            role: 'agent',
            text: '✓ FAPI calculation approved. The worksheet has been updated and is ready for the T1134 filing. The FAPI amount of **CAD 776,070** has been linked to the Surplus worksheet.',
            timestamp: Date.now(),
          });
        }, 400);
      }
    },
    [state.messages, addMessage]
  );

  const cancelCard = useCallback((messageId: string) => {
    setState((s) => ({
      ...s,
      messages: s.messages.map((m) =>
        m.id === messageId && m.toolCard
          ? { ...m, toolCard: { ...m.toolCard, status: 'cancelled' } }
          : m
      ),
    }));
  }, []);

  const clearThread = useCallback(() => {
    setState((s) => ({ ...s, messages: [], isAgentTyping: false }));
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AgentChatContext.Provider
      value={{ state, openChat, closeChat, sendMessage, approveCard, cancelCard, clearThread }}
    >
      {children}
    </AgentChatContext.Provider>
  );
}

export function useAgentChat() {
  const ctx = useContext(AgentChatContext);
  if (!ctx) throw new Error('useAgentChat must be used inside AgentChatProvider');
  return ctx;
}
