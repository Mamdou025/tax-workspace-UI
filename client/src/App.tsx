import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AgentChatProvider } from '@/contexts/AgentChatContext';

// ── New InScope shell ──────────────────────────────────────────────────────────
import InScopeHome from '@/pages/InScopeHome';
import Library from '@/pages/Library';

// ── Preserved pages (shell wrapper added where needed) ────────────────────────
import OrbitalStage from "./components/OrbitalStage";
import ExecutiveOverview from "./pages/ExecutiveOverview";
import Dashboard from "./pages/Dashboard";
import ClientWorkspace from "./pages/ClientWorkspace";
import WorkflowExecution from "./pages/WorkflowExecution";
import WorkflowBuilder from "./pages/WorkflowBuilder";
import FapiWorksheet from "@/pages/FapiWorksheet";
import T1134Worksheet from '@/pages/T1134Worksheet';
import SurplusWorksheet from '@/pages/SurplusWorksheet';
import AgentChatPage from '@/pages/AgentChatPage';
import ICTWorkspace from '@/pages/ICTWorkspace';

function Router() {
  return (
    <Switch>
      {/* ── New InScope home ── */}
      <Route path="/" component={InScopeHome} />

      {/* ── Library ── */}
      <Route path="/library" component={Library} />

      {/* ── Chat / agent thread ── */}
      <Route path="/chat" component={AgentChatPage} />

      {/* ── ICT AI-first workspace ── */}
      <Route path="/ict" component={ICTWorkspace} />

      {/* ── Workpapers (preserved, untouched) ── */}
      <Route path="/fapi" component={FapiWorksheet} />
      <Route path="/t1134" component={T1134Worksheet} />
      <Route path="/surplus" component={SurplusWorksheet} />

      {/* ── Dashboard & builder ── */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/builder" component={WorkflowBuilder} />

      {/* ── Legacy / deep links preserved ── */}
      <Route path="/orbital" component={OrbitalStage} />
      <Route path="/bu-overview" component={ExecutiveOverview} />
      <Route path="/client/:id" component={ClientWorkspace} />
      <Route path="/workflow/:id" component={WorkflowExecution} />

      {/* ── 404 ── */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#F8F9FB',
                border: '1px solid rgba(0,0,0,0.07)',
                color: '#202735',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(32,39,53,0.08)',
              },
            }}
          />
          <AgentChatProvider>
            <Router />
          </AgentChatProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
