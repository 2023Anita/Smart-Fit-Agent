import { Link, useLocation } from "wouter";
import { User, Activity, Calendar, TrendingUp, Menu, Camera, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import logoImage from "@assets/Sleep Magician - Illustrative Character Logo_1750166367787.png";

export function Navigation() {
  const [location, setLocation] = useLocation();

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
      <nav className="modern-card sticky top-0 z-50 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    src={logoImage} 
                    alt="Smart Fit Agent Logo" 
                    className="w-10 h-10 rounded-xl object-cover tech-shadow"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 mix-blend-overlay"></div>
                </div>
                <h1 className="text-2xl font-bold text-gradient tracking-tight">Smart Fit Agent</h1>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map(({ path, label }) => (
                <Link key={path} href={path}>
                  <Button
                    variant={location === path ? "default" : "ghost"}
                    className={`text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 ${
                      location === path 
                        ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg" 
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    }`}
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
              <div className="relative">
                <div className="w-10 h-10 health-gradient rounded-full flex items-center justify-center tech-shadow">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-white pulse-animation"></div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
