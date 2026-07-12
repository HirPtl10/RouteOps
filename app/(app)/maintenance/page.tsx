"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Wrench, 
  ArrowLeft, 
  Plus, 
  ClipboardList, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Vehicle = {
  id: string;
  code: string;
  make: string | null;
  model: string | null;
  status: string;
};

type MaintenanceLog = {
  id: string;
  description: string;
  cost: number | null;
  notes: string | null;
  openedAt: string;
  closedAt: string | null;
  vehicle: {
    id: string;
    code: string;
    make: string | null;
    model: string | null;
    status: string;
  };
};

type Stats = {
  openCount: number;
  closedThisWeek: number;
  totalCost: number;
};

const mockStats: Stats = {
  openCount: 2,
  closedThisWeek: 1,
  totalCost: 15400,
};

const mockLogs: MaintenanceLog[] = [
  {
    id: "m1",
    description: "Scheduled Engine Oil Change",
    cost: 4500,
    notes: "Regular 10k km service done.",
    openedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    closedAt: null,
    vehicle: { id: "v3", code: "V-1003", make: "BharatBenz", model: "2823C", status: "IN_SHOP" }
  },
  {
    id: "m2",
    description: "Brake Pad Replacement",
    cost: 8900,
    notes: "Front axle brake pads replaced.",
    openedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    closedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    vehicle: { id: "v2", code: "V-1002", make: "Ashok Leyland", model: "U-3518", status: "AVAILABLE" }
  },
  {
    id: "m3",
    description: "AC Compressor Repair",
    cost: null,
    notes: "AC cooling issue diagnostic.",
    openedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    closedAt: null,
    vehicle: { id: "v3", code: "V-1003", make: "BharatBenz", model: "2823C", status: "IN_SHOP" }
  }
];

export default function MaintenancePage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>(mockLogs);
  const [stats, setStats] = useState<Stats>(mockStats);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDbFallback, setIsDbFallback] = useState(true);

  // Form states
  const [showLogForm, setShowLogForm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [logsRes, vehiclesRes] = await Promise.all([
          fetch("/api/maintenance"),
          fetch("/api/vehicles"),
        ]);

        if (logsRes.ok) {
          const logsData = await logsRes.json();
          if (logsData.source === "database") {
            setLogs(logsData.logs);
            setStats(logsData.stats);
            setIsDbFallback(false);
          }
        }

        if (vehiclesRes.ok) {
          const vehiclesData = await vehiclesRes.json();
          setVehicles(vehiclesData.vehicles || []);
        }
      } catch (err) {
        console.warn("Failed to fetch from DB:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !description) {
      setFormError("Vehicle and Description are required.");
      return;
    }
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: selectedVehicle,
          description,
          cost: cost ? parseFloat(cost) : null,
          notes,
        }),
      });

      if (res.ok) {
        const newLog = await res.json();
        // Refresh page data
        const logsRes = await fetch("/api/maintenance");
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setLogs(logsData.logs);
          setStats(logsData.stats);
        }
        setShowLogForm(false);
        setSelectedVehicle("");
        setDescription("");
        setCost("");
        setNotes("");
      } else {
        const errData = await res.json();
        setFormError(errData.error || "Failed to log maintenance.");
      }
    } catch (err) {
      setFormError("Connection error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseLog = async (logId: string) => {
    try {
      const res = await fetch(`/api/maintenance/${logId}/close`, {
        method: "POST",
      });

      if (res.ok) {
        // Refresh page data
        const logsRes = await fetch("/api/maintenance");
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setLogs(logsData.logs);
          setStats(logsData.stats);
        }
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to close log.");
      }
    } catch (err) {
      alert("Error closing log.");
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (statusFilter === "OPEN") return log.closedAt === null;
    if (statusFilter === "CLOSED") return log.closedAt !== null;
    return true;
  });

  return (
    <main style={{ display: "grid", gap: "1.5rem" }}>
      {/* ── HEADER ── */}
      <section style={{ display: "flex", flexDirection: "column", gap: "0.75rem", justifyContent: "space-between" }}>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <Badge variant={isDbFallback ? "secondary" : "success"} style={{ width: "fit-content" }}>
            {isDbFallback ? "Maintenance preview" : "Live maintenance log"}
          </Badge>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.03em", color: "#020617" }}>
            Maintenance hub
          </h1>
          <p style={{ margin: 0, maxWidth: "38rem", fontSize: "0.95rem", lineHeight: 1.6, color: "#475569" }}>
            Create and track vehicle repairs. Starting maintenance transitions the vehicle to <strong>IN_SHOP</strong>, and closing it returns the vehicle to <strong>AVAILABLE</strong>.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              minHeight: "2.75rem",
              padding: "0 1rem",
              borderRadius: "0.875rem",
              background: "rgba(255,255,255,0.9)",
              color: "#0f172a",
              fontSize: "0.875rem",
              fontWeight: 600,
              textDecoration: "none",
              border: "1px solid #e2e8f0",
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          {!isDbFallback && (
            <Button
              onClick={() => setShowLogForm(!showLogForm)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "2.75rem",
                padding: "0 1rem",
                borderRadius: "0.875rem",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              <Plus className="h-4 w-4" />
              {showLogForm ? "Cancel" : "Log Maintenance"}
            </Button>
          )}
        </div>
      </section>

      {/* ── DB CONNECTION STATE INDICATOR ── */}
      {isDbFallback && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Preview mode</p>
            <p className="mt-0.5 text-amber-700 leading-relaxed">
              Log creation is available when signed in to an organization. Sign in to post live updates and status transitions.
            </p>
          </div>
        </div>
      )}

      {/* ── STATS SECTION ── */}
      <section style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <Card className="card-hover">
          <CardHeader>
            <CardDescription>Open items</CardDescription>
            <CardTitle style={{ fontSize: "2rem" }}>{stats.openCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="card-hover">
          <CardHeader>
            <CardDescription>Closed this week</CardDescription>
            <CardTitle style={{ fontSize: "2rem" }}>{stats.closedThisWeek}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="card-hover">
          <CardHeader>
            <CardDescription>Total expenditure</CardDescription>
            <CardTitle style={{ fontSize: "2rem" }}>₹{stats.totalCost.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      {/* ── FORM TO LOG MAINTENANCE ── */}
      {showLogForm && (
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle>Log Maintenance Action</CardTitle>
            <CardDescription>Transition a vehicle to IN_SHOP state and write down description details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateLog} className="space-y-4">
              {formError && (
                <p className="text-sm font-semibold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100">
                  {formError}
                </p>
              )}

              <div className="grid gap-1.5">
                <Label htmlFor="vehicle">Select Vehicle *</Label>
                <Select
                  id="vehicle"
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  required
                >
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.code} - {v.make} {v.model} ({v.status})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="description">Issue / Repair Description *</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="e.g. Brake pad replacement, Oil change"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="cost">Service Cost (₹, optional)</Label>
                <Input
                  id="cost"
                  type="number"
                  placeholder="e.g. 5000"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="notes">Additional Notes</Label>
                <textarea
                  id="notes"
                  placeholder="Mechanic feedback, diagnostic info, parts ordered..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                />
              </div>

              <Button type="submit" isLoading={submitting}>
                Save Log
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── MAINTENANCE RECORDS ── */}
      <Card>
        <CardHeader style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <CardTitle style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ClipboardList className="h-5 w-5 text-slate-600" />
              Service Records
            </CardTitle>
            <CardDescription>View maintenance updates and close open jobs</CardDescription>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="text-xs font-bold text-slate-400 uppercase">Filter:</span>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "130px" }}
            >
              <option value="ALL">All Records</option>
              <option value="OPEN">Open Only</option>
              <option value="CLOSED">Closed Only</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent style={{ display: "grid", gap: "0.75rem" }}>
          {filteredLogs.length === 0 ? (
            <p className="text-center text-slate-400 py-6 text-sm">No maintenance records found.</p>
          ) : (
            filteredLogs.map((record) => (
              <div
                key={record.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  padding: "1rem",
                  borderRadius: "1rem",
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{ display: "grid", gap: "0.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Wrench className="h-4 w-4 text-slate-500" />
                      <p style={{ margin: 0, fontWeight: 600, color: "#0f172a" }}>{record.description}</p>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#64748b" }}>
                      Vehicle: <strong>{record.vehicle.code}</strong> {record.vehicle.make && `(${record.vehicle.make} ${record.vehicle.model})`}
                    </p>
                    {record.notes && (
                      <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#475569", background: "#f8fafc", padding: "0.5rem 0.75rem", borderRadius: "0.5rem" }}>
                        {record.notes}
                      </p>
                    )}
                    {record.cost && (
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#0f172a", fontWeight: 600 }}>
                        Cost: ₹{record.cost.toLocaleString()}
                      </p>
                    )}
                    <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                      <span>Opened: {new Date(record.openedAt).toLocaleDateString()}</span>
                      {record.closedAt && (
                        <span>Closed: {new Date(record.closedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                    <Badge variant={record.closedAt ? "success" : "warning"} style={{ width: "fit-content" }}>
                      {record.closedAt ? "Closed" : "Open"}
                    </Badge>
                    
                    {!record.closedAt && !isDbFallback && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleCloseLog(record.id)}
                        className="text-xs"
                      >
                        Close Repair
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  );
}
