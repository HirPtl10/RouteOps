"use client";

import Link from "next/link";
import { 
  Truck, 
  Users, 
  Route, 
  AlertCircle,
  Plus, 
  TrendingUp, 
  ShieldAlert,
  ArrowRight
} from "lucide-react";

export default function Home() {
  // Stat cards definitions
  const stats = [
    {
      title: "Active Fleet Vehicles",
      value: "42",
      description: "36 Available, 6 On Trip",
      icon: Truck,
      color: "from-sky-500 to-blue-600",
      bgLight: "bg-sky-50/50",
      borderCol: "border-sky-100",
      link: "/vehicles"
    },
    {
      title: "Registered Drivers",
      value: "28",
      description: "22 On Duty, 6 Off Duty",
      icon: Users,
      color: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50/50",
      borderCol: "border-emerald-100",
      link: "/drivers"
    },
    {
      title: "Active Trips Today",
      value: "14",
      description: "8 Dispatched, 6 Completed",
      icon: Route,
      color: "from-indigo-500 to-violet-600",
      bgLight: "bg-indigo-50/50",
      borderCol: "border-indigo-100",
      link: "/trips"
    },
    {
      title: "Critical Issues",
      value: "3",
      description: "2 Maintenance, 1 Alert",
      icon: AlertCircle,
      color: "from-amber-500 to-rose-600",
      bgLight: "bg-amber-50/50",
      borderCol: "border-amber-100",
      link: "/maintenance"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-sm">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-gradient-to-tr from-sky-300/10 to-indigo-500/10 blur-3xl" />
        
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50/50 px-3 py-1 text-xs font-semibold text-sky-700">
            <TrendingUp className="h-3 w-3" />
            <span>Active Hackathon Sprint</span>
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            TransitOps Fleet Console
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">
            Manage your organization's vehicles, drivers, expenses, and schedules from a single, unified operations dashboard. Select active roles above to test conditional permissions.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link 
              key={stat.title}
              href={stat.link} 
              className={`group relative overflow-hidden rounded-2xl border ${stat.borderCol} ${stat.bgLight} p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-white`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">{stat.title}</span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr ${stat.color} text-white shadow-md shadow-slate-200`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
                <span className="block mt-1 text-xs text-slate-500 font-medium">{stat.description}</span>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span>View details</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Section Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Quick Actions Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Quick Operations</h3>
          <div className="space-y-3">
            <Link
              href="/vehicles"
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100/70 hover:border-slate-300 hover:text-slate-900 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <span className="block font-bold">Add Fleet Vehicle</span>
                  <span className="text-[10px] text-slate-500 font-normal">Register a new asset</span>
                </div>
              </div>
              <div className="rounded-lg bg-white p-1 shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="h-3 w-3" />
              </div>
            </Link>

            <Link
              href="/trips"
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100/70 hover:border-slate-300 hover:text-slate-900 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Route className="h-4 w-4" />
                </div>
                <div>
                  <span className="block font-bold">Dispatch New Trip</span>
                  <span className="text-[10px] text-slate-500 font-normal">Assign route and cargo</span>
                </div>
              </div>
              <div className="rounded-lg bg-white p-1 shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="h-3 w-3" />
              </div>
            </Link>
          </div>
        </div>

        {/* Development Team Standup / Status */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Sprint Log & Features</h3>
          <div className="space-y-4">
            <div className="flex gap-4 rounded-xl bg-slate-50 p-4 border border-slate-100">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Developer 1 Active Task</h4>
                <p className="mt-1 text-xs text-slate-500 leading-normal">
                  Successfully implemented the application layout, responsive navigation, side menus, and mock role toggle contexts to verify access scopes.
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-[9px] font-semibold text-sky-800 uppercase tracking-wide">
                    Phase 1 Done
                  </span>
                  <span className="text-[10px] text-slate-400">Ready for review</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 p-3.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Next Sprint</span>
                <p className="mt-1 text-xs font-semibold text-slate-700">Phase 2: Vehicles Listing</p>
                <p className="mt-0.5 text-[10px] text-slate-500">Database setup & active listings</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-3.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Auth Status</span>
                <p className="mt-1 text-xs font-semibold text-slate-700">Awaiting Dev 3 Auth.js</p>
                <p className="mt-0.5 text-[10px] text-slate-500">Role-based authentication hooks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
