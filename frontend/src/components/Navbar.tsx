"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconClose, IconMenu } from "./Icons";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/risk", label: "Risk Signals" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <nav
      className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? "border-line bg-surface/90 shadow-[0_1px_0_rgba(16,26,51,0.04)] backdrop-blur-md"
          : "border-transparent bg-surface/70 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Parallax" className="h-9 w-9 rounded-full object-contain" />
          <span className="flex flex-col leading-none">
            <span className="text-[10.5px] font-medium uppercase tracking-wider text-ink-faint">
              Central Sector Projects
            </span>
            <span className="font-display text-lg font-semibold text-ink">Nirman Drishti</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                  active ? "text-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-md bg-navy-50"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex">
          <Link
            href="/projects"
            className="rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-blue"
          >
            Explore projects
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-md text-ink md:hidden"
        >
          {open ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-line bg-surface md:hidden"
          >
            <div className="flex flex-col gap-0.5 px-4 py-3">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-2.5 text-sm font-medium ${
                    pathname === link.href ? "bg-navy-50 text-ink" : "text-ink-soft"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/projects"
                className="mt-2 rounded-md bg-navy-900 px-3 py-2.5 text-center text-sm font-medium text-white"
              >
                Explore projects
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}