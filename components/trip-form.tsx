"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const tripFormSchema = z.object({
  tripNumber: z.string().min(2, "Trip number is required."),
  origin: z.string().min(2, "Origin is required."),
  destination: z.string().min(2, "Destination is required."),
  scheduledAt: z.string().min(1, "Scheduled date and time is required."),
  vehicleId: z.string().optional().nullable(),
  driverId: z.string().optional().nullable(),
  cargoWeightKg: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type TripFormValues = z.infer<typeof tripFormSchema>;

export type TripVehicleOption = {
  id: string;
  code: string;
  make?: string | null;
  model?: string | null;
  status?: string | null;
};

export type TripDriverOption = {
  id: string;
  firstName: string;
  lastName: string;
  status?: string | null;
  assignedVehicleId?: string | null;
};

type TripFormProps = {
  defaultValues?: Partial<TripFormValues>;
  vehicles: TripVehicleOption[];
  drivers: TripDriverOption[];
  submitLabel: string;
  onSubmit: (values: TripFormValues) => Promise<void>;
  onCancel?: () => void;
  errorMessage?: string;
  submitting?: boolean;
};

const emptyValues: TripFormValues = {
  tripNumber: "",
  origin: "",
  destination: "",
  scheduledAt: "",
  vehicleId: "",
  driverId: "",
  cargoWeightKg: "",
  notes: "",
};

export function TripForm({
  defaultValues,
  vehicles,
  drivers,
  submitLabel,
  onSubmit,
  onCancel,
  errorMessage,
  submitting = false,
}: TripFormProps) {
  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      ...emptyValues,
      ...defaultValues,
      vehicleId: defaultValues?.vehicleId ?? "",
      driverId: defaultValues?.driverId ?? "",
      cargoWeightKg: defaultValues?.cargoWeightKg ?? "",
      notes: defaultValues?.notes ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      ...emptyValues,
      ...defaultValues,
      vehicleId: defaultValues?.vehicleId ?? "",
      driverId: defaultValues?.driverId ?? "",
      cargoWeightKg: defaultValues?.cargoWeightKg ?? "",
      notes: defaultValues?.notes ?? "",
    });
  }, [defaultValues, form]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tripNumber">Trip number</Label>
          <Input id="tripNumber" disabled={submitting} {...form.register("tripNumber")} />
          {form.formState.errors.tripNumber ? <p className="text-xs text-rose-600">{form.formState.errors.tripNumber.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheduledAt">Scheduled date/time</Label>
          <Input id="scheduledAt" type="datetime-local" disabled={submitting} {...form.register("scheduledAt")} />
          {form.formState.errors.scheduledAt ? <p className="text-xs text-rose-600">{form.formState.errors.scheduledAt.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="origin">Origin</Label>
          <Input id="origin" disabled={submitting} {...form.register("origin")} />
          {form.formState.errors.origin ? <p className="text-xs text-rose-600">{form.formState.errors.origin.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <Input id="destination" disabled={submitting} {...form.register("destination")} />
          {form.formState.errors.destination ? <p className="text-xs text-rose-600">{form.formState.errors.destination.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicleId">Vehicle</Label>
          <Select id="vehicleId" disabled={submitting} {...form.register("vehicleId")}>
            <option value="">Select an available vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.code} {vehicle.make ? `· ${vehicle.make}` : ""} {vehicle.model ? vehicle.model : ""}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="driverId">Driver</Label>
          <Select id="driverId" disabled={submitting} {...form.register("driverId")}>
            <option value="">Select an available driver</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.firstName} {driver.lastName}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cargoWeightKg">Cargo weight (kg)</Label>
          <Input id="cargoWeightKg" type="number" disabled={submitting} {...form.register("cargoWeightKg")} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" rows={4} disabled={submitting} {...form.register("notes")} />
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
        {onCancel ? (
          <Button type="button" variant="outline" disabled={submitting} onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving
            </>
          ) : (
            <>
              {submitLabel}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

