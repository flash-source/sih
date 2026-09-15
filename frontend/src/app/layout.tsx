import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Nirman Drishti - Next-Gen Project Infrastructure Insights",
  description: "Predictive Monitoring for High-Value Central Sector Infrastructure Projects",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Navbar />
        <main className="pt-16 min-h-screen">
          {children}
        </main>
        <footer className="bg-slate-900 text-white py-8 mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-400">© 2026 Nirman Drishti. Government of India Initiative.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}