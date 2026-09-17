export type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "DELAYED" | "COMPLETED";
export type RiskBand = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "UNKNOWN";

export const PROJECT_STATUS_META: Record<
  ProjectStatus,
  { label: string; text: string; bg: string; dot: string; bar: string }
> = {
  PLANNING: { label: "Planning", text: "text-ink-soft", bg: "bg-ink-faint/10", dot: "bg-ink-faint", bar: "bg-ink-faint" },
  IN_PROGRESS: { label: "In progress", text: "text-brand-blue", bg: "bg-navy-50", dot: "bg-brand-blue", bar: "bg-brand-blue" },
  DELAYED: { label: "Delayed", text: "text-signal-red", bg: "bg-signal-redSoft", dot: "bg-signal-red", bar: "bg-signal-red" },
  COMPLETED: { label: "Completed", text: "text-signal-green", bg: "bg-signal-greenSoft", dot: "bg-signal-green", bar: "bg-signal-green" },
};

export const RISK_BAND_META: Record<RiskBand, { label: string; text: string; bg: string; dot: string }> = {
  LOW: { label: "Low", text: "text-signal-green", bg: "bg-signal-greenSoft", dot: "bg-signal-green" },
  MEDIUM: { label: "Medium", text: "text-signal-amber", bg: "bg-signal-amberSoft", dot: "bg-signal-amber" },
  HIGH: { label: "High", text: "text-signal-red", bg: "bg-signal-redSoft", dot: "bg-signal-red" },
  CRITICAL: { label: "Critical", text: "text-white", bg: "bg-signal-red", dot: "bg-white" },
  UNKNOWN: { label: "Not yet scored", text: "text-ink-soft", bg: "bg-ink-faint/10", dot: "bg-ink-faint" },
};

function normalizeStatus(status: string): ProjectStatus {
  return status in PROJECT_STATUS_META ? (status as ProjectStatus) : "PLANNING";
}

export function ProjectStatusBadge({ status }: { status: string }) {
  const meta = PROJECT_STATUS_META[normalizeStatus(status)];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${meta.text} ${meta.bg}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export function RiskBandBadge({ band }: { band: string }) {
  const key = band in RISK_BAND_META ? (band as RiskBand) : "UNKNOWN";
  const meta = RISK_BAND_META[key];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold ${meta.text} ${meta.bg}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}