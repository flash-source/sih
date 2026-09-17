import { fetchRiskDistribution, fetchRiskBySector } from "@/lib/api";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/Reveal";
import { AnimatedNumber } from "@/components/AnimatedNo";
import { RiskBandBadge, RISK_BAND_META, type RiskBand } from "@/components/StatusBadge";
import { IconAlertTriangle, IconGauge } from "@/components/Icons";

const BAND_ORDER: RiskBand[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const MIN_SECTOR_SIZE = 3;

export default async function RiskPage() {
  let distribution: Record<string, number> = {};
  let bySector: Record<string, Record<string, number>> = {};
  let reachable = true;
  try {
    [distribution, bySector] = await Promise.all([fetchRiskDistribution(), fetchRiskBySector()]);
  } catch {
    reachable = false;
  }

  if (!reachable) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <IconAlertTriangle className="mx-auto h-10 w-10 text-signal-amber" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Can&apos;t reach the backend</h1>
        <p className="mt-2 text-ink-soft">
          Risk signals come from the FastAPI service at{" "}
          <code className="rounded bg-navy-50 px-1.5 py-0.5 font-mono text-sm">/api/v1</code>. Confirm
          it&apos;s running, then reload.
        </p>
      </div>
    );
  }

  const totalScored = BAND_ORDER.reduce((sum, band) => sum + (distribution[band] ?? 0), 0) || 1;

  const sectorRows = Object.entries(bySector)
    .map(([sector, counts]) => ({
      sector,
      counts,
      total: Object.values(counts).reduce((a, b) => a + b, 0),
      criticalPlusHigh: (counts.CRITICAL ?? 0) + (counts.HIGH ?? 0),
    }))
    .filter((s) => s.total >= MIN_SECTOR_SIZE)
    .sort((a, b) => b.criticalPlusHigh / b.total - a.criticalPlusHigh / a.total)
    .slice(0, 10);

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
      <Reveal>
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">Risk Signals</span>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Where risk sits today</h1>
        <p className="mt-2 max-w-2xl text-ink-soft">
          Every scored project gets a blended delay + cost risk score, banded LOW to CRITICAL. See{" "}
          <code className="rounded bg-navy-50 px-1.5 py-0.5 font-mono text-xs">services/risk_engine.py</code>{" "}
          for exactly how each score is built — every number traces back to a specific field on the
          project, not a black box.
        </p>
      </Reveal>

      <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BAND_ORDER.map((band) => {
          const meta = RISK_BAND_META[band];
          const count = distribution[band] ?? 0;
          return (
            <StaggerItem key={band}>
              <div className="rounded-xl border border-line bg-surface p-6 shadow-card">
                <IconGauge className={`h-6 w-6 ${meta.text}`} />
                <p className="mt-3 text-sm font-medium text-ink-soft">{meta.label}</p>
                <p className={`tabular mt-1 font-display text-3xl font-semibold ${meta.text}`}>
                  <AnimatedNumber value={count} />
                </p>
                <p className="tabular mt-0.5 text-xs text-ink-faint">
                  {((count / totalScored) * 100).toFixed(1)}% of scored projects
                </p>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerGroup>

      <Reveal delay={0.05} className="rounded-xl border border-line bg-surface p-6 shadow-card">
        <h3 className="font-display text-lg font-semibold text-ink">Risk distribution by sector</h3>
        <p className="mt-1 text-sm text-ink-faint">
          Share of each sector&apos;s scored projects in CRITICAL or HIGH. Sectors with fewer than{" "}
          {MIN_SECTOR_SIZE} scored projects are left out to avoid noisy single-project rates.
        </p>
        <div className="mt-6 flex flex-col gap-4">
          {sectorRows.length === 0 && (
            <p className="py-4 text-center text-sm text-ink-faint">Not enough scored projects yet.</p>
          )}
          {sectorRows.map((row) => (
            <div key={row.sector}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate font-medium text-ink" title={row.sector}>
                  {row.sector}
                </span>
                <span className="tabular flex-shrink-0 text-ink-faint">{row.total} scored</span>
              </div>
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-line">
                {BAND_ORDER.map((band) => {
                  const count = row.counts[band] ?? 0;
                  const pct = (count / row.total) * 100;
                  if (pct <= 0) return null;
                  return (
                    <div
                      key={band}
                      style={{ width: `${pct}%` }}
                      title={`${RISK_BAND_META[band].label}: ${count}`}
                      className={
                        band === "CRITICAL"
                          ? "bg-signal-red"
                          : band === "HIGH"
                            ? "bg-signal-red/60"
                            : band === "MEDIUM"
                              ? "bg-signal-amber"
                              : "bg-signal-green"
                      }
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-4 border-t border-line pt-4">
          {BAND_ORDER.map((band) => (
            <div key={band} className="flex items-center gap-1.5 text-xs text-ink-soft">
              <RiskBandBadge band={band} />
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}