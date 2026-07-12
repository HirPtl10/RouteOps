"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TripForm, type TripDriverOption, type TripFormValues, type TripVehicleOption } from "@/components/trip-form";

export default function NewTripPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<TripVehicleOption[]>([]);
  const [drivers, setDrivers] = useState<TripDriverOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/trips");

        if (response.status === 401) {
          setLoggedOut(true);
          return;
        }

        const data = await response.json();
        setVehicles(Array.isArray(data.availableVehicles) ? data.availableVehicles : []);
        setDrivers(Array.isArray(data.availableDrivers) ? data.availableDrivers : []);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const handleSubmit = async (values: TripFormValues) => {
    try {
      setSubmitting(true);
      setErrorMessage("");

      const response = await fetch("/api/trips", {
        method: "POST",
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
        throw new Error(data?.error ?? "Unable to save trip.");
      }

      router.push("/trips");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save trip.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loggedOut) {
    return (
      <Card>
        <CardHeader>
          <Badge variant="outline" className="w-fit">
            Trips
          </Badge>
          <CardTitle>Sign in to create a trip</CardTitle>
          <CardDescription>Trip planning is organization-specific and stored in the database.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/login">
            <Badge variant="secondary">Log in</Badge>
          </Link>
          <Link href="/signup">
            <Badge variant="outline">Sign up</Badge>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <Link href="/trips" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" />
        Back to trips
      </Link>

      <Card>
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            New trip
          </Badge>
          <CardTitle>Create trip</CardTitle>
          <CardDescription>Schedule a route, assign an available driver and vehicle, and save it to the database.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-slate-500">Loading available fleet resources…</p> : null}
          <TripForm
            vehicles={vehicles}
            drivers={drivers}
            submitLabel="Create trip"
            onSubmit={handleSubmit}
            submitting={submitting}
            errorMessage={errorMessage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
