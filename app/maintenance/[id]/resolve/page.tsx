import React from "react";
import Link from "next/link";
import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";
import { Badge } from "../../../../components/ui/badge";
import { MOCK_VEHICLES, MOCK_MAINTENANCE_LOGS } from "../../../../lib/db-seed-helper";
import { ResolveForm } from "./resolve-form";

export default async function ResolveMaintenancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let log: any = null;
  let organizationName = "TransitOps Logistics (Mock)";
  let isDbReady = !!process.env.DATABASE_URL;

  if (isDbReady && prisma) {
    try {
      const session = await auth();
      let organizationId: string | null = null;

      if (session?.user?.email) {
        const userObj = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { organizationId: true, organization: { select: { name: true } } },
        });
        if (userObj) {
          organizationId = userObj.organizationId;
          organizationName = userObj.organization.name;
        }
      }

      if (!organizationId) {
        const firstOrg = await prisma.organization.findFirst({
          select: { id: true, name: true },
        });
        if (firstOrg) {
          organizationId = firstOrg.id;
          organizationName = firstOrg.name;
        }
      }

      if (organizationId) {
        log = await prisma.maintenanceLog.findFirst({
          where: { id, organizationId },
          include: { vehicle: true },
        });
      }
    } catch (e) {
      console.error("Database connection failed. Using mock fallback list.", e);
      isDbReady = false;
    }
  }

  // Fallback to mock data if DB is not available or if log wasn't found in DB
  if (!isDbReady || !log) {
    const mockLog = MOCK_MAINTENANCE_LOGS.find((l) => l.id === id);
    if (mockLog) {
      // Create a shallow copy to prevent reference errors, and link the vehicle
      log = {
        ...mockLog,
        vehicle: mockLog.vehicle || MOCK_VEHICLES.find((v) => v.id === mockLog.vehicleId),
      };
    }
  }

  if (!log) {
    return (
      <main className="relative min-h-screen bg-slate-50 text-slate-900 pb-20">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-900" />
        <div className="mx-auto max-w-md px-6 mt-24 text-center space-y-4 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-950">Record Not Found</h2>
          <p className="text-sm text-slate-500">The maintenance record you are trying to resolve could not be found.</p>
          <Link
            href="/maintenance"
            className="inline-flex h-10 px-4 items-center justify-center rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 text-sm shadow-sm transition-colors"
          >
            Back to Maintenance Hub
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top bar accent */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-900" />

      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-lg hover:bg-slate-800 transition-colors">
              T
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-slate-950">Resolve Maintenance</h1>
                <Badge variant="outline" className="text-[10px] font-normal px-2 py-0.5">
                  {organizationName}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium">Fleet Operations Management</p>
            </div>
          </div>
          <div>
            <Link
              href="/maintenance"
              className="inline-flex items-center justify-center h-9 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium text-xs hover:bg-slate-50 transition-colors"
            >
              Back to List
            </Link>
          </div>
        </div>
      </header>

      {/* Form Container */}
      <div className="mx-auto max-w-6xl px-6 mt-12">
        <ResolveForm log={log} />
      </div>
    </main>
  );
}
