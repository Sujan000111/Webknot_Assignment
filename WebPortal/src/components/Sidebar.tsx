import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings,
  X,
  GraduationCap,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: location.pathname === "/" || location.pathname === "/dashboard"
    },
    {
      name: "Events",
      href: "/events", 
      icon: Calendar,
      current: location.pathname === "/events"
    },
    {
      name: "Students",
      href: "/students",
      icon: Users,
      current: location.pathname === "/students"
    },
    {
      name: "Colleges",
      href: "/colleges",
      icon: GraduationCap,
      current: location.pathname === "/colleges"
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart3,
      current: location.pathname === "/reports"
    }
  ];

  const quickActions = [
    { name: "Attendance", icon: UserCheck, path: "/attendance" },
    { name: "Academic", icon: GraduationCap, path: "/academic" },
    { name: "Settings", icon: Settings, path: "/settings" }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-card border-r border-border pt-5 overflow-y-auto">
          <div className="flex flex-col flex-grow">
            {/* Navigation */}
            <nav className="flex-1 px-4 pb-4 space-y-2">
              <div className="space-y-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "nav-link",
                      item.current && "nav-link-active"
                    )}
                    onClick={onClose}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </NavLink>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="pt-8">
                <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Quick Actions
                </h3>
                <div className="mt-3 space-y-1">
                  {quickActions.map((item) => (
                    <button
                      key={item.name}
                      className="nav-link w-full text-left"
                      onClick={() => {
                        navigate(item.path);
                        onClose();
                      }}
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card transform transition-transform duration-300 ease-in-out lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full border-r border-border">
          {/* Close button */}
          <div className="flex items-center justify-end p-4">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 pb-4 space-y-2">
            <div className="space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "nav-link",
                    item.current && "nav-link-active"
                  )}
                  onClick={onClose}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </NavLink>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="pt-8">
              <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Quick Actions
              </h3>
              <div className="mt-3 space-y-1">
                {quickActions.map((item) => (
                  <button
                    key={item.name}
                    className="nav-link w-full text-left"
                    onClick={() => {
                      navigate(item.path);
                      onClose();
                    }}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;