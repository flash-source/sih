import { fetchBacktest } from "@/lib/api";
import { Reveal } from "@/components/Reveal";
import { IconAlertTriangle } from "@/components/Icons";
import { BacktestCharts } from "./backtest-charts";
import type { BacktestReport } from "@/lib/types";

export const metadata = { title: "Model backtest — Nirman Drishti" };

export default async function ModelPage() {
  let report: BacktestReport | null = null;
  let reachable = true;
  try {
    report = await fetchBacktest();
  } catch {
    reachable = false;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal>
        <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">Prediction lab</span>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Model backtest</h1>
        <p className="mt-2 max-w-3xl text-ink-soft">
          We trained a logistic regression model on the previous Flash Report cycle, predicted risk for
          the current cycle, and compared those predictions against what actually happened. This page
          is the receipts: predicted vs actual, band by band.
        </p>
      </Reveal>

      {!reachable || !report ? (
        <div className="mt-8 rounded-xl border border-line bg-surface px-4 py-16 text-center">
          <IconAlertTriangle className="mx-auto h-8 w-8 text-signal-amber" />
          <h2 className="mt-3 font-display text-lg font-semibold text-ink">No backtest report yet</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">
            Run <code className="rounded bg-navy-50 px-1.5 py-0.5 font-mono text-xs">ml/notebooks/backtest.ipynb</code>{" "}
            with two monthly snapshots of the Flash Report data. It writes{" "}
            <code className="rounded bg-navy-50 px-1.5 py-0.5 font-mono text-xs">ml/models/backtest_metrics.json</code>,
            which this page reads via{" "}
            <code className="rounded bg-navy-50 px-1.5 py-0.5 font-mono text-xs">GET /api/v1/model/backtest</code>.
          </p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          <Reveal>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <StatCard label="Accuracy" value={report.accuracy} good />
              <StatCard label="ROC AUC" value={report.roc_auc} good />
              <StatCard label="Precision" value={report.precision} />
              <StatCard label="Recall" value={report.recall} />
              <StatCard label="F1 score" value={report.f1} />
            </div>
            <p className="mt-2 text-xs text-ink-faint">
              {report.model} · trained on {report.train_snapshot} ({report.n_train.toLocaleString("en-IN")} projects) ·
              tested on {report.test_snapshot} ({report.n_test.toLocaleString("en-IN")} projects) · decision
              threshold {report.threshold.toFixed(2)}
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <BacktestCharts report={report} />
          </Reveal>

          <Reveal delay={0.08}>
            <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
              <h2 className="font-display text-lg font-semibold text-ink">Confusion matrix</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-md">
                <Cell label="Predicted delay · actually delayed" value={report.confusion.tp} tone="red" />
                <Cell label="Predicted delay · actually on track" value={report.confusion.fp} tone="amber" />
                <Cell label="Predicted on track · actually delayed" value={report.confusion.fn} tone="amber" />
                <Cell label="Predicted on track · actually on track" value={report.confusion.tn} tone="green" />
              </div>
              <p className="mt-4 text-sm text-ink-soft">{report.notes}</p>
            </div>
          </Reveal>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, good }: { label: string; value: number; good?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-4 shadow-card">
      <p className="text-xs text-ink-faint">{label}</p>
      <p
        className={`tabular mt-1 font-display text-2xl font-semibold ${
          good ? "text-navy-500" : "text-ink"
        }`}
      >
        {(value * 100).toFixed(1)}%
      </p>
    </div>
  );
}

function Cell({ label, value, tone }: { label: string; value: number; tone: "red" | "amber" | "green" }) {
  const tones = {
    red: "border-signal-red/30 bg-signal-redSoft",
    amber: "border-signal-amber/30 bg-signal-amberSoft",
    green: "border-signal-green/30 bg-signal-greenSoft",
  } as const;
  return (
    <div className={`rounded-lg border px-4 py-3 ${tones[tone]}`}>
      <p className="tabular font-display text-2xl font-semibold text-ink">{value.toLocaleString("en-IN")}</p>
      <p className="mt-1 text-xs text-ink-soft">{label}</p>
    </div>
  );
}
