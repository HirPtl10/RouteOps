import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TransitOps",
  description: "A clean fleet operations preview for the hackathon build.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, rgba(56, 189, 248, 0.08), transparent 28%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
          color: "#0f172a",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
