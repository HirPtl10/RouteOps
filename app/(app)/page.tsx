"use client";

import React from "react";
import { 
  Truck, 
  Users, 
  Map, 
  Wrench, 
  Fuel, 
  DollarSign, 
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from "lucide-react";

const stats = [
  {
    label: "Vehicles",
    value: "24",
    sub: "18 Active",
    icon: Truck,
    color: "text-blue-600",
    bg: "bg-blue-50",
    status: "6 in shop",
    statusColor: "text-amber-600 bg-amber-50",
  },
  {
    label: "Drivers",
    value: "31",
    sub: "28 On duty",
    icon: Users,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    status: "3 off duty",
    statusColor: "text-slate-500 bg-slate-50",
  },
  {
    label: "Active Trips",
    value: "12",
    sub: "Running live",
    icon: Map,
    color: "text-violet-600",
    bg: "bg-violet-50",
    status: "4 completed today",
    statusColor: "text-emerald-600 bg-emerald-50",
  },
  {
    label: "Maintenance",
    value: "3",
    sub: "Open tickets",
    icon: Wrench,
    color: "text-rose-600",
    bg: "bg-rose-50",
    status: "2 critical issues",
    statusColor: "text-rose-600 bg-rose-50",
  },
];

const recentTrips = [
  { id: "T-1042", driver: "Ramesh Kumar", vehicle: "TN-01-AB-1234", route: "Chennai → Bangalore", status: "ON TRIP", statusColor: "text-blue-700 bg-blue-50 border-blue-200", time: "2h ago" },
  { id: "T-1041", driver: "Suresh Yadav", vehicle: "TN-02-CD-5678", route: "Delhi → Jaipur", status: "COMPLETED", statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200", time: "5h ago" },
  { id: "T-1040", driver: "Arjun Singh", vehicle: "MH-03-EF-9012", route: "Mumbai → Pune", status: "COMPLETED", statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200", time: "8h ago" },
  { id: "T-1039", driver: "Mohan Lal", vehicle: "GJ-04-GH-3456", route: "Ahmedabad → Surat", status: "CANCELLED", statusColor: "text-rose-700 bg-rose-50 border-rose-200", time: "1d ago" },
];

const quickActions = [
  { label: "New Trip", icon: Map, color: "text-blue-600", bg: "bg-blue-50", desc: "Start a route" },
  { label: "Add Driver", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", desc: "Register crew" },
  { label: "Add Vehicle", icon: Truck, color: "text-violet-600", bg: "bg-violet-50", desc: "Add a truck" },
  { label: "Log Fuel", icon: Fuel, color: "text-amber-600", bg: "bg-amber-50", desc: "Log fuel slip" },
  { label: "Maintenance", icon: Wrench, color: "text-rose-600", bg: "bg-rose-50", desc: "Log shop job" },
  { label: "Expenses", icon: DollarSign, color: "text-cyan-600", bg: "bg-cyan-50", desc: "Report cost" },
];

const alerts = [
  { msg: "Driver Mohan Lal's license expires in 5 days", type: "warn", icon: AlertTriangle, color: "text-amber-800 border-amber-200 bg-amber-50" },
  { msg: "Vehicle MH-03-EF-9012 maintenance overdue", type: "error", icon: AlertTriangle, color: "text-rose-800 border-rose-200 bg-rose-50" },
  { msg: "Trip T-1041 completed successfully", type: "success", icon: CheckCircle, color: "text-emerald-800 border-emerald-200 bg-emerald-50" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* ── WELCOME BANNER ── */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600 p-8 md:p-10 shadow-xl overflow-hidden">
        {/* Glow decoration elements */}
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-60 h-60 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="text-blue-200 text-xs font-semibold uppercase tracking-wider block">Admin Overview</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Fleet Operations Center</h2>
            <p className="text-blue-100 text-sm md:text-base max-w-md font-medium">
              Everything is currently running within normal parameters. 12 trips are active on the road.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-4 rounded-2xl text-center shadow-lg min-w-[100px]">
              <p className="text-3xl font-extrabold text-white">12</p>
              <p className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider mt-1">Live Trips</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-4 rounded-2xl text-center shadow-lg min-w-[100px]">
              <p className="text-3xl font-extrabold text-white">98%</p>
              <p className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider mt-1">Fleet Health</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── NOTIFICATIONS & ALERTS ── */}
      <div className="space-y-3">
        {alerts.map((a, i) => {
          const AlertIcon = a.icon;
          return (
            <div 
              key={i} 
              className={`flex items-center gap-3 px-5 py-3.5 border rounded-2xl text-sm font-medium transition-all shadow-sm ${a.color}`}
            >
              <AlertIcon className="h-5 w-5 flex-shrink-0" />
              <p className="flex-1">{a.msg}</p>
            </div>
          );
        })}
      </div>

      {/* ── KPI METRICS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div 
              key={i} 
              className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{s.label}</p>
                  <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{s.value}</p>
                </div>
                <div className={`p-3 rounded-2xl ${s.bg}`}>
                  <Icon className={`h-6 w-6 ${s.color}`} />
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{s.sub}</span>
                <span className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[9px] ${s.statusColor}`}>
                  {s.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── QUICK ACTIONS PANEL ── */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Quick Tools</h3>
          <p className="text-xs text-slate-400">Launch workflows or register new entities directly</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((a, i) => {
            const Icon = a.icon;
            return (
              <button 
                key={i}
                className="bg-white hover:bg-slate-50/50 border border-slate-100 hover:border-slate-200 p-5 rounded-2xl transition-all duration-200 flex flex-col items-center text-center gap-3 group shadow-sm hover:shadow-md cursor-pointer"
              >
                <div className={`p-3 rounded-2xl transition-colors duration-200 ${a.bg} group-hover:bg-opacity-80`}>
                  <Icon className={`h-6 w-6 ${a.color}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{a.label}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{a.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RECENT LIVE TRIPS ── */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Active Live Trips</h3>
            <p className="text-xs text-slate-400">Current active runs across transit regions</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors self-start shadow-sm shadow-blue-600/10">
            + Log New Trip
          </button>
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Trip ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Route</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentTrips.map((t, i) => (
                <tr key={i} className="hover:bg-slate-50/40 transition-colors cursor-pointer">
                  <td className="px-6 py-4 text-sm font-bold text-blue-600">{t.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600 border border-slate-200">
                        {t.driver.split(" ").map(w => w[0]).join("")}
                      </div>
                      {t.driver}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">{t.vehicle}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{t.route}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase ${t.statusColor}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-300" />
                      {t.time}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="sm:hidden p-4 space-y-3">
          {recentTrips.map((t, i) => (
            <div key={i} className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-blue-600">{t.id}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${t.statusColor}`}>
                  {t.status}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">{t.driver}</p>
                <p className="text-xs font-mono text-slate-400">Truck: {t.vehicle}</p>
                <p className="text-xs text-slate-600">Route: {t.route}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-100">
                <Clock className="h-3.5 w-3.5" />
                Updated {t.time}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FLEET CHART AND SUMMARIES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicles summary list */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
          <div>
            <h4 className="text-base font-bold text-slate-800">Vehicle Deployments</h4>
            <p className="text-xs text-slate-400">Breakdown of operational states</p>
          </div>
          <div className="space-y-4">
            {[
              { label: "Available", count: 18, pct: "w-[75%]", color: "bg-emerald-500", text: "text-emerald-700 bg-emerald-50" },
              { label: "On Trip", count: 6, pct: "w-[25%]", color: "bg-blue-500", text: "text-blue-700 bg-blue-50" },
              { label: "In Shop", count: 4, pct: "w-[17%]", color: "bg-amber-500", text: "text-amber-700 bg-amber-50" },
              { label: "Retired", count: 1, pct: "w-[4%]", color: "bg-slate-400", text: "text-slate-500 bg-slate-50" },
            ].map((v, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-600">{v.label}</span>
                  <span className={`px-2 py-0.5 rounded-md ${v.text}`}>{v.count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${v.color} ${v.pct} rounded-full`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drivers summary list */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
          <div>
            <h4 className="text-base font-bold text-slate-800">Driver Roster Status</h4>
            <p className="text-xs text-slate-400">Duty scheduling breakdown</p>
          </div>
          <div className="space-y-4">
            {[
              { label: "Available", count: 15, pct: "w-[48%]", color: "bg-emerald-500", text: "text-emerald-700 bg-emerald-50" },
              { label: "On Trip", count: 13, pct: "w-[42%]", color: "bg-blue-500", text: "text-blue-700 bg-blue-50" },
              { label: "Off Duty", count: 2, pct: "w-[6%]", color: "bg-slate-400", text: "text-slate-500 bg-slate-50" },
              { label: "Suspended", count: 1, pct: "w-[3%]", color: "bg-rose-500", text: "text-rose-700 bg-rose-50" },
            ].map((v, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-600">{v.label}</span>
                  <span className={`px-2 py-0.5 rounded-md ${v.text}`}>{v.count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${v.color} ${v.pct} rounded-full`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Log counts */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Analytics Feed</span>
            </div>
            <h4 className="text-base font-extrabold text-white">Daily Ledger Activity</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Summary of ledger transactions today</p>
          </div>

          <div className="divide-y divide-slate-800 my-4">
            {[
              { label: "Trips Started", val: "12 runs", icon: "🗺️" },
              { label: "Trips Completed", val: "4 runs", icon: "✅" },
              { label: "Fuel Logged", val: "840 Liters", icon: "⛽" },
              { label: "Expenses Recorded", val: "₹18,400.00", icon: "💰" }
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2.5 text-xs">
                <span className="text-slate-400 flex items-center gap-2">
                  <span className="text-sm">{item.icon}</span>
                  {item.label}
                </span>
                <span className="font-bold text-white">{item.val}</span>
              </div>
            ))}
          </div>

          <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-semibold py-2.5 rounded-xl text-center border border-slate-800">
            View Operations Logs
          </button>
        </div>
      </div>
    </div>
  );
}
