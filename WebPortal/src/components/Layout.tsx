import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Dashboard from "../pages/Dashboard";
import Events from "../pages/Events";
import Students from "../pages/Students";
import Reports from "../pages/Reports";
import Colleges from "../pages/Colleges";
import Attendance from "../pages/Attendance";
import Academic from "../pages/Academic";
import Settings from "../pages/Settings";
import { Menu } from "lucide-react";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-card shadow-card border border-border"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div className="flex w-full">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main Content */}
        <div className="flex-1 lg:pl-64">
          <Header />
          <main className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/events" element={<Events />} />
              <Route path="/students" element={<Students />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/colleges" element={<Colleges />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/academic" element={<Academic />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;