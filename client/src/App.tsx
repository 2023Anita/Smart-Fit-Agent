import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import Dashboard from "@/pages/dashboard";
import ProfileSetup from "@/pages/profile-setup";
import FoodTracking from "@/pages/food-tracking";
import Login from "@/pages/login";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";

function Router() {
  const token = localStorage.getItem('token');
  
  // If no token, redirect to login
  if (!token && window.location.pathname !== '/register' && window.location.pathname !== '/login') {
    window.location.href = '/login';
    return null;
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/profile" component={ProfileSetup} />
      <Route path="/food-tracking" component={FoodTracking} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const token = localStorage.getItem('token');
  const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background flex flex-col">
          {token && !isAuthPage && <Navigation />}
          <div className="flex-1">
            <Router />
          </div>
          <footer className="bg-gradient-to-r from-background via-primary/5 to-background border-t border-primary/20 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-full bg-gradient-to-r from-slate-900/50 via-purple-900/30 to-slate-900/50 border border-purple-400/30 shadow-lg shadow-purple-400/20">
                  <span className="text-sm font-mono font-bold tracking-wider text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] animate-pulse">
                    所有权©睡眠魔法师
                  </span>
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-violet-400 animate-ping"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 absolute"></div>
                </div>
              </div>
            </div>
          </footer>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
