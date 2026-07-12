"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Loader2, Edit3, Trash2, ShieldCheck, CheckCircle2, ShieldAlert } from "lucide-react";

import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Select } from "../../../../components/ui/select";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";

const vehicleSchema = z.object({
  code: z
    .string()
    .min(3, { message: "Vehicle code must be at least 3 characters." })
    .max(12, { message: "Vehicle code cannot exceed 12 characters." })
    .regex(/^[a-zA-Z0-9-]+$/, { message: "Only letters, numbers, and hyphens allowed." }),
  vin: z
    .string()
    .max(17, { message: "VIN must be exactly 17 characters." })
    .transform((val) => val === "" ? undefined : val)
    .optional(),
  plateNumber: z
    .string()
    .min(4, { message: "Plate number must be at least 4 characters." })
    .max(15, { message: "Plate number cannot exceed 15 characters." }),
  make: z.string().min(2, { message: "Make is required." }),
  model: z.string().min(2, { message: "Model is required." }),
  year: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 1950 && Number(val) <= new Date().getFullYear() + 1, {
      message: "Please enter a valid model year (e.g. 1950 to next year).",
    }),
  capacityKg: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 100, {
      message: "Capacity must be a positive number of at least 100 kg.",
    }),
  status: z.enum(["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"]),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [vehicle, setVehicle] = useState<any>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    mode: "onChange",
  });

  useEffect(() => {
    async function loadVehicle() {
      try {
        setLoading(true);
        const res = await fetch(`/api/vehicles/${id}`);
        if (!res.ok) throw new Error("Could not load vehicle details.");
        const data = await res.json();
        setVehicle(data);
        
        // Reset form values with loaded data
        form.reset({
          code: data.code,
          vin: data.vin || "",
          plateNumber: data.plateNumber,
          make: data.make,
          model: data.model,
          year: data.year.toString(),
          capacityKg: data.capacityKg.toString(),
          status: data.status,
        });
      } catch (err: any) {
        setError(err.message || "Failed to load vehicle data.");
      } finally {
        setLoading(false);
      }
    }
    loadVehicle();
  }, [id, form]);

  const onSubmit = async (data: VehicleFormValues) => {
    try {
      setSubmitting(true);
      setSuccessMsg("");
      const response = await fetch(`/api/vehicles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update vehicle profile.");
      }

      const updated = await response.json();
      setVehicle(updated);
      setEditMode(false);
      setSuccessMsg("Vehicle profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during update.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge variant="success">Available</Badge>;
      case "ON_TRIP":
        return <Badge variant="default" className="bg-blue-50 text-blue-700 border border-blue-200">On Trip</Badge>;
      case "IN_SHOP":
        return <Badge variant="warning">In Shop</Badge>;
      case "RETIRED":
        return <Badge variant="destructive">Retired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 bg-white border border-slate-100 rounded-3xl shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !vehicle) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-center space-y-4">
        <p className="font-bold text-sm">Error Loading Vehicle Profile</p>
        <p className="text-xs text-rose-700">{error}</p>
        <Link href="/vehicles" className="inline-block text-xs font-semibold text-rose-805 hover:underline">
          Return to vehicle list
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Navigation */}
      <Link href="/vehicles" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-650 text-sm font-semibold transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to fleet listing
      </Link>

      {/* Success alert message banner */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold animate-pulse">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Profile Card / Form container */}
      <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
        
        {/* Toggle Headings */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold text-slate-800 tracking-tight">{vehicle?.code}</span>
              {!editMode && getStatusBadge(vehicle?.status)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {editMode ? "Make changes and submit them with the validation check" : "Fleet profile registration details"}
            </p>
          </div>

          {!editMode && (
            <Button 
              onClick={() => setEditMode(true)}
              className="gap-1.5 rounded-xl border-slate-200 hover:bg-slate-50 cursor-pointer h-9 px-3 text-xs bg-slate-900 text-white hover:bg-slate-800 font-medium"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit Details
            </Button>
          )}
        </div>

        {/* Form View / Read Mode View */}
        {editMode ? (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Vehicle Code */}
              <div className="space-y-2">
                <Label htmlFor="code">Vehicle Code</Label>
                <Input id="code" disabled={submitting} {...form.register("code")} />
                {form.formState.errors.code && (
                  <p className="text-xs text-rose-600 font-semibold">{form.formState.errors.code.message}</p>
                )}
              </div>

              {/* Plate Number */}
              <div className="space-y-2">
                <Label htmlFor="plateNumber">Plate Number</Label>
                <Input id="plateNumber" disabled={submitting} {...form.register("plateNumber")} />
                {form.formState.errors.plateNumber && (
                  <p className="text-xs text-rose-600 font-semibold">{form.formState.errors.plateNumber.message}</p>
                )}
              </div>

              {/* Make */}
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input id="make" disabled={submitting} {...form.register("make")} />
                {form.formState.errors.make && (
                  <p className="text-xs text-rose-600 font-semibold">{form.formState.errors.make.message}</p>
                )}
              </div>

              {/* Model */}
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input id="model" disabled={submitting} {...form.register("model")} />
                {form.formState.errors.model && (
                  <p className="text-xs text-rose-600 font-semibold">{form.formState.errors.model.message}</p>
                )}
              </div>

              {/* Year */}
              <div className="space-y-2">
                <Label htmlFor="year">Manufacturing Year</Label>
                <Input id="year" type="number" disabled={submitting} {...form.register("year")} />
                {form.formState.errors.year && (
                  <p className="text-xs text-rose-600 font-semibold">{form.formState.errors.year.message}</p>
                )}
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <Label htmlFor="capacityKg">Cargo Capacity (Kg)</Label>
                <Input id="capacityKg" type="number" disabled={submitting} {...form.register("capacityKg")} />
                {form.formState.errors.capacityKg && (
                  <p className="text-xs text-rose-600 font-semibold">{form.formState.errors.capacityKg.message}</p>
                )}
              </div>

              {/* VIN */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="vin">Vehicle Identification Number (VIN)</Label>
                <Input id="vin" disabled={submitting} maxLength={17} {...form.register("vin")} />
                {form.formState.errors.vin && (
                  <p className="text-xs text-rose-600 font-semibold">{form.formState.errors.vin.message}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="status">Operational Status</Label>
                <Select id="status" disabled={submitting} {...form.register("status")}>
                  <option value="AVAILABLE">Available</option>
                  <option value="ON_TRIP">On Trip</option>
                  <option value="IN_SHOP">In Shop</option>
                  <option value="RETIRED">Retired</option>
                </Select>
                {form.formState.errors.status && (
                  <p className="text-xs text-rose-600 font-semibold">{form.formState.errors.status.message}</p>
                )}
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                disabled={submitting} 
                onClick={() => setEditMode(false)}
                className="rounded-xl border-slate-200 cursor-pointer h-10 px-4 py-2 text-sm"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting} 
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/10 cursor-pointer gap-2 h-10 px-4 py-2 text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        ) : (
          /* Read-only profile view */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Manufacturer / Brand</p>
                <p className="text-sm font-bold text-slate-700 mt-1">{vehicle?.make}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Model Name</p>
                <p className="text-sm font-bold text-slate-700 mt-1">{vehicle?.model}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Model Year</p>
                <p className="text-sm font-bold text-slate-700 mt-1">{vehicle?.year}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cargo Weight Limit</p>
                <p className="text-sm font-bold text-slate-700 mt-1">{vehicle?.capacityKg?.toLocaleString()} kg</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">License Plate Number</p>
                <p className="text-sm font-mono font-bold text-slate-700 mt-1">{vehicle?.plateNumber}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">17-Char VIN Code</p>
                <p className="text-sm font-mono font-bold text-slate-700 mt-1">{vehicle?.vin || "—"}</p>
              </div>

            </div>

            {/* Status alerts indicators based on rules in CONTEXT.md */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dispatch Compliance Check</h4>
              {vehicle?.status === "IN_SHOP" ? (
                <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-800 font-semibold">
                  <ShieldAlert className="h-5 w-5 text-rose-600 flex-shrink-0" />
                  Vehicle is IN_SHOP and cannot be dispatched on active trips.
                </div>
              ) : vehicle?.status === "RETIRED" ? (
                <div className="flex items-center gap-2.5 p-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-xs text-slate-650 font-semibold">
                  <ShieldAlert className="h-5 w-5 text-slate-500 flex-shrink-0" />
                  Vehicle is RETIRED and permanently barred from new dispatches.
                </div>
              ) : (
                <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs text-emerald-800 font-semibold">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  Vehicle is verified compliant for active operational dispatch routing.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
