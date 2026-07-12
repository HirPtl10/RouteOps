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

const driverFormSchema = z.object({
  firstName: z.string().min(2, "First name is required."),
  lastName: z.string().min(2, "Last name is required."),
  licenseNumber: z.string().min(3, "License number is required."),
  licenseExpiresAt: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.enum(["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"]),
  assignedVehicleId: z.string().optional().nullable(),
});

export type DriverFormValues = z.infer<typeof driverFormSchema>;

export type VehicleOption = {
  id: string;
  code: string;
  make?: string | null;
  model?: string | null;
  status?: string | null;
};

type DriverFormProps = {
  defaultValues?: Partial<DriverFormValues>;
  vehicles: VehicleOption[];
  submitLabel: string;
  onSubmit: (values: DriverFormValues) => Promise<void>;
  onCancel?: () => void;
  errorMessage?: string;
  submiting?: boolean;
};

const emptyValues: DriverFormValues = {
  firstName: "",
  lastName: "",
  licenseNumber: "",
  licenseExpiresAt: "",
  phone: "",
  status: "AVAILABLE",
  assignedVehicleId: "",
};

export function DriverForm({
  defaultValues,
  vehicles,
  submitLabel,
  onSubmit,
  onCancel,
  errorMessage,
  submiting = false,
}: DriverFormProps) {
  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      ...emptyValues,
      ...defaultValues,
      licenseExpiresAt: defaultValues?.licenseExpiresAt ?? "",
      phone: defaultValues?.phone ?? "",
      assignedVehicleId: defaultValues?.assignedVehicleId ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      ...emptyValues,
      ...defaultValues,
      licenseExpiresAt: defaultValues?.licenseExpiresAt ?? "",
      phone: defaultValues?.phone ?? "",
      assignedVehicleId: defaultValues?.assignedVehicleId ?? "",
    });
  }, [defaultValues, form]);

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" disabled={submiting} {...form.register("firstName")} />
          {form.formState.errors.firstName ? <p className="text-xs text-rose-600">{form.formState.errors.firstName.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" disabled={submiting} {...form.register("lastName")} />
          {form.formState.errors.lastName ? <p className="text-xs text-rose-600">{form.formState.errors.lastName.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenseNumber">License number</Label>
          <Input id="licenseNumber" disabled={submiting} {...form.register("licenseNumber")} />
          {form.formState.errors.licenseNumber ? <p className="text-xs text-rose-600">{form.formState.errors.licenseNumber.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenseExpiresAt">License expiry</Label>
          <Input id="licenseExpiresAt" type="date" disabled={submiting} {...form.register("licenseExpiresAt")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" disabled={submiting} {...form.register("phone")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select id="status" disabled={submiting} {...form.register("status")}>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On trip</option>
            <option value="OFF_DUTY">Off duty</option>
            <option value="SUSPENDED">Suspended</option>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="assignedVehicleId">Assigned vehicle</Label>
          <Select id="assignedVehicleId" disabled={submiting} {...form.register("assignedVehicleId")}>
            <option value="">No direct vehicle assignment</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.code} {vehicle.make ? `· ${vehicle.make}` : ""} {vehicle.model ? vehicle.model : ""}
              </option>
            ))}
          </Select>
          <p className="text-xs text-slate-500">
            Assigning a vehicle here keeps the driver profile linked while trip dispatch still uses available fleet resources.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
        {onCancel ? (
          <Button type="button" variant="outline" disabled={submiting} onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={submiting}>
          {submiting ? (
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

