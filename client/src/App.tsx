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
          <footer className="bg-background border-t border-border py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center text-sm text-muted-foreground">
                所有权©睡眠魔法师
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
