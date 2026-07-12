"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Truck, 
  Users, 
  Map, 
  Wrench, 
  Fuel, 
  DollarSign, 
  Bell, 
  LogOut 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Vehicles", href: "/vehicles", icon: Truck },
    { label: "Drivers", href: "/drivers", icon: Users },
    { label: "Trips", href: "/trips", icon: Map },
    { label: "Maintenance", href: "/maintenance", icon: Wrench },
    { label: "Fuel", href: "/fuel", icon: Fuel },
    { label: "Expenses", href: "/expenses", icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* ── MOBILE HEADER ── */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 text-white sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight block leading-none">RouteOps</span>
            <span className="text-[10px] text-blue-300 font-medium">Fleet Management</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-slate-900" />
          </button>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* ── SIDEBAR (DESKTOP & MOBILE TRANSITION) ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex md:flex-col md:h-screen flex-shrink-0 shadow-xl border-r border-slate-800
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950/40">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white block leading-none">RouteOps</span>
            <span className="text-[10px] text-blue-300 font-medium">Fleet Management</span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"}
                `}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar User Profile / Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <div className="flex items-center gap-3 px-2 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              FM
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Fleet Manager</p>
              <p className="text-[11px] text-slate-500 truncate">manager@routeops.com</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 gap-2 h-10 px-4 py-2 text-sm font-medium"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
        />
      )}

      {/* ── MAIN WORKSPACE CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-y-auto">
        <header className="hidden md:flex h-16 items-center justify-between px-8 bg-white border-b border-slate-200 flex-shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Section:</span>
            <span className="text-sm font-bold text-slate-800">
              {navItems.find(i => i.href === pathname)?.label || "Page"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 border border-white" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800 leading-tight">Fleet Manager</p>
                <p className="text-[10px] text-slate-400 leading-tight">Admin Console</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                FM
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-slate-50 p-4 md:p-8 pb-20 md:pb-8">
          {children}
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 py-1.5 px-2 flex justify-around z-30 shadow-lg">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`
                flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-150
                ${isActive ? "text-blue-600 font-semibold" : "text-slate-400 hover:text-slate-600"}
              `}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[9px] uppercase tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
