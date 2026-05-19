import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import ClientWorkspace from "./pages/ClientWorkspace";
import WorkflowExecution from "./pages/WorkflowExecution";
import WorkflowBuilder from "./pages/WorkflowBuilder";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
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
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'oklch(0.155 0.012 264)',
                border: '1px solid oklch(1 0 0 / 10%)',
                color: 'oklch(0.88 0.008 240)',
                fontSize: '12px',
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
