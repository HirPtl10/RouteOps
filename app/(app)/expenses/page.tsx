"use client";

import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  Search, 
  Plus, 
  Loader2, 
  AlertCircle, 
  FolderOpen, 
  Fuel, 
  Tag, 
  Wrench, 
  Calendar,
  HelpCircle,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Vehicle {
  id: string;
  code: string;
  make: string;
  model: string;
}

interface Expense {
  id: string;
  type: "FUEL" | "TOLL" | "MAINTENANCE" | "OTHER";
  description: string;
  amount: number;
  liters?: number;
  date: string;
  vehicleCode: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDbFallback, setIsDbFallback] = useState(false);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [type, setType] = useState<"FUEL" | "TOLL" | "MAINTENANCE" | "OTHER">("FUEL");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [amount, setAmount] = useState("");
  const [liters, setLiters] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [expensesRes, vehiclesRes] = await Promise.all([
        fetch("/api/expenses"),
        fetch("/api/vehicles"),
      ]);

      if (!expensesRes.ok || !vehiclesRes.ok) {
        throw new Error("Failed to load operational expenses.");
      }

      const expensesData = await expensesRes.json();
      const vehiclesData = await vehiclesRes.json();

      setExpenses(expensesData.expenses || []);
      setVehicles(vehiclesData.vehicles || []);
      setIsDbFallback(expensesData.source === "mock");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while loading lists.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddForm = () => {
    setType("FUEL");
    setSelectedVehicleId("");
    setAmount("");
    setLiters("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setShowForm(true);
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId || !amount || !description || !date) {
      alert("Please fill in all required fields.");
      return;
    }

    if (type === "FUEL" && !liters) {
      alert("Please provide the fuel volume in liters.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          vehicleId: selectedVehicleId,
          amount,
          liters: type === "FUEL" ? liters : undefined,
          description,
          date,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || "Failed to log operational cost.");
      }

      setShowForm(false);
      loadData();
    } catch (err: any) {
      alert(err.message || "Unable to log cost.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.vehicleCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || e.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "FUEL":
        return <Fuel className="h-4.5 w-4.5 text-blue-500" />;
      case "MAINTENANCE":
        return <Wrench className="h-4.5 w-4.5 text-amber-500" />;
      case "TOLL":
        return <Tag className="h-4.5 w-4.5 text-emerald-500" />;
      default:
        return <HelpCircle className="h-4.5 w-4.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Fuel & Expenses Tracking
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-550 mt-1">
            Log fuel logs, tolls, and maintenance services to calculate fleet operation cost metrics.
          </p>
        </div>

        <Button 
          onClick={openAddForm}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/10 cursor-pointer gap-2 h-10 px-4 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          Log Operational Expense
        </Button>
      </div>

      {isDbFallback && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl text-xs text-amber-800 dark:text-amber-400">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Preview expense records</p>
            <p className="mt-0.5 text-amber-700 dark:text-amber-500 leading-relaxed">
              Preview log is loaded in guest mode. Login to persist fuel logs and compute automated vehicle ROI metrics in the PostgreSQL database.
            </p>
          </div>
        </div>
      )}

      {/* Creation form Drawer */}
      {showForm && (
        <Card className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg p-6 rounded-3xl space-y-6">
          <CardHeader className="p-0 border-b border-slate-100 dark:border-slate-800 pb-3">
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Log Fleet Cost / Refill
            </CardTitle>
            <CardDescription className="text-xs">
              Inputs will update the vehicle's historical operating ledger dynamically.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateExpense} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Expense Category</Label>
                <Select id="type" value={type} onChange={(e) => setType(e.target.value as any)}>
                  <option value="FUEL">Fuel Refill</option>
                  <option value="TOLL">Toll Charge</option>
                  <option value="MAINTENANCE">Maintenance Cost</option>
                  <option value="OTHER">Other Expense</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle">Select Fleet Vehicle</Label>
                <Select id="vehicle" value={selectedVehicleId} onChange={(e) => setSelectedVehicleId(e.target.value)} required>
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.code} - {v.make} {v.model}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Cost Amount ($)</Label>
                <Input id="amount" type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 120.00" required />
              </div>

              {type === "FUEL" && (
                <div className="space-y-2">
                  <Label htmlFor="liters">Refill Volume (Liters)</Label>
                  <Input id="liters" type="number" step="0.1" min="0.1" value={liters} onChange={(e) => setLiters(e.target.value)} placeholder="e.g. 40.5" required />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="date">Date Incurred</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Cost Description / Supplier notes</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Chevron station fuel refill" required />
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 h-10 text-xs">
                {submitting ? "Logging..." : "Log Cost"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* FILTER CONTROLS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search description or truck..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-550 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-800 focus:border-slate-300 dark:focus:border-slate-700 transition-all"
            />
          </div>

          <div className="border-t border-slate-100/80 dark:border-slate-800/80 md:border-none pt-3 md:pt-0 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wide mr-2">Category:</span>
            {[
              { label: "All costs", value: "ALL" },
              { label: "Fuel", value: "FUEL" },
              { label: "Tolls", value: "TOLL" },
              { label: "Maintenance", value: "MAINTENANCE" },
              { label: "Other", value: "OTHER" },
            ].map((tab) => {
              const isSelected = typeFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setTypeFilter(tab.value)}
                  className={cn(
                    "px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer",
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
                      : "bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
          <p className="text-slate-400 text-sm font-medium">Loading cost records...</p>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm text-center space-y-4">
          <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800">
            <FolderOpen className="h-10 w-10" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-700 dark:text-slate-200 text-base">No Expenses Found</h3>
            <p className="text-xs text-slate-450 dark:text-slate-550 mt-1 max-w-sm mx-auto leading-relaxed">
              We couldn't find any logged operational expenses matching your criteria.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Type</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right pr-6">Cost Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-slate-750 dark:text-slate-350">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="p-4 pl-6 flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex-shrink-0">
                        {getIcon(exp.type)}
                      </div>
                      <span className="font-bold text-[10px] uppercase tracking-wide">{exp.type}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-250 font-bold font-mono">
                        <Truck className="h-3.5 w-3.5 text-slate-400" />
                        {exp.vehicleCode}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-700 dark:text-slate-200">{exp.description}</p>
                      {exp.liters && (
                        <p className="text-[10px] text-slate-450 mt-0.5">{exp.liters} Liters consumed</p>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 font-medium">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right pr-6 font-extrabold text-slate-850 dark:text-slate-100">
                      ${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
