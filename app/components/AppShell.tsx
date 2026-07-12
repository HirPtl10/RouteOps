"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRole, setActiveRole] = useState("FLEET_MANAGER");

  // Persist role in local storage for a better hackathon review experience
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("transitops_role");
      if (stored) {
        setActiveRole(stored);
      }
    }
  }, []);

  const handleRoleChange = (role: string) => {
    setActiveRole(role);
    if (typeof window !== "undefined") {
      localStorage.setItem("transitops_role", role);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Sidebar Panel */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        activeRole={activeRole} 
      />

      {/* Main View Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar Panel */}
        <Topbar 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
          activeRole={activeRole} 
          onRoleChange={handleRoleChange} 
        />
        
        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
          <div className="mx-auto w-full max-w-7xl animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
