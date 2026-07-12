"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, Plus, Search, Users, UserCheck, UserX, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type DriverRecord = {
  id: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  licenseExpiresAt: string | null;
  phone: string | null;
  status: "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "SUSPENDED";
  assignedVehicle?: {
    id: string;
    code: string;
    make?: string | null;
    model?: string | null;
    status?: string | null;
  } | null;
  _count?: {
    trips: number;
  };
};

type DriverStats = {
  total: number;
  available: number;
  onTrip: number;
  offDuty: number;
  suspended: number;
  assignedVehicleCount: number;
};

const statusLabels: Record<DriverRecord["status"], string> = {
  AVAILABLE: "Available",
  ON_TRIP: "On trip",
  OFF_DUTY: "Off duty",
  SUSPENDED: "Suspended",
};

function statusBadge(status: DriverRecord["status"]) {
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

export default function DriversPage() {
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | DriverRecord["status"]>("ALL");
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    async function loadDrivers() {
      try {
        setLoading(true);
        const response = await fetch("/api/drivers");

        if (response.status === 401) {
          setLoggedOut(true);
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load drivers.");
        }

        const data = await response.json();
        setDrivers(Array.isArray(data.drivers) ? data.drivers : []);
        setStats(data.stats ?? null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load drivers.");
      } finally {
        setLoading(false);
      }
    }

    loadDrivers();
  }, []);

  const filteredDrivers = useMemo(
    () =>
      drivers.filter((driver) => {
        const fullName = `${driver.firstName} ${driver.lastName}`.toLowerCase();
        const searchTerm = search.toLowerCase();
        const matchesSearch =
          fullName.includes(searchTerm) ||
          driver.licenseNumber.toLowerCase().includes(searchTerm) ||
          (driver.phone ?? "").toLowerCase().includes(searchTerm) ||
          (driver.assignedVehicle?.code ?? "").toLowerCase().includes(searchTerm);

        const matchesStatus = statusFilter === "ALL" || driver.status === statusFilter;

        return matchesSearch && matchesStatus;
      }),
    [drivers, search, statusFilter],
  );

  const refreshDrivers = async () => {
    const response = await fetch("/api/drivers");
    const data = await response.json();
    setDrivers(Array.isArray(data.drivers) ? data.drivers : []);
    setStats(data.stats ?? null);
  };

  if (loggedOut) {
    return (
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <Badge variant="outline" className="w-fit">
              Drivers
            </Badge>
            <CardTitle>Sign in to manage drivers</CardTitle>
            <CardDescription>Driver records are organization-scoped and stored in the database.</CardDescription>
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
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-1">
            <Badge variant="secondary" className="w-fit">
              Driver management
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Drivers</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Create, update, and retire driver profiles while keeping availability and assignments in sync.
            </p>
          </div>
          <Link href="/drivers/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add driver
            </Button>
          </Link>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardDescription>Total drivers</CardDescription>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats?.total ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardDescription>Available</CardDescription>
            <UserCheck className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats?.available ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardDescription>On trip</CardDescription>
            <Truck className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats?.onTrip ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardDescription>Assigned vehicles</CardDescription>
            <UserX className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats?.assignedVehicleCount ?? 0}</CardContent>
        </Card>
      </section>

      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, license, phone, assigned vehicle"
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
          <option value="ALL">All statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="ON_TRIP">On trip</option>
          <option value="OFF_DUTY">Off duty</option>
          <option value="SUSPENDED">Suspended</option>
        </Select>
      </section>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-slate-500">Loading drivers…</CardContent>
        </Card>
      ) : filteredDrivers.length === 0 ? (
        <Card>
          <CardContent className="grid gap-4 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="grid gap-1">
              <h2 className="text-base font-semibold text-slate-800">No drivers found</h2>
              <p className="text-sm text-slate-500">Add the first driver or clear the search filters.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredDrivers.map((driver) => (
            <Card key={driver.id}>
              <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                <div className="grid gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-900">
                      {driver.firstName} {driver.lastName}
                    </h2>
                    {statusBadge(driver.status)}
                  </div>
                  <p className="text-sm text-slate-600">License {driver.licenseNumber}</p>
                  <p className="text-sm text-slate-500">
                    {driver.phone ? driver.phone : "No phone"} · {driver._count?.trips ?? 0} trips
                  </p>
                  <p className="text-sm text-slate-500">
                    Assigned vehicle: {driver.assignedVehicle ? driver.assignedVehicle.code : "None"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/drivers/${driver.id}`}>
                    <Button variant="outline">View profile</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button variant="outline" onClick={refreshDrivers} className="w-fit">
        Refresh from database
      </Button>
    </div>
  );
}

