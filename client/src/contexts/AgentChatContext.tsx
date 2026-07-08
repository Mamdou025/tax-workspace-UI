/**
 * AgentChatContext — persistent AI-first chat thread
 * Design: InScope timeline — vertical line, colored dots, event cards, embedded surfaces
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

export type MessageRole = 'user' | 'agent' | 'event';

// Event types for the timeline (shown as compact event cards with colored dots)
export type EventKind =
  | 'surface_opened'   // green dot — worksheet opened inline
  | 'task_run'         // green dot — agent ran a task
  | 'warning'          // orange dot — review warning
  | 'proposal'         // purple dot — draft proposal created
  | 'irl_sent'         // blue dot — IRL sent via Outlook
  | 'approved'         // green dot — item approved
  | 'flagged';         // orange dot — item flagged

export type ToolCardType =
  | 'context_check'
  | 'irl_draft'
  | 'mapping_progress'
  | 'fapi_worksheet'
  | 'confirmation_gate';

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
  // confirmation_gate
  confirmText?: string;
  confirmAction?: string;
}

export interface AgentMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  toolCard?: ToolCard;
  isStreaming?: boolean;
  // For event messages
  eventKind?: EventKind;
  eventTitle?: string;
  eventDetail?: string;
}

export interface AgentChatState {
  isOpen: boolean;
  messages: AgentMessage[];
  isAgentTyping: boolean;
  client: string;
  eventCount: number;
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

const STORAGE_KEY = 'inscope_agent_thread_v2';

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
      eventCount: 0,
    };
  });

  const agentBusyRef = useRef(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [state]);

  const addMessage = useCallback((msg: AgentMessage) => {
    setState((s) => ({
      ...s,
      messages: [...s.messages, msg],
      eventCount: msg.role === 'event' ? s.eventCount + 1 : s.eventCount,
    }));
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

  // ─── Helper: add an event card to the timeline ──────────────────────────────

  const addEvent = useCallback((
    kind: EventKind,
    title: string,
    detail: string,
  ) => {
    addMessage({
      id: `event_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      role: 'event',
      text: '',
      timestamp: Date.now(),
      eventKind: kind,
      eventTitle: title,
      eventDetail: detail,
    });
  }, [addMessage]);

  // ─── Phase 1: FAPI agent — context check + IRL ─────────────────────────────

  const runFapiAgent = useCallback(
    async (client: string) => {
      if (agentBusyRef.current) return;
      agentBusyRef.current = true;

      // Agent acknowledges
      setAgentTyping(true);
      await sleep(900);
      setAgentTyping(false);
      addMessage({
        id: `agent_${Date.now()}_ack`,
        role: 'agent',
        text: `On it. Let me check what source documents are available for **${client}** before we start the FAPI calculation.`,
        timestamp: Date.now(),
      });

      await sleep(600);

      // Context check card
      const ctxId = `agent_${Date.now()}_ctx`;
      addMessage({
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
      });

      // Animate context check
      await sleep(700);
      updateMessage(ctxId, {
        toolCard: { type: 'context_check', status: 'running', items: [
          { label: 'Prior year FAPI workpaper (2023)', status: 'found' },
          { label: 'Trial balance 2024', status: 'checking' },
          { label: 'Financial statements 2024', status: 'checking' },
          { label: 'CRA FAPI rules (Reg. 5907)', status: 'checking' },
        ]},
      });
      await sleep(600);
      updateMessage(ctxId, {
        toolCard: { type: 'context_check', status: 'running', items: [
          { label: 'Prior year FAPI workpaper (2023)', status: 'found' },
          { label: 'Trial balance 2024', status: 'missing' },
          { label: 'Financial statements 2024', status: 'missing' },
          { label: 'CRA FAPI rules (Reg. 5907)', status: 'found' },
        ]},
      });
      await sleep(400);
      updateMessage(ctxId, {
        toolCard: { type: 'context_check', status: 'done', items: [
          { label: 'Prior year FAPI workpaper (2023)', status: 'found' },
          { label: 'Trial balance 2024', status: 'missing' },
          { label: 'Financial statements 2024', status: 'missing' },
          { label: 'CRA FAPI rules (Reg. 5907)', status: 'found' },
        ]},
      });

      await sleep(300);
      addEvent('task_run', 'Context scan complete', '4 sources checked · 2 found · 2 missing');

      await sleep(500);
      addEvent('warning', 'Missing source documents', 'Trial balance 2024 and financial statements 2024 not found in document vault');

      await sleep(400);

      // Agent explains missing docs
      setAgentTyping(true);
      await sleep(1100);
      setAgentTyping(false);
      addMessage({
        id: `agent_${Date.now()}_missing`,
        role: 'agent',
        text: `I found the prior year workpaper and the CRA rules, but I'm missing the **2024 trial balance** and **financial statements**. I've drafted an Information Request Letter — please review before I send it to Northstar.`,
        timestamp: Date.now(),
      });

      await sleep(500);

      // IRL draft card
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
    [addMessage, updateMessage, setAgentTyping, addEvent]
  );

  // ─── Phase 2: FAPI calculation — mapping + confirmation gate ───────────────

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

    await sleep(300);
    addEvent('task_run', 'Data mapping complete', '5 steps · EUR/CAD 1.4712 · 34 source refs · 0 errors');

    await sleep(500);

    setAgentTyping(true);
    await sleep(900);
    setAgentTyping(false);

    // Confirmation gate — ask user to confirm before opening the worksheet
    const gateId = `agent_${Date.now()}_gate`;
    addMessage({
      id: gateId,
      role: 'agent',
      text: 'Mapping complete. The FAPI worksheet is ready to open. I\'ve pre-populated all values from the trial balance and applied the Reg. 5907(2) adjustments. Shall I open the worksheet here in the thread?',
      timestamp: Date.now(),
      toolCard: {
        type: 'confirmation_gate',
        status: 'waiting',
        confirmText: 'Open FAPI Worksheet — SAS Paris · 2024',
        confirmAction: 'open_fapi_worksheet',
      },
    });

    agentBusyRef.current = false;
  }, [addMessage, updateMessage, setAgentTyping, addEvent]);

  // ─── Phase 3: Open FAPI worksheet surface ──────────────────────────────────

  const openFapiWorksheet = useCallback(async () => {
    if (agentBusyRef.current) return;
    agentBusyRef.current = true;

    addEvent('surface_opened', 'FAPI Worksheet opened inside thread', 'SAS Paris · FY2024 · pre-populated from trial balance');

    await sleep(400);

    setAgentTyping(true);
    await sleep(700);
    setAgentTyping(false);

    addMessage({
      id: `agent_${Date.now()}_worksheet`,
      role: 'agent',
      text: 'I\'ve opened the FAPI worksheet below. All values are pre-populated from the trial balance. Review the figures and use **Approve & Continue** when ready, or **Flag for Review** to mark items for the partner.',
      timestamp: Date.now(),
      toolCard: {
        type: 'fapi_worksheet',
        status: 'waiting',
      },
    });

    agentBusyRef.current = false;
  }, [addMessage, addEvent, setAgentTyping]);

  // ─── Intent Parser ──────────────────────────────────────────────────────────

  const parseAndRespond = useCallback(
    async (text: string) => {
      const lower = text.toLowerCase();

      if (
        lower.includes('calculate fapi') ||
        lower.includes('fapi for') ||
        lower.includes('run fapi') ||
        lower.includes('fapi calculation') ||
        lower.includes('open fapi') ||
        lower.includes('start fapi')
      ) {
        await runFapiAgent(state.client);
        return;
      }

      if (
        lower.includes('documents received') ||
        lower.includes('sent the documents') ||
        lower.includes('files are ready') ||
        lower.includes('run the calculation') ||
        lower.includes('proceed with calculation') ||
        lower.includes('go ahead with')
      ) {
        await runFapiCalculation();
        return;
      }

      if (
        lower.includes('go ahead') ||
        lower.includes('open the worksheet') ||
        lower.includes('yes') ||
        lower.includes('open it') ||
        lower.includes('show me')
      ) {
        // Check if there's a pending confirmation gate
        const hasGate = state.messages.some(
          (m) => m.toolCard?.type === 'confirmation_gate' && m.toolCard.status === 'waiting'
        );
        if (hasGate) {
          // Mark gate as done
          setState((s) => ({
            ...s,
            messages: s.messages.map((m) =>
              m.toolCard?.type === 'confirmation_gate' && m.toolCard.status === 'waiting'
                ? { ...m, toolCard: { ...m.toolCard!, status: 'done' } }
                : m
            ),
          }));
          await openFapiWorksheet();
          return;
        }
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
    [state.client, state.messages, runFapiAgent, runFapiCalculation, openFapiWorksheet, addMessage, setAgentTyping]
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
      const msg = state.messages.find((m) => m.id === messageId);

      if (msg?.toolCard?.type === 'irl_draft') {
        setTimeout(() => {
          addEvent('irl_sent', 'IRL sent via Outlook', 'finance@northstar.com · 4 questions attached');
          setTimeout(() => {
            addMessage({
              id: `agent_${Date.now()}_irl_sent`,
              role: 'agent',
              text: '✓ IRL sent to finance@northstar.com. I\'ll notify you when documents are received. Type **"Documents received"** to simulate the client response and proceed with the calculation.',
              timestamp: Date.now(),
            });
          }, 400);
        }, 300);
      }

      if (msg?.toolCard?.type === 'confirmation_gate') {
        setTimeout(() => openFapiWorksheet(), 200);
      }

      if (msg?.toolCard?.type === 'fapi_worksheet') {
        setTimeout(() => {
          addEvent('approved', 'FAPI worksheet approved', 'SAS Paris · FY2024 · locked for T1134 filing');
          setTimeout(() => {
            addMessage({
              id: `agent_${Date.now()}_fapi_approved`,
              role: 'agent',
              text: '✓ FAPI worksheet approved and locked. The workpaper is ready for the T1134 filing. The FAPI amount has been linked to the Surplus worksheet.',
              timestamp: Date.now(),
            });
          }, 400);
        }, 300);
      }
    },
    [state.messages, addMessage, addEvent, openFapiWorksheet]
  );

  const cancelCard = useCallback((messageId: string) => {
    const msg = state.messages.find((m) => m.id === messageId);
    setState((s) => ({
      ...s,
      messages: s.messages.map((m) =>
        m.id === messageId && m.toolCard
          ? { ...m, toolCard: { ...m.toolCard, status: 'cancelled' } }
          : m
      ),
    }));
    if (msg?.toolCard?.type === 'fapi_worksheet') {
      setTimeout(() => {
        addEvent('flagged', 'FAPI worksheet flagged for review', 'SAS Paris · FY2024 · assigned to engagement partner');
      }, 200);
    }
  }, [state.messages, addEvent]);

  const clearThread = useCallback(() => {
    setState((s) => ({ ...s, messages: [], isAgentTyping: false, eventCount: 0 }));
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
