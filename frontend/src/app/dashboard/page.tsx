import type { ComponentType, SVGProps } from "react";
import { fetchDashboardSummary, fetchProjects, FULL_PORTFOLIO_LIMIT } from "@/lib/api";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { AnimatedNumber } from "@/components/AnimatedNo";
import { AnimatedBar } from "@/components/AnimatedBar";
import { DashboardBreakdown } from "@/components/Dashboard";
import { PROJECT_STATUS_META, RiskBandBadge, type ProjectStatus } from "@/components/StatusBadge";
import { IconAlertTriangle, IconRupee, IconLayers, IconGauge } from "@/components/Icons";

const STATUS_ORDER: ProjectStatus[] = ["IN_PROGRESS", "DELAYED", "PLANNING", "COMPLETED"];

export default async function DashboardPage() {
  let summary: Awaited<ReturnType<typeof fetchDashboardSummary>> | null = null;
  let projects: Awaited<ReturnType<typeof fetchProjects>> = [];
  let reachable = true;
  try {
    [summary, projects] = await Promise.all([
      fetchDashboardSummary(),
      fetchProjects({ limit: FULL_PORTFOLIO_LIMIT }),
    ]);
  } catch {
    reachable = false;
  }

  if (!reachable || !summary) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <IconAlertTriangle className="mx-auto h-10 w-10 text-signal-amber" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Can&apos;t reach the backend</h1>
        <p className="mt-2 text-ink-soft">
          The dashboard reads from the FastAPI service at{" "}
          <code className="rounded bg-navy-50 px-1.5 py-0.5 font-mono text-sm">/api/v1</code>. Confirm
          it&apos;s running (see <code className="font-mono">backend/README.md</code>), then reload.
        </p>
      </div>
    );
  }

  const totalForBars =
    Object.values(summary.projects_by_status).reduce((a, b) => a + b, 0) || summary.total_projects || 1;

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">Dashboard</span>
            <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Portfolio overview</h1>
          </div>
          <p className="text-sm text-ink-faint">
            {summary.total_projects.toLocaleString("en-IN")} projects loaded
          </p>
        </div>
      </Reveal>

      <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <StatCard icon={IconLayers} label="Total projects" value={summary.total_projects} />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={IconRupee}
            label="Combined sanctioned cost"
            value={summary.total_cost}
            prefix="₹"
            suffix=" Cr"
            tone="text-signal-green"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={IconAlertTriangle}
            label="Delayed projects"
            value={summary.projects_by_status.DELAYED ?? 0}
            tone="text-signal-red"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={IconGauge}
            label="Average risk score"
            value={summary.avg_risk_score}
            suffix=" / 100"
            decimals={1}
            tone="text-brand-blue"
          />
        </StaggerItem>
      </StaggerGroup>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Reveal className="rounded-xl border border-line bg-surface p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold text-ink">Projects by status</h3>
          <div className="mt-6 flex flex-col gap-4">
            {STATUS_ORDER.map((status) => {
              const count = summary.projects_by_status[status] ?? 0;
              const meta = PROJECT_STATUS_META[status];
              return (
                <div key={status}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-ink">{meta.label}</span>
                    <span className="tabular text-ink-faint">{count.toLocaleString("en-IN")}</span>
                  </div>
                  <AnimatedBar pct={(count / totalForBars) * 100} fillClassName={meta.bar} />
                </div>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={0.05} className="rounded-xl border border-line bg-surface p-6 shadow-card">
          <h3 className="font-display text-lg font-semibold text-ink">Needs attention</h3>
          <p className="mt-1 text-sm text-ink-faint">Projects scored CRITICAL, ranked by risk score.</p>
          <div className="mt-5 flex flex-col">
            {summary.critical_projects.length === 0 && (
              <p className="py-6 text-center text-sm text-ink-faint">No CRITICAL-band projects right now.</p>
            )}
            {summary.critical_projects.slice(0, 6).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-none"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                  <p className="truncate text-xs text-ink-faint">
                    {p.ministry} · {p.state}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <span className="tabular text-sm font-medium text-ink-soft">
                    ₹{Number(p.total_cost).toLocaleString("en-IN")} Cr
                  </span>
                  {p.risk_band && <RiskBandBadge band={p.risk_band} />}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <DashboardBreakdown projects={projects} />
      </Reveal>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  prefix = "",
  suffix = "",
  tone = "text-ink",
  decimals = 0,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  tone?: string;
  decimals?: number;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
      <div className="flex items-center gap-2 text-ink-faint">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className={`tabular mt-3 font-display text-2xl font-semibold ${tone}`}>
        {prefix}
        <AnimatedNumber value={value} decimals={decimals} />
        {suffix}
      </p>
    </div>
  );
}