"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, Plus, Search, CalendarRange, Truck, UserRound, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type TripRecord = {
  id: string;
  tripNumber: string;
  origin: string;
  destination: string;
  scheduledAt: string;
  startedAt: string | null;
  completedAt: string | null;
  status: "DRAFT" | "DISPATCHED" | "COMPLETED" | "CANCELLED";
  vehicle?: {
    id: string;
    code: string;
    make?: string | null;
    model?: string | null;
    status?: string | null;
  } | null;
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    status?: string | null;
  } | null;
};

type TripStats = {
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
};

const statusLabels: Record<TripRecord["status"], string> = {
  DRAFT: "Scheduled",
  DISPATCHED: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function statusBadge(status: TripRecord["status"]) {
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

export default function TripsPage() {
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [stats, setStats] = useState<TripStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TripRecord["status"]>("ALL");
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    async function loadTrips() {
      try {
        setLoading(true);
        const response = await fetch("/api/trips");

        if (response.status === 401) {
          setLoggedOut(true);
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load trips.");
        }

        const data = await response.json();
        setTrips(Array.isArray(data.trips) ? data.trips : []);
        setStats(data.stats ?? null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load trips.");
      } finally {
        setLoading(false);
      }
    }

    loadTrips();
  }, []);

  const filteredTrips = useMemo(
    () =>
      trips.filter((trip) => {
        const searchTerm = search.toLowerCase();
        const matchesSearch =
          trip.tripNumber.toLowerCase().includes(searchTerm) ||
          trip.origin.toLowerCase().includes(searchTerm) ||
          trip.destination.toLowerCase().includes(searchTerm) ||
          (trip.vehicle?.code ?? "").toLowerCase().includes(searchTerm) ||
          `${trip.driver?.firstName ?? ""} ${trip.driver?.lastName ?? ""}`.toLowerCase().includes(searchTerm);

        const matchesStatus = statusFilter === "ALL" || trip.status === statusFilter;

        return matchesSearch && matchesStatus;
      }),
    [search, statusFilter, trips],
  );

  const refreshTrips = async () => {
    const response = await fetch("/api/trips");
    const data = await response.json();
    setTrips(Array.isArray(data.trips) ? data.trips : []);
    setStats(data.stats ?? null);
  };

  if (loggedOut) {
    return (
      <Card>
        <CardHeader>
          <Badge variant="outline" className="w-fit">
            Trips
          </Badge>
          <CardTitle>Sign in to manage trips</CardTitle>
          <CardDescription>Trips are scoped to the authenticated organization.</CardDescription>
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

  return (
    <div className="grid gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-1">
            <Badge variant="secondary" className="w-fit">
              Trip management
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Trips</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Schedule trips, assign available fleet resources, and move them through the dispatch lifecycle.
            </p>
          </div>
          <Link href="/trips/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create trip
            </Button>
          </Link>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardDescription>Scheduled</CardDescription>
            <CalendarRange className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats?.scheduled ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardDescription>In progress</CardDescription>
            <Route className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats?.inProgress ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardDescription>Completed</CardDescription>
            <Truck className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats?.completed ?? 0}</CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardDescription>Cancelled</CardDescription>
            <UserRound className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats?.cancelled ?? 0}</CardContent>
        </Card>
      </section>

      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search trip, route, vehicle, or driver"
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
          <option value="ALL">All statuses</option>
          <option value="DRAFT">Scheduled</option>
          <option value="DISPATCHED">In progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
      </section>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-slate-500">Loading trips…</CardContent>
        </Card>
      ) : filteredTrips.length === 0 ? (
        <Card>
          <CardContent className="grid gap-4 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="grid gap-1">
              <h2 className="text-base font-semibold text-slate-800">No trips found</h2>
              <p className="text-sm text-slate-500">Create the first scheduled trip or clear the filters.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredTrips.map((trip) => (
            <Card key={trip.id}>
              <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                <div className="grid gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-900">{trip.tripNumber}</h2>
                    {statusBadge(trip.status)}
                  </div>
                  <p className="text-sm text-slate-600">
                    {trip.origin} → {trip.destination}
                  </p>
                  <p className="text-sm text-slate-500">
                    {trip.vehicle?.code ?? "No vehicle"} · {trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : "No driver"}
                  </p>
                  <p className="text-sm text-slate-500">{new Date(trip.scheduledAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/trips/${trip.id}`}>
                    <Button variant="outline">Open trip</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button variant="outline" onClick={refreshTrips} className="w-fit">
        Refresh from database
      </Button>
    </div>
  );
}

