import React from "react";
import Link from "next/link";
import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import { Badge } from "../../../components/ui/badge";
import { MaintenanceForm } from "./maintenance-form";
import { MOCK_VEHICLES } from "../../../lib/db-seed-helper";

export default async function NewMaintenancePage() {
  let vehicles: any[] = [];
  let organizationName = "TransitOps Logistics (Mock)";
  let isDbReady = !!process.env.DATABASE_URL;

  if (isDbReady) {
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
        vehicles = await prisma.vehicle.findMany({
          where: { organizationId },
          orderBy: { code: "asc" },
        });
      }
    } catch (e) {
      console.error("Database connection failed. Using mock fallback list.", e);
      isDbReady = false;
    }
  }

  if (!isDbReady || vehicles.length === 0) {
    vehicles = MOCK_VEHICLES;
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
                <h1 className="text-lg font-semibold tracking-tight text-slate-950">Log Maintenance</h1>
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
        <MaintenanceForm vehicles={vehicles} />
      </div>
    </main>
  );
}
