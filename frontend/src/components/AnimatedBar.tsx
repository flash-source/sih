"use client";

import { motion } from "framer-motion";

export function AnimatedBar({
  pct,
  fillClassName = "bg-brand-blue",
  trackClassName = "bg-line",
  delay = 0,
  heightClassName = "h-2",
}: {
  pct: number;
  fillClassName?: string;
  trackClassName?: string;
  delay?: number;
  heightClassName?: string;
}) {
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div className={`w-full overflow-hidden rounded-full ${heightClassName} ${trackClassName}`}>
      <motion.div
        className={`h-full rounded-full ${fillClassName}`}
        initial={{ width: 0 }}
        whileInView={{ width: `${clamped}%` }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      />
    </div>
  );
}