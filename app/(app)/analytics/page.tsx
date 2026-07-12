"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Fuel, 
  Percent, 
  DollarSign, 
  AlertCircle, 
  Truck, 
  Wrench,
  Activity,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Vehicle {
  id: string;
  code: string;
  make: string;
  model: string;
  type: string;
  odometer: number;
  acquisitionCost: number | null;
  status: string;
}

interface Trip {
  id: string;
  tripNumber: string;
  plannedDistance: number;
  cargoWeightKg: number;
  completedOdometer: number | null;
  fuelConsumedLiters: number | null;
  status: string;
  vehicleId: string | null;
}

interface Expense {
  id: string;
  type: "FUEL" | "TOLL" | "MAINTENANCE" | "OTHER";
  amount: number;
  liters?: number;
  vehicleCode: string;
}

export default function AnalyticsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDbFallback, setIsDbFallback] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [vehiclesRes, tripsRes, expensesRes] = await Promise.all([
        fetch("/api/vehicles"),
        fetch("/api/trips"),
        fetch("/api/expenses"),
      ]);

      if (!vehiclesRes.ok || !tripsRes.ok || !expensesRes.ok) {
        throw new Error("Failed to load analytics dashboard data.");
      }

      const vehiclesData = await vehiclesRes.json();
      const tripsData = await tripsRes.json();
      const expensesData = await expensesRes.json();

      setVehicles(vehiclesData.vehicles || []);
      setTrips(tripsData.trips || []);
      setExpenses(expensesData.expenses || []);
      setIsDbFallback(vehiclesData.source === "mock");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Metrics
  // 1. Fuel Efficiency = Total completed distance / Total fuel consumed
  const completedTrips = trips.filter(t => t.status === "COMPLETED");
  const totalCompletedDistance = completedTrips.reduce((sum, t) => sum + Number(t.plannedDistance), 0);
  
  // Sum liters from expenses log of type FUEL
  const fuelLogs = expenses.filter(e => e.type === "FUEL");
  const totalFuelLiters = fuelLogs.reduce((sum, f) => sum + (f.liters ? Number(f.liters) : 0), 0);
  const averageFuelEfficiency = totalFuelLiters > 0 ? (totalCompletedDistance / totalFuelLiters) : 0;

  // 2. Fleet Utilization = (Vehicles On Trip / Total operational vehicles) * 100
  const activeVehicles = vehicles.filter(v => v.status === "ON_TRIP").length;
  const totalActiveFleet = vehicles.filter(v => v.status !== "RETIRED").length;
  const fleetUtilization = totalActiveFleet > 0 ? (activeVehicles / totalActiveFleet) * 100 : 0;

  // 3. Total Operational Cost = Fuel Cost + Maintenance Cost
  const fuelCost = expenses.filter(e => e.type === "FUEL").reduce((sum, e) => sum + e.amount, 0);
  const maintenanceCost = expenses.filter(e => e.type === "MAINTENANCE").reduce((sum, e) => sum + e.amount, 0);
  const totalOperationalCost = fuelCost + maintenanceCost;

  // 4. Vehicle specific list and ROI calculation
  const vehicleStats = vehicles.map((v) => {
    const vFuel = expenses.filter(e => e.type === "FUEL" && e.vehicleCode === v.code).reduce((sum, e) => sum + e.amount, 0);
    const vMaint = expenses.filter(e => e.type === "MAINTENANCE" && e.vehicleCode === v.code).reduce((sum, e) => sum + e.amount, 0);
    
    // Revenue calculated as distance completed * $3.00
    const vTrips = trips.filter(t => t.vehicleId === v.id && t.status === "COMPLETED");
    const vDist = vTrips.reduce((sum, t) => sum + Number(t.plannedDistance), 0);
    const vRev = vDist * 3.00;

    const acqCost = v.acquisitionCost ? Number(v.acquisitionCost) : 50000;
    const vRoi = acqCost > 0 ? ((vRev - (vMaint + vFuel)) / acqCost) * 100 : 0;

    // Specific vehicle fuel efficiency
    const vFuelLiters = expenses.filter(e => e.type === "FUEL" && e.vehicleCode === v.code).reduce((sum, e) => sum + (e.liters ? Number(e.liters) : 0), 0);
    const vEfficiency = vFuelLiters > 0 ? (vDist / vFuelLiters) : 0;

    return {
      ...v,
      fuelCost: vFuel,
      maintenanceCost: vMaint,
      revenue: vRev,
      roi: vRoi,
      efficiency: vEfficiency,
      acquisitionCost: acqCost
    };
  });

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            Fleet Reports & Analytics
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-550 mt-1">
            Display fuel efficiency, fleet utilization rates, operational costs, and investment ROI metrics.
          </p>
        </div>

        <a href="/api/reports/csv" download="transitops-fleet-report.csv">
          <Button 
            className="rounded-xl bg-slate-900 hover:bg-slate-850 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white shadow-sm cursor-pointer gap-2 h-10 px-4 text-sm font-semibold"
          >
            <Download className="h-4.5 w-4.5" />
            Export Fleet CSV
          </Button>
        </a>
      </div>

      {isDbFallback && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl text-xs text-amber-800 dark:text-amber-400">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Preview analytics dashboard</p>
            <p className="mt-0.5 text-amber-700 dark:text-amber-500 leading-relaxed">
              Dashboard stats are estimated in guest mode. Register/login to view live calculations computed across PostgreSQL tables.
            </p>
          </div>
        </div>
      )}

      {/* ── METRICS GRID ── */}
      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
          <p className="text-slate-400 text-sm font-medium">Computing fleet analytics...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Fuel Efficiency */}
            <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Fuel Efficiency</span>
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/25 border border-blue-100/50 dark:border-blue-900/40 text-blue-650 dark:text-blue-400">
                  <Fuel className="h-5 w-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{averageFuelEfficiency.toFixed(2)} km/L</h3>
                <p className="text-[10px] text-slate-400 mt-1">Average efficiency across completed trips</p>
              </div>
            </Card>

            {/* Fleet Utilization */}
            <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Fleet Utilization</span>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-100/50 dark:border-emerald-900/40 text-emerald-650 dark:text-emerald-450">
                  <Percent className="h-5 w-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{fleetUtilization.toFixed(1)}%</h3>
                <p className="text-[10px] text-slate-400 mt-1">Percent of active vehicles on dispatch run</p>
              </div>
            </Card>

            {/* Total Expenses */}
            <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Total Operations Cost</span>
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/25 border border-rose-100/50 dark:border-rose-900/40 text-rose-650 dark:text-rose-450">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">${totalOperationalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                <p className="text-[10px] text-slate-400 mt-1">Sum of fuel refills and maintenance costs</p>
              </div>
            </Card>

            {/* Avg Fleet ROI */}
            <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Avg Vehicle ROI</span>
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/25 border border-purple-100/50 dark:border-purple-900/40 text-purple-650 dark:text-purple-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                  {(vehicleStats.reduce((sum, v) => sum + v.roi, 0) / (vehicleStats.length || 1)).toFixed(2)}%
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">Average yield index computed per asset cost</p>
              </div>
            </Card>
          </div>

          {/* ── DETAIL VECHILE ROI TABLE ── */}
          <Card className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Individual Vehicle Return on Investment (ROI)</h2>
              <p className="text-xs text-slate-400 dark:text-slate-550 mt-0.5">
                Formula: (Revenue - (Maintenance + Fuel)) / Acquisition Cost
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider pb-2">
                    <th className="py-3 px-2">Vehicle</th>
                    <th className="py-3 px-2">Acquisition Cost</th>
                    <th className="py-3 px-2">Maintenance Cost</th>
                    <th className="py-3 px-2">Fuel Cost</th>
                    <th className="py-3 px-2">Trip Revenue</th>
                    <th className="py-3 px-2">Fuel Efficiency</th>
                    <th className="py-3 px-2 text-right">ROI Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-slate-750 dark:text-slate-350">
                  {vehicleStats.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="py-3.5 px-2 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-slate-100 dark:border-slate-850 text-slate-450">
                          <Truck className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 dark:text-slate-100 font-mono leading-none">{v.code}</p>
                          <p className="text-[10px] text-slate-450 mt-0.5">{v.make} {v.model}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-2 font-semibold">
                        ${v.acquisitionCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-2 font-semibold text-amber-650">
                        ${v.maintenanceCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-2 font-semibold text-blue-600 dark:text-blue-400">
                        ${v.fuelCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-2 font-semibold text-emerald-600 dark:text-emerald-450">
                        ${v.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-2 font-semibold text-slate-500">
                        {v.efficiency.toFixed(2)} km/L
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <span className={cn(
                          "px-2.5 py-1 text-[10px] font-extrabold rounded-xl border",
                          v.roi >= 0 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40"
                            : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/40"
                        )}>
                          {v.roi >= 0 ? "+" : ""}{v.roi.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
