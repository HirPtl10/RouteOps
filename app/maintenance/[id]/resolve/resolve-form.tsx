"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../../components/ui/card";
import { resolveMaintenanceLog } from "../../actions";

interface VehicleDetails {
  code: string;
  make: string;
  model: string;
  plateNumber: string;
}

interface MaintenanceLogDetails {
  id: string;
  description: string;
  notes: string | null;
  cost: number | any | null;
  vehicle: VehicleDetails;
}

export function ResolveForm({ log }: { log: MaintenanceLogDetails }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Default date to today in local timezone YYYY-MM-DD
  const today = new Date().toLocaleDateString("en-CA"); // Formats as YYYY-MM-DD in local time

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    try {
      const res = await resolveMaintenanceLog(null, formData);
      if (res && !res.success) {
        if (res.errors) {
          setFieldErrors(res.errors);
        } else if (res.error) {
          setError(res.error);
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-md">
      <CardHeader>
        <CardTitle>Complete Maintenance Entry</CardTitle>
        <CardDescription>
          Provide the completion details below. Submitting will transition the vehicle's status back to AVAILABLE.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <input type="hidden" name="logId" value={log.id} />

        <CardContent className="space-y-6">
          {/* General Error Message */}
          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 flex items-center space-x-2">
              <svg className="h-5 w-5 text-rose-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Record Details Context Panel */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 text-sm text-slate-700 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Service Record Details</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-slate-900 block mb-0.5">Vehicle</span>
                <span className="text-slate-600">
                  {log.vehicle.code} — {log.vehicle.make} {log.vehicle.model} ({log.vehicle.plateNumber})
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-900 block mb-0.5">Issue Description</span>
                <span className="text-slate-600 line-clamp-3">{log.description}</span>
              </div>
            </div>
          </div>

          {/* Completion Date */}
          <div className="space-y-2">
            <Label htmlFor="closedAt">Completion Date</Label>
            <Input
              id="closedAt"
              name="closedAt"
              type="date"
              defaultValue={today}
              required
              className={fieldErrors.closedAt ? "border-rose-500" : ""}
            />
            {fieldErrors.closedAt && (
              <p className="text-xs font-semibold text-rose-600">{fieldErrors.closedAt[0]}</p>
            )}
          </div>

          {/* Final Cost & Notes */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cost">Final Cost ($)</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 350.00"
                className={fieldErrors.cost ? "border-rose-500" : ""}
              />
              {fieldErrors.cost && (
                <p className="text-xs font-semibold text-rose-600">{fieldErrors.cost[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Resolution Notes / Comments</Label>
              <Input
                id="notes"
                name="notes"
                placeholder="All repairs done, test drive passed... (optional)"
                defaultValue={log.notes || ""}
                className={fieldErrors.notes ? "border-rose-500" : ""}
              />
              {fieldErrors.notes && (
                <p className="text-xs font-semibold text-rose-600">{fieldErrors.notes[0]}</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center border-t border-slate-100 pt-6">
          <Link
            href="/maintenance"
            className="inline-flex items-center justify-center h-10 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <Button type="submit" isLoading={loading}>
            Complete Service
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
