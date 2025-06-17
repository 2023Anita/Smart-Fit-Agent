import { Link, useLocation } from "wouter";
import { User, Activity, Calendar, TrendingUp, Menu, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "仪表盘", icon: Activity },
    { path: "/food-tracking", label: "食物追踪", icon: Camera },
    { path: "/profile", label: "个人资料", icon: User },
  ];

  const NavContent = () => (
    <div className="flex flex-col space-y-2">
      {navItems.map(({ path, label, icon: Icon }) => (
        <Link key={path} href={path}>
          <Button
            variant={location === path ? "default" : "ghost"}
            className="w-full justify-start space-x-2"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Button>
        </Link>
      ))}
    </div>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img 
                  src="/assets/logo.png" 
                  alt="Smart Fit Agent Logo" 
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <h1 className="text-xl font-bold text-primary">Smart Fit Agent</h1>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map(({ path, label }) => (
                <Link key={path} href={path}>
                  <Button
                    variant={location === path ? "default" : "ghost"}
                    className="text-sm"
                  >
                    {label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="py-4">
                    <NavContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">用</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
