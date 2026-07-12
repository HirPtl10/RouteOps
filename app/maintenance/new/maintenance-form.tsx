"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Select } from "../../../components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../components/ui/card";
import { createMaintenanceLog } from "../actions";

interface VehicleOption {
  id: string;
  code: string;
  make: string;
  model: string;
  plateNumber: string;
  status: string;
}

export function MaintenanceForm({ vehicles }: { vehicles: VehicleOption[] }) {
  const router = useRouter();
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
      const res = await createMaintenanceLog(null, formData);
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
        <CardTitle>Log Maintenance Entry</CardTitle>
        <CardDescription>
          Record a new maintenance task or repair. Submitting will immediately transition the selected vehicle's status to IN_SHOP.
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
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

          {/* Vehicle Field */}
          <div className="space-y-2">
            <Label htmlFor="vehicleId">Selected Vehicle</Label>
            <Select
              id="vehicleId"
              name="vehicleId"
              required
              className={fieldErrors.vehicleId ? "border-rose-500" : ""}
            >
              <option value="">Select a vehicle...</option>
              {vehicles
                .filter((v) => v.status !== "RETIRED")
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.code} — {v.make} {v.model} ({v.plateNumber}) [Status: {v.status}]
                  </option>
                ))}
            </Select>
            {fieldErrors.vehicleId && (
              <p className="text-xs font-semibold text-rose-600">{fieldErrors.vehicleId[0]}</p>
            )}
          </div>

          {/* Opened Date */}
          <div className="space-y-2">
            <Label htmlFor="openedAt">Opened Date</Label>
            <Input
              id="openedAt"
              name="openedAt"
              type="date"
              defaultValue={today}
              required
              className={fieldErrors.openedAt ? "border-rose-500" : ""}
            />
            {fieldErrors.openedAt && (
              <p className="text-xs font-semibold text-rose-600">{fieldErrors.openedAt[0]}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Issue / Job Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Provide a detailed description of the maintenance requirements..."
              rows={4}
              required
              className={fieldErrors.description ? "border-rose-500" : ""}
            />
            {fieldErrors.description && (
              <p className="text-xs font-semibold text-rose-600">{fieldErrors.description[0]}</p>
            )}
          </div>

          {/* Cost & Notes */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cost">Estimated Cost ($)</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 250.00 (optional)"
                className={fieldErrors.cost ? "border-rose-500" : ""}
              />
              {fieldErrors.cost && (
                <p className="text-xs font-semibold text-rose-600">{fieldErrors.cost[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Input
                id="notes"
                name="notes"
                placeholder="Vendor details, parts ordered... (optional)"
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
            Create Entry
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
