"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit3, Loader2, Trash2, UserRound, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DriverForm, type DriverFormValues, type VehicleOption } from "@/components/driver-form";

type DriverDetail = {
  id: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  licenseExpiresAt: string | null;
  phone: string | null;
  status: "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "SUSPENDED";
  assignedVehicle: {
    id: string;
    code: string;
    make?: string | null;
    model?: string | null;
    status?: string | null;
  } | null;
  trips: Array<{
    id: string;
    tripNumber: string;
    status: string;
    vehicle?: {
      id: string;
      code: string;
      status?: string | null;
    } | null;
    createdAt: string;
  }>;
};

function formatDate(dateValue: string | null) {
  return dateValue ? new Date(dateValue).toLocaleDateString() : "Not set";
}

function statusBadge(status: DriverDetail["status"]) {
  switch (status) {
    case "AVAILABLE":
      return <Badge variant="success">Available</Badge>;
    case "ON_TRIP":
      return <Badge variant="default" className="border border-blue-200 bg-blue-50 text-blue-700">On trip</Badge>;
    case "OFF_DUTY":
      return <Badge variant="outline">Off duty</Badge>;
    case "SUSPENDED":
      return <Badge variant="destructive">Suspended</Badge>;
  }
}

export default function DriverDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [driver, setDriver] = useState<DriverDetail | null>(null);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const [driverResponse, driversResponse] = await Promise.all([
          fetch(`/api/drivers/${id}`),
          fetch("/api/drivers"),
        ]);

        if (driverResponse.status === 401 || driversResponse.status === 401) {
          setLoggedOut(true);
          return;
        }

        if (!driverResponse.ok) {
          throw new Error("Unable to load driver profile.");
        }

        const driverData = await driverResponse.json();
        const driversData = await driversResponse.json();
        const availableVehicles: VehicleOption[] = Array.isArray(driversData.availableVehicles) ? driversData.availableVehicles : [];

        const currentVehicle = driverData.assignedVehicle
          ? {
              id: driverData.assignedVehicle.id,
              code: driverData.assignedVehicle.code,
              make: driverData.assignedVehicle.make,
              model: driverData.assignedVehicle.model,
              status: driverData.assignedVehicle.status,
            }
          : null;

        setVehicles(
          currentVehicle && !availableVehicles.some((vehicle) => vehicle.id === currentVehicle.id)
            ? [currentVehicle, ...availableVehicles]
            : availableVehicles,
        );
        setDriver(driverData);
      } catch (loadError) {
        setErrorMessage(loadError instanceof Error ? loadError.message : "Unable to load driver profile.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const defaultValues = useMemo<Partial<DriverFormValues> | undefined>(() => {
    if (!driver) return undefined;

    return {
      firstName: driver.firstName,
      lastName: driver.lastName,
      licenseNumber: driver.licenseNumber,
      licenseExpiresAt: driver.licenseExpiresAt ? driver.licenseExpiresAt.slice(0, 10) : "",
      phone: driver.phone ?? "",
      status: driver.status,
      assignedVehicleId: driver.assignedVehicle?.id ?? "",
    };
  }, [driver]);

  const handleSubmit = async (values: DriverFormValues) => {
    try {
      setSaving(true);
      setErrorMessage("");

      const response = await fetch(`/api/drivers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to update driver.");
      }

      setDriver(data);
      setEditMode(false);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update driver.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this driver? Drivers with trip history cannot be removed.")) {
      return;
    }

    try {
      const response = await fetch(`/api/drivers/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to delete driver.");
      }

      router.push("/drivers");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete driver.");
    }
  };

  if (loggedOut) {
    return (
      <Card>
        <CardHeader>
          <Badge variant="outline" className="w-fit">
            Drivers
          </Badge>
          <CardTitle>Sign in to view driver details</CardTitle>
          <CardDescription>Driver profiles are available once the organization is authenticated.</CardDescription>
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

  if (loading || !driver) {
    if (!loading && !driver) {
      return (
        <Card>
          <CardHeader>
            <Badge variant="outline" className="w-fit">
              Drivers
            </Badge>
            <CardTitle>Unable to load driver</CardTitle>
            <CardDescription>{errorMessage || "The driver record could not be found."}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/drivers">
              <Button variant="outline">Back to drivers</Button>
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
      <Link href="/drivers" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" />
        Back to drivers
      </Link>

      <Card>
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="grid gap-1">
              <Badge variant="secondary" className="w-fit">
                Driver profile
              </Badge>
              <CardTitle className="flex flex-wrap items-center gap-2">
                {driver.firstName} {driver.lastName}
                {statusBadge(driver.status)}
              </CardTitle>
              <CardDescription>Profile details, vehicle assignment, and trip history.</CardDescription>
            </div>
            {!editMode ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setEditMode(true)} className="gap-2">
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={handleDelete} className="gap-2">
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
            <DriverForm
              defaultValues={defaultValues}
              vehicles={vehicles}
              submitLabel="Save driver"
              onSubmit={handleSubmit}
              onCancel={() => setEditMode(false)}
              submiting={saving}
            />
          ) : (
            <div className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">License</p>
                  <p className="mt-1 font-medium text-slate-900">{driver.licenseNumber}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p>
                  <p className="mt-1 font-medium text-slate-900">{driver.phone ?? "Not set"}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">License expiry</p>
                  <p className="mt-1 font-medium text-slate-900">{formatDate(driver.licenseExpiresAt)}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned vehicle</p>
                  <p className="mt-1 font-medium text-slate-900">{driver.assignedVehicle ? driver.assignedVehicle.code : "None"}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-slate-500" />
                  <p className="text-sm font-semibold text-slate-900">Recent trips</p>
                </div>
                <div className="mt-4 grid gap-3">
                  {driver.trips.length > 0 ? (
                    driver.trips.map((trip) => (
                      <div key={trip.id} className="flex flex-col gap-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">{trip.tripNumber}</p>
                          <Badge variant="outline">{trip.status}</Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          {trip.vehicle?.code ?? "No vehicle"} · {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No trips have been assigned to this driver yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
