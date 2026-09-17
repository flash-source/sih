import Link from "next/link";
import { ParallaxHero } from "@/components/ParallaxHero";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { AnimatedNumber } from "@/components/AnimatedNo";
import {IconLayers, IconClock, IconGauge, IconBuilding, IconArrowUpRight} from "@/components/Icons";
import { fetchDashboardSummary } from "@/lib/api";
import type { DashboardSummary } from "@/lib/types";

const FEATURES = [
  {
    icon: IconLayers,
    title: "Live project registry",
    body: "Every Central Sector project sanctioned at ₹150 Cr and above, pulled from MoSPI Flash Reports across ministries and states.",
  },
  {
    icon: IconClock,
    title: "Original vs. revised, every cycle",
    body: "Sanction dates and costs are kept in both their original and revised form, so slippage is measured against what was actually approved.",
  },
  {
    icon: IconGauge,
    title: "Predictive risk scoring",
    body: "Cost- and delay-overrun models trained on historical outcomes, surfaced as a blended risk score per project as the pipeline comes online.",
  },
  {
    icon: IconBuilding,
    title: "Ministry & sector rollups",
    body: "Aggregate views by ministry, sector and state to spot systemic risk clusters, not just one project at a time.",
  },
];

export default async function Home() {
  let stats: DashboardSummary | null = null;
  try {
    stats = await fetchDashboardSummary();
  } catch {
    stats = null;
  }

  return (
    <div>
      <ParallaxHero>
        <div className="mx-auto max-w-4xl px-4 pb-28 pt-28 text-center sm:px-6 md:pt-36 lg:px-8">
          <Reveal y={10}>
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-brand-sky">
              Central Sector Projects · ₹150 Cr and above
            </span>
          </Reveal>
          <Reveal y={14} delay={0.05}>
            <h1 className="mt-6 font-display text-5xl font-semibold text-white md:text-6xl">
              Nirman Drishti
            </h1>
            <p className="mt-3 text-xl font-medium text-brand-sky md:text-2xl">
              See project risk before it becomes a delay.
            </p>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
              Nirman Drishti tracks India&apos;s high-value infrastructure projects against what
              was actually sanctioned — original and revised cost, original and revised
              commissioning dates — and flags the ones drifting off plan early enough to act on.
            </p>
          </Reveal>
          <Reveal y={14} delay={0.1}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-1.5 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 transition-transform hover:-translate-y-0.5"
              >
                Open the dashboard
                <IconArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/projects"
                className="rounded-md border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Browse all projects
              </Link>
            </div>
          </Reveal>
        </div>
      </ParallaxHero>

      <div className="relative z-10 mx-auto -mt-14 max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid grid-cols-1 divide-y divide-line rounded-xl border border-line bg-surface shadow-lift sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <StatTile label="Projects tracked" value={stats?.total_projects} />
            <StatTile label="Combined sanctioned cost" value={stats?.total_cost} prefix="₹" suffix=" Cr" />
            <StatTile label="Flagged delayed" value={stats?.projects_by_status.DELAYED ?? (stats ? 0 : undefined)} />
          </div>
        </Reveal>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
              How it works
            </span>
            <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
              Built around what&apos;s sanctioned, not what&apos;s assumed.
            </h2>
            <p className="mt-4 text-ink-soft">
              Every Flash Report cycle re-states each project&apos;s original and revised numbers.
              Nirman Drishti keeps both, so a schedule slip is measured against the government&apos;s
              own record.
            </p>
          </Reveal>

          <StaggerGroup className="flex flex-col">
            {FEATURES.map((f) => (
              <StaggerItem key={f.title}>
                <div className="flex gap-4 border-b border-line py-6 last:border-none">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-navy-50 text-brand-blue">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-ink">{f.title}</h3>
                    <p className="mt-1 text-sm text-ink-soft">{f.body}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>
    </div>
  );
}

function StatTile({
  label,
  value,
  prefix = "",
  suffix = "",
}: {
  label: string;
  value: number | null | undefined;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="px-6 py-6 text-center sm:text-left">
      <p className="text-sm text-ink-faint">{label}</p>
      {typeof value === "number" ? (
        <p className="tabular mt-1 font-display text-3xl font-semibold text-ink">
          {prefix}
          <AnimatedNumber value={value} />
          {suffix}
        </p>
      ) : (
        <p className="mt-1 text-3xl font-semibold text-ink-faint">—</p>
      )}
    </div>
  );
}