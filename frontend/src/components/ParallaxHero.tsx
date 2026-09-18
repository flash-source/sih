"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function ParallaxHero({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const yBack = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const yMid = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const yFront = useTransform(scrollYProgress, [0, 1], [0, 240]);
  const contentFade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <div ref={ref} className="relative isolate overflow-hidden bg-navy-900">
      <div className="absolute inset-0 bg-grid-faint bg-[length:44px_44px] opacity-[0.06]" />
      <div className="pointer-events-none absolute -top-32 right-[8%] h-[420px] w-[420px] rounded-full bg-brand-blue/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-[4%] h-[380px] w-[560px] rounded-full bg-navy-500/20 blur-[130px]" />

      <svg
        viewBox="0 0 1200 640"
        preserveAspectRatio="xMidYMax slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {/* back layer — rolling terrain + distant town */}
        <motion.g style={{ y: yBack }}>
          <path d="M0 520 Q 180 470 360 505 T 720 495 T 1200 510 V 640 H 0 Z" fill="#275740" opacity="0.45" />
          <g fill="#275740" opacity="0.5">
            <rect x="120" y="470" width="34" height="70" />
            <rect x="162" y="490" width="26" height="50" />
            <rect x="196" y="455" width="30" height="85" />
            <rect x="905" y="480" width="30" height="60" />
            <rect x="943" y="462" width="36" height="78" />
          </g>
        </motion.g>

        {/* mid layer — city skyline + construction cranes */}
        <motion.g style={{ y: yMid }}>
          <g fill="#1F3A2C">
            <rect x="-20" y="430" width="90" height="210" />
            <rect x="82" y="380" width="70" height="260" />
            <rect x="164" y="440" width="54" height="200" />
            <rect x="228" y="350" width="86" height="290" />
            <rect x="326" y="415" width="60" height="225" />
            <rect x="760" y="400" width="76" height="240" />
            <rect x="848" y="360" width="58" height="280" />
            <rect x="918" y="430" width="92" height="210" />
            <rect x="1022" y="390" width="64" height="250" />
            <rect x="1098" y="445" width="110" height="195" />
          </g>
          {/* crane 1 */}
          <g stroke="#A2C1A9" strokeWidth="5" fill="none" opacity="0.85">
            <path d="M520 640 V 330 M 500 640 V 330 M 520 330 H 700 M 520 330 H 430" />
            <path d="M520 330 L 600 285 M 430 330 L 520 285 M 600 285 H 700 M 430 330 L 520 285" strokeWidth="3" />
            <path d="M660 330 V 420" strokeWidth="3" />
          </g>
          <rect x="648" y="420" width="24" height="18" fill="#A2C1A9" opacity="0.85" />
          {/* crane 2, smaller */}
          <g stroke="#3E7C59" strokeWidth="4" fill="none" opacity="0.8">
            <path d="M1120 640 V 420 M 1120 420 H 1200 M 1120 420 H 1055" />
            <path d="M1120 420 L 1160 392 M 1055 420 L 1120 392" strokeWidth="2.5" />
          </g>
        </motion.g>

        {/* front layer — transmission tower + cable-stayed bridge */}
        <motion.g style={{ y: yFront }}>
          <g stroke="#153626" strokeWidth="7" fill="none">
            <path d="M120 640 L 200 300 L 280 640" />
            <path d="M158 470 H 242 M 142 545 H 258 M 176 400 H 224" strokeWidth="5" />
            <path d="M200 300 V 250" strokeWidth="5" />
          </g>
          <g stroke="#0F2A1E" strokeWidth="4" fill="none" opacity="0.9">
            <path d="M640 560 H 1200" />
            <path d="M880 560 V 330" strokeWidth="6" />
            <path d="M700 560 L 880 340 M 780 560 L 880 360 M 980 560 L 880 340 M 1060 560 L 880 360" strokeWidth="2.5" />
          </g>
          <path d="M0 600 Q 300 565 640 592 T 1200 585 V 640 H 0 Z" fill="#0F2A1E" />
        </motion.g>
      </svg>

      <motion.div style={{ opacity: contentFade, y: contentY }} className="relative z-10">
        {children}
      </motion.div>
    </div>
  );
}
