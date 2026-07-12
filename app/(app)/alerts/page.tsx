"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  AlertTriangle, 
  ShieldAlert, 
  Wrench, 
  FileText, 
  UserX, 
  HelpCircle, 
  CheckCircle, 
  Eye, 
  Check, 
  X,
  Info,
  SlidersHorizontal,
  Bell
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type AlertType = "MAINTENANCE" | "BREAKDOWN" | "DOCUMENT" | "DRIVER" | "OTHER";
type AlertStatus = "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";

interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  relatedTo: string;
  timestamp: string;
  severity: Severity;
  status: AlertStatus;
  details?: string;
  entityId?: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDbFallback, setIsDbFallback] = useState(true);

  // Filter States
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/alerts");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
        setIsDbFallback(data.source !== "database");
        
        // Update selected alert if it is currently open
        if (selectedAlert) {
          const updated = (data.alerts || []).find((a: AlertItem) => a.id === selectedAlert.id);
          if (updated) {
            setSelectedAlert(updated);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Summary stats
  const totalActive = alerts.filter(a => a.status === "ACTIVE").length;
  const totalCritical = alerts.filter(a => a.severity === "CRITICAL" && a.status !== "RESOLVED").length;
  const maintenanceAlerts = alerts.filter(a => a.type === "MAINTENANCE" && a.status !== "RESOLVED").length;
  const totalResolved = alerts.filter(a => a.status === "RESOLVED").length;

  // Filter computation
  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = severityFilter === "ALL" || alert.severity === severityFilter;
    const matchesType = typeFilter === "ALL" || alert.type === typeFilter;
    const matchesStatus = statusFilter === "ALL" || alert.status === statusFilter;
    return matchesSeverity && matchesType && matchesStatus;
  });

  // Action handlers
  const handleAcknowledge = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (isDbFallback) {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "ACKNOWLEDGED" as AlertStatus } : a));
      if (selectedAlert?.id === id) {
        setSelectedAlert(prev => prev ? { ...prev, status: "ACKNOWLEDGED" as AlertStatus } : null);
      }
      return;
    }

    try {
      const res = await fetch(`/api/alerts/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "acknowledge" }),
      });
      if (res.ok) {
        // Since we don't store ack status persistently for some transient computed alerts,
        // we can also locally toggle it.
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "ACKNOWLEDGED" as AlertStatus } : a));
        if (selectedAlert?.id === id) {
          setSelectedAlert(prev => prev ? { ...prev, status: "ACKNOWLEDGED" as AlertStatus } : null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (isDbFallback) {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "RESOLVED" as AlertStatus } : a));
      if (selectedAlert?.id === id) {
        setSelectedAlert(prev => prev ? { ...prev, status: "RESOLVED" as AlertStatus } : null);
      }
      return;
    }

    try {
      const res = await fetch(`/api/alerts/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve" }),
      });
      if (res.ok) {
        await fetchAlerts();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to resolve alert.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case "CRITICAL":
        return <Badge variant="destructive" className="bg-rose-50 text-rose-700 border-rose-200 font-bold">Critical</Badge>;
      case "HIGH":
        return <Badge variant="warning" className="bg-amber-50 text-amber-800 border-amber-200 font-bold">High</Badge>;
      case "MEDIUM":
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 font-bold">Medium</Badge>;
      case "LOW":
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Low</Badge>;
    }
  };

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-red-50 text-red-700 border border-red-200/80">Active</Badge>;
      case "ACKNOWLEDGED":
        return <Badge className="bg-yellow-50 text-yellow-800 border border-yellow-200/80">Acknowledged</Badge>;
      case "RESOLVED":
        return <Badge variant="success">Resolved</Badge>;
    }
  };

  const getAlertIcon = (type: AlertType) => {
    const cls = "h-5 w-5";
    switch (type) {
      case "MAINTENANCE":
        return <Wrench className={`${cls} text-amber-600`} />;
      case "BREAKDOWN":
        return <ShieldAlert className={`${cls} text-rose-600`} />;
      case "DOCUMENT":
        return <FileText className={`${cls} text-blue-600`} />;
      case "DRIVER":
        return <UserX className={`${cls} text-purple-600`} />;
      default:
        return <HelpCircle className={`${cls} text-slate-600`} />;
    }
  };

  const getAlertBg = (type: AlertType) => {
    switch (type) {
      case "MAINTENANCE":
        return "bg-amber-50 border border-amber-100";
      case "BREAKDOWN":
        return "bg-rose-50 border border-rose-100";
      case "DOCUMENT":
        return "bg-blue-50 border border-blue-100";
      case "DRIVER":
        return "bg-purple-50 border border-purple-100";
      default:
        return "bg-slate-50 border border-slate-100";
    }
  };

  const resetFilters = () => {
    setSeverityFilter("ALL");
    setTypeFilter("ALL");
    setStatusFilter("ALL");
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── HEADER SECTION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="gap-1 bg-slate-50 border-slate-200">
              <Bell className="h-3 w-3 text-slate-500 animate-bounce" />
              Real-time Alerting
            </Badge>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">System Alerts</h2>
          <p className="text-sm text-slate-400">Track critical exceptions, compliance documents, and breakdown diagnostics</p>
        </div>
      </div>

      {/* ── DB CONNECTION STATE INDICATOR ── */}
      {isDbFallback && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Preview mode</p>
            <p className="mt-0.5 text-amber-700 leading-relaxed">
              Viewing preview alerts. Authenticated organization sessions connect directly to dynamic database exceptions.
            </p>
          </div>
        </div>
      )}

      {/* ── SUMMARY STATS ── */}
      <section className="grid gap-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Active</CardDescription>
            <CardTitle className="text-3xl font-extrabold text-slate-850 flex items-center justify-between">
              <span>{totalActive}</span>
              <AlertTriangle className="h-6 w-6 text-red-500 opacity-80" />
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">Critical Alerts</CardDescription>
            <CardTitle className="text-3xl font-extrabold text-rose-650 flex items-center justify-between">
              <span>{totalCritical}</span>
              <ShieldAlert className="h-6 w-6 text-rose-600 opacity-80" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">Maintenance Alerts</CardDescription>
            <CardTitle className="text-3xl font-extrabold text-amber-650 flex items-center justify-between">
              <span>{maintenanceAlerts}</span>
              <Wrench className="h-6 w-6 text-amber-500 opacity-80" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">Resolved Alerts</CardDescription>
            <CardTitle className="text-3xl font-extrabold text-emerald-650 flex items-center justify-between">
              <span>{totalResolved}</span>
              <CheckCircle className="h-6 w-6 text-emerald-500 opacity-80" />
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      {/* ── FILTER CONTROLS ── */}
      <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4.5 w-4.5 text-slate-400" />
          <span className="text-sm font-bold text-slate-700">Filters</span>
        </div>
        
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
              <option value="ACTIVE">Active</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
            </Select>
          </div>

          {/* Severity Filter */}
          <div className="w-full sm:w-44 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide hidden sm:inline">Severity:</span>
            <Select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-xl font-medium"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </Select>
          </div>

          {/* Alert Type Filter */}
          <div className="w-full sm:w-48 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide hidden sm:inline">Category:</span>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="BREAKDOWN">Breakdown</option>
              <option value="DOCUMENT">Document</option>
              <option value="DRIVER">Driver</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
        </div>
      </div>

      {/* ── ALERTS LIST & DETAIL GRID ── */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Alerts List */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="flex justify-center items-center py-20 bg-white border border-slate-100 rounded-3xl shadow-sm">
              <p className="text-slate-400 text-sm font-medium">Querying database alerts...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 bg-white border border-slate-100 rounded-3xl shadow-sm text-center space-y-4">
              <div className="p-4 rounded-full bg-slate-50 text-slate-400 border border-slate-100">
                <Bell className="h-10 w-10" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-750 text-base">No Matching Alerts</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  There are no alerts matching your selected severity, category, or status parameters.
                </p>
              </div>
              <Button onClick={resetFilters} className="text-xs h-9">
                Reset Filters
              </Button>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer card-hover hover:border-slate-300 bg-white flex items-start gap-4 ${
                  selectedAlert?.id === alert.id ? "ring-2 ring-slate-800 border-transparent shadow-md" : "border-slate-200"
                }`}
              >
                <div className={`p-2.5 rounded-xl ${getAlertBg(alert.type)} flex-shrink-0`}>
                  {getAlertIcon(alert.type)}
                </div>
                
                <div className="flex-grow min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{alert.type}</span>
                    <span className="text-xs text-slate-400 font-medium ml-auto">{alert.timestamp}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm leading-tight">{alert.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{alert.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="text-[11px] font-mono text-slate-650 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-md">{alert.relatedTo}</span>
                    <div className="flex items-center gap-1.5 ml-auto">
                      {getSeverityBadge(alert.severity)}
                      {getStatusBadge(alert.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detailed View Panel */}
        <div className="lg:col-span-1">
          {selectedAlert ? (
            <Card className="sticky top-6 border border-slate-200/90 shadow-md">
              <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Info className="h-4.5 w-4.5 text-slate-600" />
                    Alert Details
                  </CardTitle>
                  <CardDescription className="text-xs">System diagnosis & context</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-slate-100" 
                  onClick={() => setSelectedAlert(null)}
                >
                  <X className="h-4 w-4 text-slate-400" />
                </Button>
              </CardHeader>

              <CardContent className="pt-6 space-y-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{selectedAlert.type} Alert</span>
                  <h3 className="text-base font-extrabold text-slate-800 leading-snug">{selectedAlert.title}</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Severity</p>
                    <div className="mt-1">{getSeverityBadge(selectedAlert.severity)}</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedAlert.status)}</div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h5 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wide">Association</h5>
                  <p className="text-sm font-semibold text-slate-750 font-mono bg-slate-50 border border-slate-100 p-2 rounded-xl">{selectedAlert.relatedTo}</p>
                </div>

                <div className="space-y-1.5">
                  <h5 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wide">Description</h5>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/55 p-3 border border-slate-100 rounded-xl">{selectedAlert.description}</p>
                </div>

                {selectedAlert.details && (
                  <div className="space-y-1.5">
                    <h5 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wide">Diagnosis Context</h5>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/55 p-3 border border-slate-100 rounded-xl">{selectedAlert.details}</p>
                  </div>
                )}

                <div className="text-[11px] text-slate-400 flex justify-between items-center pt-2 border-t border-slate-100">
                  <span>First reported:</span>
                  <span className="font-semibold">{selectedAlert.timestamp}</span>
                </div>

                {/* Operations Buttons */}
                {selectedAlert.status !== "RESOLVED" && (
                  <div className="flex gap-2 pt-3">
                    {selectedAlert.status === "ACTIVE" && (
                      <Button
                        onClick={() => handleAcknowledge(selectedAlert.id)}
                        className="w-full text-xs font-semibold h-10 px-4 py-2"
                        variant="secondary"
                      >
                        <Check className="h-4 w-4" />
                        Acknowledge
                      </Button>
                    )}
                    <Button
                      onClick={() => handleResolve(selectedAlert.id)}
                      className="w-full text-xs font-semibold h-10 px-4 py-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Resolve Alert
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="border border-dashed border-slate-200 p-8 rounded-3xl text-center space-y-3 sticky top-6">
              <Info className="h-8 w-8 text-slate-350 mx-auto" />
              <div>
                <h4 className="font-bold text-slate-700 text-sm">Select an Alert</h4>
                <p className="text-xs text-slate-450 mt-1 max-w-[200px] mx-auto leading-relaxed">
                  Click on any alert log from the list to view diagnostic details, severity info, and resolution actions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
