"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Truck, 
  Plus, 
  Search, 
  Filter, 
  AlertCircle,
  SlidersHorizontal,
  ChevronRight,
  RefreshCw,
  FolderOpen
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Select } from "../../../components/ui/select";

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

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("code");

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

  // Filter and sort computation
  const filteredVehicles = vehicles
    .filter((v) => {
      const matchesSearch = 
        v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.vin && v.vin.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "ALL" || v.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "code") return a.code.localeCompare(b.code);
      if (sortBy === "make") return a.make.localeCompare(b.make);
      if (sortBy === "year") return b.year - a.year; // newest model first
      if (sortBy === "capacity") return b.capacityKg - a.capacityKg; // highest capacity first
      return 0;
    });

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setSortBy("code");
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

      {/* ── FILTER / CONTROLS PANEL ── */}
      <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search code, plate number, brand..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          
          {/* Status Filter */}
          <div className="w-full sm:w-44 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide hidden sm:inline">Status:</span>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ON_TRIP">On Trip</option>
              <option value="IN_SHOP">In Shop</option>
              <option value="RETIRED">Retired</option>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="w-full sm:w-44 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide hidden sm:inline">Sort:</span>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl font-medium"
            >
              <option value="code">Code Identifier</option>
              <option value="make">Brand Name</option>
              <option value="year">Model Year</option>
              <option value="capacity">Max Capacity</option>
            </Select>
          </div>

        </div>
      </div>

      {/* ── FLEET LIST / TABLE ── */}
      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <p className="text-slate-400 text-sm font-medium">Loading fleet records...</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        /* Empty Search Results State */
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-white border border-slate-100 rounded-3xl shadow-sm text-center space-y-4">
          <div className="p-4 rounded-full bg-slate-50 text-slate-400 border border-slate-100">
            <FolderOpen className="h-10 w-10" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-700 text-base">No Fleet Results Found</h3>
            <p className="text-xs text-slate-450 mt-1 max-w-sm mx-auto leading-relaxed">
              We couldn't find any vehicles matching "{searchTerm}" {statusFilter !== "ALL" && `with status ${statusFilter}`}. Check spelling or reset selectors.
            </p>
          </div>
          <Button 
            onClick={clearFilters}
            className="rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 cursor-pointer h-9 px-3 text-xs bg-slate-900 text-white font-semibold gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Clear All Filters
          </Button>
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
                {filteredVehicles.map((v) => (
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
            {filteredVehicles.map((v) => (
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
