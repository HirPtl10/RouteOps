"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Truck, Wrench, Users, ArrowRightLeft, DollarSign, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Vehicles", href: "/vehicles", icon: Truck },
  { label: "Drivers", href: "/drivers", icon: Users },
  { label: "Trips", href: "/trips", icon: ArrowRightLeft },
  { label: "Maintenance", href: "/maintenance", icon: Wrench },
  { label: "Expenses", href: "/expenses", icon: DollarSign },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav style={{ display: "grid", gap: "0.5rem" }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              minHeight: "2.75rem",
              padding: "0 1rem",
              borderRadius: "0.875rem",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "#ffffff" : "#475569",
              background: isActive
                ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                : "transparent",
              boxShadow: isActive ? "0 4px 12px rgba(99, 102, 241, 0.25)" : "none",
              transition: "all 150ms ease",
            }}
            className={cn(
              "group transition-all",
              !isActive && "hover:bg-slate-100/70 hover:text-slate-900"
            )}
          >
            <Icon
              className={cn(
                "h-4.5 w-4.5 transition-colors",
                isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
