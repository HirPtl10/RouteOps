"use client";

import { usePathname } from "next/navigation";
import { 
  Menu, 
  Bell, 
  ChevronDown, 
  Shield, 
  Sparkles
} from "lucide-react";
import { useState } from "react";

interface TopbarProps {
  onMenuToggle: () => void;
  activeRole: string;
  onRoleChange: (role: string) => void;
}

export default function Topbar({ onMenuToggle, activeRole, onRoleChange }: TopbarProps) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Derive page name from route
  const getPageName = () => {
    if (pathname === "/") return "Dashboard";
    const segment = pathname.split("/")[1];
    if (!segment) return "Dashboard";
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const roles = [
    { value: "FLEET_MANAGER", label: "Fleet Manager" },
    { value: "DISPATCHER", label: "Dispatcher" },
    { value: "SAFETY_OFFICER", label: "Safety Officer" },
    { value: "FINANCIAL_ANALYST", label: "Financial Analyst" },
  ];

  const currentRoleLabel = roles.find(r => r.value === activeRole)?.label || activeRole;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/70 px-6 backdrop-blur-md">
      {/* Page Title & Mobile Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div>
          <h1 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            {getPageName()}
          </h1>
        </div>
      </div>

      {/* Actions, Notifications & Role Switcher */}
      <div className="flex items-center gap-4">
        {/* Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-all focus:outline-none"
          >
            <Shield className="h-3.5 w-3.5 text-sky-500" />
            <span>Role: {currentRoleLabel}</span>
            <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2.5 z-40 w-56 origin-top-right rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Select Context Role
                </div>
                <div className="mt-1.5 space-y-1">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => {
                        onRoleChange(role.value);
                        setDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-colors ${
                        activeRole === role.value
                          ? "bg-slate-100 font-semibold text-slate-900"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span>{role.label}</span>
                      {activeRole === role.value && (
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notifications Icon Button */}
        <button
          className="relative rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-700 transition-all"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
          </span>
        </button>

        {/* Premium feature tag */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
          <Sparkles className="h-3 w-3" />
          <span>v1.0.0-Beta</span>
        </div>
      </div>
    </header>
  );
}
