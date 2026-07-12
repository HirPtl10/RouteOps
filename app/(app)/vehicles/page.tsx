"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Truck, 
  Plus, 
  Search, 
  Filter, 
  AlertCircle,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  Info
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";

// Mock data matching schema fields if database URL is missing/Prisma fails
const mockVehicles = [
  { id: "v1", code: "V-1001", vin: "1FM5K8F82HGD8201", plateNumber: "TN-01-AB-1234", make: "Tata", model: "Prima 4925.S", year: 2022, capacityKg: 25000, status: "AVAILABLE" },
  { id: "v2", code: "V-1002", vin: "5XXG24H12JHG9312", plateNumber: "TN-02-CD-5678", make: "Ashok Leyland", model: "U-3518", year: 2021, capacityKg: 18000, status: "ON_TRIP" },
  { id: "v3", code: "V-1003", vin: "1GCVKREC3HFK1284", plateNumber: "MH-03-EF-9012", make: "BharatBenz", model: "2823C", year: 2023, capacityKg: 16000, status: "IN_SHOP" },
  { id: "v4", code: "V-1004", vin: "JN8AS5MW9HJK3918", plateNumber: "GJ-04-GH-3456", make: "Mahindra", model: "Blazo X 49", year: 2020, capacityKg: 28000, status: "AVAILABLE" },
  { id: "v5", code: "V-1005", vin: "1FA6P8CF4GHK8210", plateNumber: "DL-01-JK-7890", make: "Eicher", model: "Pro 6048", year: 2019, capacityKg: 24000, status: "RETIRED" },
];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [loading, setLoading] = useState(false);
  const [isDbFallback, setIsDbFallback] = useState(true);

  // In a real environment, we'd fetch from a Server Action or Route Handler.
  // We'll write the Prisma fetch simulation here.
  useEffect(() => {
    async function fetchVehicles() {
      try {
        setLoading(true);
        // We trigger an API fetch to verify if database is active.
        const res = await fetch("/api/vehicles");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setVehicles(data);
            setIsDbFallback(false);
          }
        }
      } catch (err) {
        console.warn("Prisma DB fetch bypassed, falling back to static fleet data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicles();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge variant="success">Available</Badge>;
      case "ON_TRIP":
        return <Badge variant="default" className="bg-blue-50 text-blue-700 border-blue-200 border">On Trip</Badge>;
      case "IN_SHOP":
        return <Badge variant="warning">In Shop</Badge>;
      case "RETIRED":
        return <Badge variant="destructive">Retired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER SECTION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Vehicles Fleet</h2>
          <p className="text-sm text-slate-400">Monitor vehicle profiles, capacity, and active statuses</p>
        </div>
        <Link href="/vehicles/new">
          <Button className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/10 cursor-pointer h-10 px-4 py-2">
            <Plus className="h-4.5 w-4.5" />
            Add Vehicle
          </Button>
        </Link>
      </div>

      {/* ── DB CONNECTION STATE INDICATOR ── */}
      {isDbFallback && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Bypassing Live Database Connection</p>
            <p className="mt-0.5 text-amber-700 leading-relaxed">
              RouteOps is currently operating in sandbox simulation mode. Static fleet records are shown because the database is not configured. When Developer 2 finishes DB setup, live connection will sync automatically.
            </p>
          </div>
        </div>
      )}

      {/* ── FILTER / CONTROLS PLACEHOLDER (Phase 5 Ownership) ── */}
      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search code, plate number..." 
            disabled
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 cursor-not-allowed text-slate-400 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" disabled className="gap-2 w-full sm:w-auto rounded-xl border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed">
            <Filter className="h-4 w-4" />
            Filter Status
          </Button>
          <Button variant="outline" disabled className="gap-2 w-full sm:w-auto rounded-xl border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed">
            <SlidersHorizontal className="h-4 w-4" />
            Sort
          </Button>
        </div>
      </div>

      {/* ── FLEET LIST / TABLE ── */}
      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <p className="text-slate-400 text-sm font-medium">Loading fleet records...</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vehicle Code</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Make / Model</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Plate Number</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">VIN</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Max Capacity</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{v.code}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-200">
                          <Truck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{v.make} {v.model}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Model Year: {v.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{v.plateNumber}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{v.vin}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{v.capacityKg.toLocaleString()} kg</td>
                    <td className="px-6 py-4">{getStatusBadge(v.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/vehicles/${v.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-800 font-semibold gap-1">
                          Profile
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Grid/Card View */}
          <div className="md:hidden p-4 space-y-3">
            {vehicles.map((v) => (
              <div key={v.id} className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-800">{v.code}</span>
                  {getStatusBadge(v.status)}
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800">{v.make} {v.model}</p>
                  <div className="grid grid-cols-2 gap-y-1 text-xs text-slate-400 pt-2 border-t border-slate-100/50">
                    <p>Plate: <span className="font-mono text-slate-600">{v.plateNumber}</span></p>
                    <p>Capacity: <span className="text-slate-600 font-medium">{v.capacityKg.toLocaleString()} kg</span></p>
                    <p className="col-span-2">VIN: <span className="font-mono text-slate-600">{v.vin}</span></p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <Link href={`/vehicles/${v.id}`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full text-xs text-blue-600 border-blue-100 hover:bg-blue-50 font-semibold rounded-xl">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
