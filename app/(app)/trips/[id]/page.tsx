"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit3, Loader2, PlayCircle, Square, Trash2, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TripForm, type TripDriverOption, type TripFormValues, type TripVehicleOption } from "@/components/trip-form";

type TripDetail = {
  id: string;
  tripNumber: string;
  origin: string;
  destination: string;
  scheduledAt: string;
  startedAt: string | null;
  completedAt: string | null;
  status: "DRAFT" | "DISPATCHED" | "COMPLETED" | "CANCELLED";
  cargoWeightKg: number | null;
  notes: string | null;
  vehicle: {
    id: string;
    code: string;
    make?: string | null;
    model?: string | null;
    status?: string | null;
  } | null;
  driver: {
    id: string;
    firstName: string;
    lastName: string;
    licenseNumber?: string | null;
    status?: string | null;
    assignedVehicle?: {
      id: string;
      code: string;
    } | null;
  } | null;
};

function statusBadge(status: TripDetail["status"]) {
  switch (status) {
    case "DRAFT":
      return <Badge variant="secondary">Scheduled</Badge>;
    case "DISPATCHED":
      return <Badge variant="default" className="border border-blue-200 bg-blue-50 text-blue-700">In progress</Badge>;
    case "COMPLETED":
      return <Badge variant="success">Completed</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>;
  }
}

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [vehicles, setVehicles] = useState<TripVehicleOption[]>([]);
  const [drivers, setDrivers] = useState<TripDriverOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [tripResponse, tripsResponse] = await Promise.all([
          fetch(`/api/trips/${id}`),
          fetch("/api/trips"),
        ]);

        if (tripResponse.status === 401 || tripsResponse.status === 401) {
          setLoggedOut(true);
          return;
        }

        if (!tripResponse.ok) {
          throw new Error("Unable to load trip.");
        }

        const tripData = await tripResponse.json();
        const tripsData = await tripsResponse.json();

        const availableVehicles: TripVehicleOption[] = Array.isArray(tripsData.availableVehicles) ? tripsData.availableVehicles : [];
        const availableDrivers: TripDriverOption[] = Array.isArray(tripsData.availableDrivers) ? tripsData.availableDrivers : [];

        const currentVehicle = tripData.vehicle
          ? {
              id: tripData.vehicle.id,
              code: tripData.vehicle.code,
              make: tripData.vehicle.make,
              model: tripData.vehicle.model,
              status: tripData.vehicle.status,
            }
          : null;
        const currentDriver = tripData.driver
          ? {
              id: tripData.driver.id,
              firstName: tripData.driver.firstName,
              lastName: tripData.driver.lastName,
              status: tripData.driver.status,
              assignedVehicleId: tripData.driver.assignedVehicle?.id ?? null,
            }
          : null;

        setVehicles(
          currentVehicle && !availableVehicles.some((vehicle) => vehicle.id === currentVehicle.id)
            ? [currentVehicle, ...availableVehicles]
            : availableVehicles,
        );
        setDrivers(
          currentDriver && !availableDrivers.some((driver) => driver.id === currentDriver.id)
            ? [currentDriver, ...availableDrivers]
            : availableDrivers,
        );
        setTrip(tripData);
      } catch (loadError) {
        setErrorMessage(loadError instanceof Error ? loadError.message : "Unable to load trip.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const defaultValues = useMemo<Partial<TripFormValues> | undefined>(() => {
    if (!trip) return undefined;

    return {
      tripNumber: trip.tripNumber,
      origin: trip.origin,
      destination: trip.destination,
      scheduledAt: trip.scheduledAt ? trip.scheduledAt.slice(0, 16) : "",
      vehicleId: trip.vehicle?.id ?? "",
      driverId: trip.driver?.id ?? "",
      cargoWeightKg: trip.cargoWeightKg?.toString() ?? "",
      notes: trip.notes ?? "",
    };
  }, [trip]);

  const refreshTrip = async () => {
    const response = await fetch(`/api/trips/${id}`);
    const data = await response.json();
    setTrip(data);
  };

  const handleSubmit = async (values: TripFormValues) => {
    try {
      setSaving(true);
      setErrorMessage("");

      const response = await fetch(`/api/trips/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          cargoWeightKg: values.cargoWeightKg ? Number(values.cargoWeightKg) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to update trip.");
      }

      setTrip(data);
      setEditMode(false);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update trip.");
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (action: "start" | "complete" | "cancel" | "delete") => {
    const labels = {
      start: "Start this trip?",
      complete: "Complete this trip?",
      cancel: "Cancel this trip?",
      delete: "Delete this trip?",
    } as const;

    if (!confirm(labels[action])) return;

    try {
      setActionLoading(action);
      setErrorMessage("");

      const response = await fetch(`/api/trips/${id}${action === "delete" ? "" : `/${action}`}`, {
        method: action === "delete" ? "DELETE" : "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to update trip.");
      }

      if (action === "delete") {
        router.push("/trips");
        router.refresh();
        return;
      }

      setTrip(data);
      setEditMode(false);
      await refreshTrip();
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update trip.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loggedOut) {
    return (
      <Card>
        <CardHeader>
          <Badge variant="outline" className="w-fit">
            Trips
          </Badge>
          <CardTitle>Sign in to view trip details</CardTitle>
          <CardDescription>Trip data belongs to the authenticated organization.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/login">
            <Button>Log in</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline">Sign up</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (loading || !trip) {
    if (!loading && !trip) {
      return (
        <Card>
          <CardHeader>
            <Badge variant="outline" className="w-fit">
              Trips
            </Badge>
            <CardTitle>Unable to load trip</CardTitle>
            <CardDescription>{errorMessage || "The trip record could not be found."}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/trips">
              <Button variant="outline">Back to trips</Button>
            </Link>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white py-20">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Link href="/trips" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" />
        Back to trips
      </Link>

      <Card>
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="grid gap-1">
              <Badge variant="secondary" className="w-fit">
                Trip profile
              </Badge>
              <CardTitle className="flex flex-wrap items-center gap-2">
                {trip.tripNumber}
                {statusBadge(trip.status)}
              </CardTitle>
              <CardDescription>
                {trip.origin} → {trip.destination}
              </CardDescription>
            </div>
            {!editMode && trip.status === "DRAFT" ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setEditMode(true)} className="gap-2">
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Button>
                <Button onClick={() => runAction("start")} className="gap-2" disabled={actionLoading === "start"}>
                  <PlayCircle className="h-4 w-4" />
                  Start
                </Button>
                <Button variant="outline" onClick={() => runAction("cancel")} disabled={actionLoading === "cancel"}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => runAction("delete")} className="gap-2" disabled={actionLoading === "delete"}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            ) : null}
            {!editMode && trip.status === "DISPATCHED" ? (
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => runAction("complete")} className="gap-2" disabled={actionLoading === "complete"}>
                  <Square className="h-4 w-4" />
                  Complete
                </Button>
              </div>
            ) : null}
            {!editMode && trip.status === "CANCELLED" ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="destructive" onClick={() => runAction("delete")} className="gap-2" disabled={actionLoading === "delete"}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            ) : null}
          </div>
          {errorMessage ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{errorMessage}</div> : null}
        </CardHeader>
        <CardContent className="grid gap-6">
          {editMode ? (
            <TripForm
              defaultValues={defaultValues}
              vehicles={vehicles}
              drivers={drivers}
              submitLabel="Save trip"
              onSubmit={handleSubmit}
              onCancel={() => setEditMode(false)}
              submitting={saving}
            />
          ) : (
            <div className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Scheduled for</p>
                  <p className="mt-1 font-medium text-slate-900">{new Date(trip.scheduledAt).toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Vehicle</p>
                  <p className="mt-1 font-medium text-slate-900">{trip.vehicle ? trip.vehicle.code : "Not assigned"}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Driver</p>
                  <p className="mt-1 font-medium text-slate-900">
                    {trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : "Not assigned"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cargo weight</p>
                  <p className="mt-1 font-medium text-slate-900">{trip.cargoWeightKg ? `${trip.cargoWeightKg.toLocaleString()} kg` : "Not set"}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Started</p>
                  <p className="mt-1 font-medium text-slate-900">{trip.startedAt ? new Date(trip.startedAt).toLocaleString() : "Not started"}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completed</p>
                  <p className="mt-1 font-medium text-slate-900">{trip.completedAt ? new Date(trip.completedAt).toLocaleString() : "Not completed"}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4 text-slate-500" />
                  <p className="text-sm font-semibold text-slate-900">Notes</p>
                </div>
                <p className="mt-2 text-sm text-slate-600">{trip.notes ?? "No notes added."}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
