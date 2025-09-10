import { Bell, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import mvjceLogo from "@/assets/mvjce-logo.png";

const Header = () => {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Logo and Title */}
        <div className="flex items-center space-x-4">
          <img src={mvjceLogo} alt="MVJCE Logo" className="h-10 w-10" />
          <div>
            <h1 className="text-xl font-poppins font-bold text-primary">MVJCE Portal</h1>
            <p className="text-sm text-muted-foreground">Campus Event Management</p>
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search events, students..." 
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Right: College Selector, Notifications, Profile */}
        <div className="flex items-center space-x-4">
          {/* College Selector */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg border border-border bg-muted/50">
            <span className="text-sm font-medium">MVJCE Main Campus</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Notifications */}
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-destructive rounded-full flex items-center justify-center">
              <span className="text-xs text-destructive-foreground font-bold">3</span>
            </div>
          </Button>

          {/* Profile */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">admin@mvjce.edu.in</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">A</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;