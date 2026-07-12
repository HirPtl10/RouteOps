import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDynamicAlerts, AlertItem } from "@/lib/alerts";

const mockAlerts: AlertItem[] = [
  {
    id: "a1",
    type: "MAINTENANCE",
    title: "Scheduled Maintenance Overdue",
    description: "TRK-014 is 1,200 km past its scheduled 50,000 km general engine service.",
    relatedTo: "Vehicle: TRK-014",
    timestamp: "2 hours ago",
    severity: "HIGH",
    status: "ACTIVE",
    details: "Scheduled servicing includes oil filter replacement, belt inspection, fuel injector cleaning, and brake fluid assessment. Delaying may void the vehicle's extended warranty."
  },
  {
    id: "a2",
    type: "BREAKDOWN",
    title: "Engine Overheating / Breakdown",
    description: "Coolant temperature exceeded 115°C. Vehicle stopped on National Highway 4.",
    relatedTo: "Vehicle: VAN-008",
    timestamp: "35 minutes ago",
    severity: "CRITICAL",
    status: "ACTIVE",
    details: "Telematics reported diagnostic trouble code P0217. Roadside assistance has been auto-dispatched to KM marker 142 on Highway 4. Driver status reported safe."
  },
  {
    id: "a3",
    type: "DOCUMENT",
    title: "Driver's License Expiring Soon",
    description: "John Doe's commercial driver's license (CDL Class A) expires in 5 days.",
    relatedTo: "Driver: John Doe",
    timestamp: "1 day ago",
    severity: "MEDIUM",
    status: "ACTIVE",
    details: "Commercial drivers with expired licenses are legally barred from dispatch. Renewal confirmation must be uploaded to the safety portal before 2026-07-17."
  },
  {
    id: "a4",
    type: "DRIVER",
    title: "Harsh Braking Event Detected",
    description: "Telematics detected 3 consecutive harsh deceleration events (> 10m/s²).",
    relatedTo: "Driver: Robert Chen",
    timestamp: "4 hours ago",
    severity: "LOW",
    status: "ACKNOWLEDGED",
    details: "Events occurred during bad weather conditions on Sector-19 city route. Driver acknowledged the alert, noting sudden pedestrian crossing interference."
  },
  {
    id: "a5",
    type: "MAINTENANCE",
    title: "Tire Pressure Warning",
    description: "Rear-left tire pressure at 28 PSI (recommended 36 PSI).",
    relatedTo: "Vehicle: TRK-021",
    timestamp: "3 days ago",
    severity: "LOW",
    status: "RESOLVED",
    details: "Service log: Tire inspected for leaks at depot workshop. Pressure refilled to 36 PSI. Sensor calibrated and cleared."
  },
  {
    id: "a6",
    type: "DOCUMENT",
    title: "Insurance Certificate Expired",
    description: "Annual comprehensive fleet insurance policy expired on 2026-07-10.",
    relatedTo: "Vehicle: TRK-015",
    timestamp: "2 days ago",
    severity: "CRITICAL",
    status: "ACTIVE",
    details: "The vehicle was automatically set to unavailable. Operating vehicles with expired certificates violates state laws and compromises corporate liability policy guidelines."
  },
  {
    id: "a7",
    type: "DRIVER",
    title: "Speed Limit Violation",
    description: "Speed limit exceeded by 24 km/h in a school zone (84 km/h in 60 km/h zone).",
    relatedTo: "Driver: Sarah Jenkins",
    timestamp: "5 hours ago",
    severity: "HIGH",
    status: "ACTIVE",
    details: "Captured on Route 102. System flagged safety score reduction. Safety officer review required according to corporate safety guidelines."
  },
  {
    id: "a8",
    type: "OTHER",
    title: "Unscheduled Stop Detected",
    description: "Vehicle remained stationary at an unauthorized waypoint for over 45 minutes.",
    relatedTo: "Vehicle: TRK-009",
    timestamp: "6 hours ago",
    severity: "MEDIUM",
    status: "RESOLVED",
    details: "Stationary status due to minor traffic detour congestion and rest stop alignment. Dispatch team cleared the log entry manually."
  }
];

export async function GET() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return NextResponse.json({ source: "mock", alerts: mockAlerts });
  }

  try {
    const alerts = await getDynamicAlerts(organizationId);
    return NextResponse.json({ source: "database", alerts });
  } catch (error) {
    return NextResponse.json({ error: "Unable to retrieve dynamic alerts." }, { status: 500 });
  }
}
