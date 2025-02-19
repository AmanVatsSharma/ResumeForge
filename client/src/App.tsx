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
import ResumePage from "@/pages/resume-page"; // Import the ResumePage component

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/templates" component={TemplatesPage} />
      <Route path="/generator" component={GeneratorPage} />
      <Route path="/resume/:id" component={ResumePage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;