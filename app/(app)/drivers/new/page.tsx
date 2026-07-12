"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DriverForm, type DriverFormValues, type VehicleOption } from "@/components/driver-form";

export default function NewDriverPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/drivers");

        if (response.status === 401) {
          setLoggedOut(true);
          return;
        }

        const data = await response.json();
        setVehicles(Array.isArray(data.availableVehicles) ? data.availableVehicles : []);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const handleSubmit = async (values: DriverFormValues) => {
    try {
      setSubmitting(true);
      setErrorMessage("");

      const response = await fetch("/api/drivers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to save driver.");
      }

      router.push("/drivers");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save driver.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loggedOut) {
    return (
      <Card>
        <CardHeader>
          <Badge variant="outline" className="w-fit">
            Drivers
          </Badge>
          <CardTitle>Sign in to add a driver</CardTitle>
          <CardDescription>The driver directory belongs to the logged-in organization.</CardDescription>
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
      <Link href="/drivers" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" />
        Back to drivers
      </Link>

      <Card>
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            New driver
          </Badge>
          <CardTitle>Add driver</CardTitle>
          <CardDescription>Create a driver profile and optionally link a currently available vehicle.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-slate-500">Loading available vehicles…</p> : null}
          <DriverForm
            vehicles={vehicles}
            submitLabel="Create driver"
            onSubmit={handleSubmit}
            submiting={submitting}
            errorMessage={errorMessage}
          />
        </CardContent>
      </Card>
    </div>
  );
}

