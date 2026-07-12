import { prisma } from "./prisma";
import { DriverStatus, VehicleStatus } from "@prisma/client";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AlertType = "MAINTENANCE" | "BREAKDOWN" | "DOCUMENT" | "DRIVER" | "OTHER";
export type AlertStatus = "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";

export interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  relatedTo: string;
  timestamp: string;
  severity: Severity;
  status: AlertStatus;
  details?: string;
  entityId?: string; // Driver ID or Vehicle ID or MaintenanceLog ID
}

export async function getDynamicAlerts(organizationId: string): Promise<AlertItem[]> {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [drivers, vehicles, openLogs] = await Promise.all([
    // Fetch drivers
    prisma.driver.findMany({
      where: { organizationId },
    }),
    // Fetch vehicles
    prisma.vehicle.findMany({
      where: { organizationId },
    }),
    // Fetch open maintenance logs
    prisma.maintenanceLog.findMany({
      where: { organizationId, closedAt: null },
      include: { vehicle: true },
    }),
  ]);

  const alerts: AlertItem[] = [];

  // 1. Maintenance Logs (Active/Open)
  for (const log of openLogs) {
    alerts.push({
      id: `alert-maintenance-${log.id}`,
      type: "MAINTENANCE",
      title: "Active Maintenance Log",
      description: `Vehicle ${log.vehicle.code} has an open maintenance log: "${log.description}".`,
      relatedTo: `Vehicle: ${log.vehicle.code}`,
      timestamp: formatRelativeTime(log.openedAt),
      severity: "HIGH",
      status: "ACTIVE",
      details: log.notes || "No additional notes provided.",
      entityId: log.id,
    });
  }

  // 2. Vehicles status IN_SHOP but not covered by maintenance logs (Breakdowns / Shop issues)
  const loggedVehicleIds = new Set(openLogs.map(l => l.vehicleId));
  for (const vehicle of vehicles) {
    if (vehicle.status === VehicleStatus.IN_SHOP && !loggedVehicleIds.has(vehicle.id)) {
      alerts.push({
        id: `alert-breakdown-${vehicle.id}`,
        type: "BREAKDOWN",
        title: "Unscheduled Breakdown / Shop Stay",
        description: `Vehicle ${vehicle.code} is marked IN_SHOP but has no active maintenance log.`,
        relatedTo: `Vehicle: ${vehicle.code}`,
        timestamp: formatRelativeTime(vehicle.updatedAt),
        severity: "CRITICAL",
        status: "ACTIVE",
        details: "The vehicle was transitioned to IN_SHOP status. An active maintenance log should be created to track diagnostic and repair costs.",
        entityId: vehicle.id,
      });
    } else if (vehicle.status === VehicleStatus.RETIRED) {
      alerts.push({
        id: `alert-retired-${vehicle.id}`,
        type: "OTHER",
        title: "Vehicle Retired",
        description: `Vehicle ${vehicle.code} is marked as retired.`,
        relatedTo: `Vehicle: ${vehicle.code}`,
        timestamp: formatRelativeTime(vehicle.updatedAt),
        severity: "LOW",
        status: "RESOLVED",
        details: "This vehicle is no longer in active duty.",
        entityId: vehicle.id,
      });
    }
  }

  // 3. Drivers Expired/Expired soon documents
  for (const driver of drivers) {
    if (driver.status === DriverStatus.SUSPENDED) {
      alerts.push({
        id: `alert-suspended-${driver.id}`,
        type: "DRIVER",
        title: "Driver Account Suspended",
        description: `Driver ${driver.firstName} ${driver.lastName} is suspended.`,
        relatedTo: `Driver: ${driver.firstName} ${driver.lastName}`,
        timestamp: formatRelativeTime(driver.updatedAt),
        severity: "CRITICAL",
        status: "ACTIVE",
        details: "Safety department action required. Dispatching suspended drivers is prohibited by safety guidelines.",
        entityId: driver.id,
      });
    }

    if (driver.licenseExpiresAt) {
      const expiresAt = new Date(driver.licenseExpiresAt);
      if (expiresAt < now) {
        alerts.push({
          id: `alert-license-expired-${driver.id}`,
          type: "DOCUMENT",
          title: "Driver License Expired",
          description: `License of ${driver.firstName} ${driver.lastName} has expired.`,
          relatedTo: `Driver: ${driver.firstName} ${driver.lastName}`,
          timestamp: formatRelativeTime(expiresAt),
          severity: "CRITICAL",
          status: "ACTIVE",
          details: `The license expired on ${expiresAt.toLocaleDateString()}. Please update driver's document record.`,
          entityId: driver.id,
        });
      } else if (expiresAt < thirtyDaysFromNow) {
        const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        alerts.push({
          id: `alert-license-soon-${driver.id}`,
          type: "DOCUMENT",
          title: "Driver License Expiring Soon",
          description: `License of ${driver.firstName} ${driver.lastName} expires in ${daysLeft} days.`,
          relatedTo: `Driver: ${driver.firstName} ${driver.lastName}`,
          timestamp: "Expires " + expiresAt.toLocaleDateString(),
          severity: "MEDIUM",
          status: "ACTIVE",
          details: `Renew document updates before expiration on ${expiresAt.toLocaleDateString()}.`,
          entityId: driver.id,
        });
      }
    }
  }

  return alerts;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
