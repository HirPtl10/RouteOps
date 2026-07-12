"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ChevronDown, LogOut, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type SessionUser = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  organizationId?: string | null;
};

type SessionActionsProps = {
  user?: SessionUser | null;
};

const linkButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "2.5rem",
  padding: "0 1rem",
  borderRadius: "0.875rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  textDecoration: "none",
  border: "1px solid #e2e8f0",
};

export function SessionActions({ user }: SessionActionsProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [user]);

  if (!user) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
        <Link href="/login" style={{ ...linkButtonStyle, background: "#fff", color: "#0f172a" }}>
          Log in
        </Link>
        <Link
          href="/signup"
          style={{
            ...linkButtonStyle,
            background: "#0f172a",
            color: "#fff",
            boxShadow: "0 1px 3px rgba(15,23,42,0.12)",
          }}
        >
          Sign up
        </Link>
      </div>
    );
  }

  const displayName = user.name ?? user.email ?? "Profile";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const handleLogout = async () => {
    setOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <Button type="button" variant="outline" onClick={() => setOpen((current) => !current)} style={{ paddingInline: "0.9rem" }}>
        <div
          style={{
            width: "2rem",
            height: "2rem",
            borderRadius: "999px",
            background: "#0f172a",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: "0.75rem",
            fontWeight: 700,
          }}
        >
          {initials || "U"}
        </div>
        <div style={{ display: "grid", textAlign: "left" }}>
          <span style={{ fontSize: "0.85rem", lineHeight: 1, color: "#0f172a" }}>{displayName}</span>
          <span style={{ fontSize: "0.72rem", lineHeight: 1, color: "#64748b" }}>Profile</span>
        </div>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {open ? (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 0.75rem)",
            width: "18rem",
            borderRadius: "1rem",
            border: "1px solid #e2e8f0",
            background: "#fff",
            boxShadow: "0 20px 40px rgba(15, 23, 42, 0.12)",
            padding: "0.9rem",
            zIndex: 30,
            display: "grid",
            gap: "0.9rem",
          }}
        >
          <div style={{ display: "grid", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>{displayName}</p>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>{user.email}</p>
              </div>
              <div
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  borderRadius: "999px",
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <Badge variant="secondary">{user.role ?? "Member"}</Badge>
              {user.organizationId ? <Badge variant="outline">Org linked</Badge> : null}
            </div>
          </div>

          <Button type="button" variant="outline" onClick={handleLogout} style={{ width: "100%" }}>
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      ) : null}
    </div>
  );
}
