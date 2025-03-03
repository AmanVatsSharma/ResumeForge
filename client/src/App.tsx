import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import TemplatesPage from "@/pages/templates-page";
import GeneratorPage from "@/pages/generator-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import ResumePage from "@/pages/resume-page";
import ShareViewPage from "@/pages/share-view-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/share/:id" component={ShareViewPage} />
      
      {/* Protected Routes - Require Authentication */}
      <ProtectedRoute path="/templates" component={() => <TemplatesPage />} />
      <ProtectedRoute path="/generator" component={() => <GeneratorPage />} />
      <ProtectedRoute path="/resume/:id" component={() => <ResumePage />} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="resume-forge-theme">
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;