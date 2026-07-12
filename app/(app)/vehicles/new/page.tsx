"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Loader2, Info } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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

export default function NewVehiclePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    mode: "onChange",
    defaultValues: {
      code: "",
      vin: "",
      plateNumber: "",
      make: "",
      model: "",
      year: new Date().getFullYear().toString(),
      capacityKg: "",
      status: "AVAILABLE",
    },
  });

  const onSubmit = async (data: VehicleFormValues) => {
    try {
      setSubmitting(true);
      setSubmitError("");
      
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || "Failed to register vehicle. Please try again.");
      }

      router.push("/vehicles");
      router.refresh();
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <Link href="/vehicles" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-650 text-sm font-semibold transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to fleet listing
      </Link>

      <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">Register New Vehicle</h2>
          <p className="text-xs text-slate-400 mt-1">Create a profile for a new vehicle in your transport fleet</p>
        </div>

        {submitError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-semibold">
            {submitError}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Vehicle Code */}
            <div className="space-y-2">
              <Label htmlFor="code">Vehicle Identifier Code</Label>
              <Input
                id="code"
                placeholder="e.g. V-1025"
                disabled={submitting}
                {...form.register("code")}
              />
              {form.formState.errors.code && (
                <p className="text-xs text-rose-600 font-semibold">{form.formState.errors.code.message}</p>
              )}
            </div>

            {/* Plate Number */}
            <div className="space-y-2">
              <Label htmlFor="plateNumber">License Plate Number</Label>
              <Input
                id="plateNumber"
                placeholder="e.g. TN-01-AB-1234"
                disabled={submitting}
                {...form.register("plateNumber")}
              />
              {form.formState.errors.plateNumber && (
                <p className="text-xs text-rose-600 font-semibold">{form.formState.errors.plateNumber.message}</p>
              )}
            </div>

            {/* Make */}
            <div className="space-y-2">
              <Label htmlFor="make">Vehicle Manufacturer (Make)</Label>
              <Input
                id="make"
                placeholder="e.g. BharatBenz, Tata"
                disabled={submitting}
                {...form.register("make")}
              />
              {form.formState.errors.make && (
                <p className="text-xs text-rose-600 font-semibold">{form.formState.errors.make.message}</p>
              )}
            </div>

            {/* Model */}
            <div className="space-y-2">
              <Label htmlFor="model">Vehicle Model Name</Label>
              <Input
                id="model"
                placeholder="e.g. Blazo X 49, 2823C"
                disabled={submitting}
                {...form.register("model")}
              />
              {form.formState.errors.model && (
                <p className="text-xs text-rose-600 font-semibold">{form.formState.errors.model.message}</p>
              )}
            </div>

            {/* Year */}
            <div className="space-y-2">
              <Label htmlFor="year">Manufacturing Model Year</Label>
              <Input
                id="year"
                type="number"
                placeholder="e.g. 2022"
                disabled={submitting}
                {...form.register("year")}
              />
              {form.formState.errors.year && (
                <p className="text-xs text-rose-600 font-semibold">{form.formState.errors.year.message}</p>
              )}
            </div>

            {/* Max Cargo Capacity */}
            <div className="space-y-2">
              <Label htmlFor="capacityKg">Max Cargo Capacity (Kg)</Label>
              <Input
                id="capacityKg"
                type="number"
                placeholder="e.g. 24000"
                disabled={submitting}
                {...form.register("capacityKg")}
              />
              {form.formState.errors.capacityKg && (
                <p className="text-xs text-rose-600 font-semibold">{form.formState.errors.capacityKg.message}</p>
              )}
            </div>

            {/* VIN */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="vin">Vehicle Identification Number (VIN) – Optional</Label>
              <Input
                id="vin"
                placeholder="17-character VIN identifier"
                disabled={submitting}
                maxLength={17}
                {...form.register("vin")}
              />
              {form.formState.errors.vin && (
                <p className="text-xs text-rose-600 font-semibold">{form.formState.errors.vin.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="status">Operational Status</Label>
              <Select
                id="status"
                disabled={submitting}
                {...form.register("status")}
              >
                <option value="AVAILABLE">Available (Operational)</option>
                <option value="ON_TRIP">On Trip (Active Run)</option>
                <option value="IN_SHOP">In Shop (Maintenance)</option>
                <option value="RETIRED">Retired (Out of Service)</option>
              </Select>
              {form.formState.errors.status && (
                <p className="text-xs text-rose-600 font-semibold">{form.formState.errors.status.message}</p>
              )}
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Link href="/vehicles">
              <Button type="button" variant="outline" disabled={submitting} className="rounded-xl border-slate-200 cursor-pointer h-10 px-4 py-2 text-sm">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={submitting} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/10 cursor-pointer gap-2 h-10 px-4 py-2 text-sm">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                "Save Vehicle"
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-2.5 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-[11px] text-slate-500">
        <Info className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <p>Ensure that all vehicle codes are unique across the organization database as they are used for dispatch indexing.</p>
      </div>
    </div>
  );
}
