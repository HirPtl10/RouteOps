"use client";

import Link from "next/link";
import { 
  Truck, 
  Search, 
  SlidersHorizontal,
  Plus, 
  ArrowLeft,
  ChevronRight
} from "lucide-react";

export default function VehiclesPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link href="/" className="hover:text-slate-600 transition-colors">Dashboard</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-600">Vehicles</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Truck className="h-6 w-6 text-sky-500" />
            <span>Vehicles Management</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            View, search, filter, and modify fleet vehicle assets.
          </p>
        </div>

        <div>
          <button 
            disabled 
            className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-400 border border-slate-200 cursor-not-allowed shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Vehicle (Locked)</span>
          </button>
        </div>
      </div>

      {/* Mock Search and Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search vehicles by license plate, model, driver..." 
            disabled
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-400 placeholder-slate-400/70 shadow-sm cursor-not-allowed"
          />
        </div>
        <button 
          disabled
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-400 shadow-sm cursor-not-allowed"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Phase 2 Placeholder Alert Card */}
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-500 border border-sky-100">
          <Truck className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-sm font-bold text-slate-900">Vehicle database integration upcoming</h3>
        <p className="mt-2 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Developer 2 is building the database foundations (Prisma models, migrations). Once database schemas are verified, we will wire up the vehicle table lists.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link 
            href="/"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
