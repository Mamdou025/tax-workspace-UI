import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import ExecutiveOverview from "./pages/ExecutiveOverview";
import Dashboard from "./pages/Dashboard";
import ClientWorkspace from "./pages/ClientWorkspace";
import WorkflowExecution from "./pages/WorkflowExecution";
import WorkflowBuilder from "./pages/WorkflowBuilder";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ExecutiveOverview} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/client/:id" component={ClientWorkspace} />
      <Route path="/workflow/:id" component={WorkflowExecution} />
      <Route path="/builder" component={WorkflowBuilder} />
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
                background: 'oklch(1 0 0)',
                border: '1px solid oklch(0.87 0.008 240)',
                color: 'oklch(0.18 0.018 255)',
                fontSize: '12px',
                boxShadow: '0 4px 12px oklch(0 0 0 / 10%)',
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
