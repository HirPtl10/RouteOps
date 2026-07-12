"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Route, 
  Wrench, 
  CreditCard,
  LogOut,
  ShieldAlert
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: string;
}

export default function Sidebar({ isOpen, onClose, activeRole }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Vehicles", href: "/vehicles", icon: Truck },
    { name: "Drivers", href: "/drivers", icon: Users },
    { name: "Trips", href: "/trips", icon: Route },
    { name: "Maintenance", href: "/maintenance", icon: Wrench },
    { name: "Expenses", href: "/expenses", icon: CreditCard },
  ];

  // Map roles to friendly names/badges
  const roleDisplay = {
    FLEET_MANAGER: { name: "Fleet Manager", color: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
    DISPATCHER: { name: "Dispatcher", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    SAFETY_OFFICER: { name: "Safety Officer", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    FINANCIAL_ANALYST: { name: "Financial Analyst", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  }[activeRole] || { name: activeRole, color: "bg-slate-500/10 text-slate-400 border-slate-500/20" };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed bottom-0 top-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-slate-950 text-slate-200 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center px-6 border-b border-slate-900 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-semibold tracking-tight text-white">TransitOps</span>
              <span className="block text-[10px] font-medium text-slate-500 tracking-wider uppercase -mt-0.5">Fleet Console</span>
            </div>
          </div>
        </div>

        {/* Role Badge Indicator */}
        <div className="px-6 py-4 border-b border-slate-900 bg-slate-900/10">
          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/35 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
              <ShieldAlert className="h-4.5 w-4.5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-slate-500 font-medium leading-none mb-1">Active Role</p>
              <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${roleDisplay.color}`}>
                {roleDisplay.name}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-sky-500/10 to-indigo-500/10 text-sky-400 border-l-2 border-sky-500 shadow-[inset_4px_0_12px_rgba(14,165,233,0.05)]"
                    : "text-slate-400 border-l-2 border-transparent hover:bg-slate-900/50 hover:text-slate-200"
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? "text-sky-400" : "text-slate-400 group-hover:text-slate-300"
                }`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="border-t border-slate-900 p-4 bg-slate-900/10">
          <div className="flex items-center justify-between rounded-xl bg-slate-900/40 p-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 font-semibold text-slate-200 border border-slate-700">
                JD
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-slate-950 bg-emerald-500" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white leading-none">John Doe</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">john.doe@transitops.com</p>
              </div>
            </div>
            <button 
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
