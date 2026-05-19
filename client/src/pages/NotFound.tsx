import { AlertTriangle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center max-w-sm mx-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <div className="tabular-nums text-5xl font-700 text-foreground mb-2">404</div>
        <h2 className="text-lg font-600 text-foreground mb-2">Page Not Found</h2>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <button
          onClick={() => setLocation("/")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-colors text-sm"
        >
          <Home className="w-4 h-4" />
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
