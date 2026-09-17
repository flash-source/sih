import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconLayers(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3 3 8.5 12 14l9-5.5L12 3Z" />
      <path d="m3 13 9 5.5 9-5.5" />
    </svg>
  );
}

export function IconTrendUp(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 16 10 10l4 4 6-7" />
      <path d="M15 7h5v5" />
    </svg>
  );
}

export function IconAlertTriangle(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4 2.5 20h19L12 4Z" />
      <path d="M12 10v4.5" />
      <circle cx="12" cy="17.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconCheckCircle(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 5-5.5" />
    </svg>
  );
}

export function IconClock(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.5 2" />
    </svg>
  );
}

export function IconRupee(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 4.5h12" />
      <path d="M6 9h12" />
      <path d="M6 4.5c5.5 0 9 1.2 9 4.5S11.5 13.5 6 13.5" />
      <path d="M6 13.5 15 20" />
    </svg>
  );
}

export function IconMapPin(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21.5c4.5-4.6 7-8.4 7-11.5a7 7 0 1 0-14 0c0 3.1 2.5 6.9 7 11.5Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}

export function IconBuilding(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4.5" y="3.5" width="10" height="17" rx="0.5" />
      <path d="M14.5 9.5h5v11h-5" />
      <path d="M7.5 7h1M11 7h1M7.5 10.5h1M11 10.5h1M7.5 14h1M11 14h1" />
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.8-4.8" />
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m5 5 14 14M19 5 5 19" />
    </svg>
  );
}

export function IconArrowUpRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

export function IconGauge(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 15a8 8 0 1 1 16 0" />
      <path d="M12 15 15.5 9" />
      <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}