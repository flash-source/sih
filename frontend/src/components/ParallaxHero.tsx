"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function ParallaxHero({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const yBack = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const yMid = useTransform(scrollYProgress, [0, 1], [0, 170]);
  const yFront = useTransform(scrollYProgress, [0, 1], [0, 280]);
  const contentFade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <div ref={ref} className="relative isolate overflow-hidden bg-navy-900">
      <div className="absolute inset-0 bg-grid-faint bg-[length:44px_44px] opacity-[0.05]" />
      <div className="pointer-events-none absolute -top-56 left-1/2 h-[620px] w-[980px] -translate-x-1/2 rounded-full bg-brand-blue/20 blur-[140px]" />

      <svg
        viewBox="0 0 1200 640"
        preserveAspectRatio="xMidYMax slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <motion.polygon
          style={{ y: yBack }}
          points="120,120 430,120 360,560 30,560"
          fill="#8FB8F2"
          opacity="0.14"
        />
        <motion.polygon
          style={{ y: yMid }}
          points="330,170 640,170 580,600 260,600"
          fill="#3E6FD9"
          opacity="0.22"
        />
        <motion.polygon
          style={{ y: yFront }}
          points="560,230 860,230 830,640 480,640"
          fill="#16244C"
          opacity="0.85"
        />
        <motion.g style={{ y: yFront }}>
          <path d="M560 640 730 340 830 460 900 640Z" fill="#0E1B3D" />
          <circle cx="792" cy="300" r="20" fill="#8FB8F2" opacity="0.9" />
        </motion.g>
      </svg>

      <motion.div style={{ opacity: contentFade, y: contentY }} className="relative z-10">
        {children}
      </motion.div>
    </div>
  );
}