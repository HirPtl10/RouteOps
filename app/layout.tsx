import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RouteOps – Fleet Management",
  description: "Simple and powerful fleet management for drivers and managers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ fontFamily: "'Inter', Arial, Helvetica, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
