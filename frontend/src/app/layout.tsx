import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { IconLayers } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Nirman Drishti — Infrastructure Project Insights",
  description:
    "Predictive monitoring for high-value Central Sector infrastructure projects (₹150 Cr and above).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper font-sans text-ink antialiased">
        <Navbar />
        <main className="min-h-screen pt-16">{children}</main>
        <footer className="border-t border-line bg-surface">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div className="flex items-center gap-2.5 text-ink-soft">
              <IconLayers className="h-5 w-5 text-brand-blue" />
              <span className="font-display text-base text-ink">Nirman Drishti</span>
              <span className="text-sm">— built by team Parallax for SIH 26103</span>
            </div>
            <p className="text-sm text-ink-faint">
              Tracking Central Sector infrastructure projects sanctioned at ₹150 Cr and above.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}