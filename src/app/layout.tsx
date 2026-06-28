import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IIM Lucknow — Visitor Management System",
  description: "Digital visitor management for IIM Lucknow campus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
