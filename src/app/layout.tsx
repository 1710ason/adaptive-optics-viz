import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import SilentTracker from "@/components/SilentTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adaptive Optics Viz",
  description: "Interactive visualization of Adaptive Optics in FSO Communication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white">
        {children}
        <SilentTracker />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
