import type { Metadata } from "next";
import "./globals.css";
import AppShell from "./components/AppShell";

export const metadata: Metadata = {
  title: "TransitOps",
  description: "A minimal Next.js and Tailwind foundation for TransitOps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
