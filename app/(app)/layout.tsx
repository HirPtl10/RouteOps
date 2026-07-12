import { auth } from "@/auth";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SessionActions } from "@/components/session-actions";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Drivers", href: "/drivers" },
  { label: "Trips", href: "/trips" },
  { label: "Vehicles", href: "/vehicles" },
  { label: "Maintenance", href: "/maintenance" },
  { label: "Alerts", href: "/alerts" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userMeta = session?.user?.role ?? "Signed out";

  return (
    <div style={{ minHeight: "100vh" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            margin: "0 auto",
            maxWidth: "72rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            padding: "1rem",
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
            <div
              style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "0.875rem",
                background: "#0f172a",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                boxShadow: "0 1px 3px rgba(15,23,42,0.12)",
              }}
            >
              T
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>TransitOps</p>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>Static fleet preview</p>
            </div>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Badge variant="outline">Dashboard preview</Badge>
            <SessionActions
              user={
                session?.user
                  ? {
                      name: session.user.name,
                      email: session.user.email,
                      role: session.user.role,
                      organizationId: session.user.organizationId,
                    }
                  : null
              }
            />
            {session ? <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{userMeta}</span> : null}
          </div>
        </div>
      </header>

      <div
        style={{
          margin: "0 auto",
          maxWidth: "72rem",
          display: "grid",
          gridTemplateColumns: "220px minmax(0, 1fr)",
          gap: "1.5rem",
          padding: "1.5rem 1rem",
        }}
      >
        <aside
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "1.5rem",
            background: "rgba(255,255,255,0.92)",
            padding: "1rem",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
            height: "fit-content",
          }}
        >
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em", color: "#64748b", textTransform: "uppercase" }}>
            Preview areas
          </p>
          <nav style={{ display: "grid", gap: "0.5rem" }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  minHeight: "2.75rem",
                  padding: "0 0.9rem",
                  borderRadius: "0.875rem",
                  color: "#334155",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main style={{ minWidth: 0 }}>{children}</main>
      </div>
    </div>
  );
}
