"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BacktestReport } from "@/lib/types";

const AXIS = { fontSize: 12, fill: "var(--ink-faint, #96907F)" } as const;

export function BacktestCharts({ report }: { report: BacktestReport }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Predicted vs actual risk bands" subtitle="How many projects the model placed in each band, against where they actually ended up.">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={report.bands} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E2D6" vertical={false} />
              <XAxis dataKey="band" tick={AXIS} axisLine={{ stroke: "#E6E2D6" }} tickLine={false} />
              <YAxis tick={AXIS} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(32,31,27,0.04)" }}
                contentStyle={{ borderRadius: 10, border: "1px solid #E6E2D6", fontSize: 13 }}
              />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Bar name="Predicted" dataKey="predicted" fill="#B4541A" radius={[4, 4, 0, 0]} />
              <Bar name="Actual" dataKey="actual" fill="#3E7C59" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="ROC curve" subtitle="Trade-off between catching delayed projects and false alarms. The diagonal is a coin flip.">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={report.roc} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E2D6" />
              <XAxis
                dataKey="fpr"
                type="number"
                domain={[0, 1]}
                tickCount={6}
                tick={AXIS}
                axisLine={{ stroke: "#E6E2D6" }}
                tickLine={false}
              />
              <YAxis
                dataKey="tpr"
                type="number"
                domain={[0, 1]}
                tickCount={6}
                tick={AXIS}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid #E6E2D6", fontSize: 13 }}
                formatter={(v: number) => v.toFixed(3)}
              />
              <Line data={report.roc.map((p) => ({ ...p, diag: p.fpr }))} dataKey="diag" stroke="#96907F" dot={false} strokeDasharray="4 4" isAnimationActive={false} />
              <Line dataKey="tpr" stroke="#B4541A" dot={false} strokeWidth={2.5} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Accuracy by sector" subtitle="Where the model reads the portfolio well and where it struggles.">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={report.by_sector} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E2D6" horizontal={false} />
              <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`} tick={AXIS} axisLine={{ stroke: "#E6E2D6" }} tickLine={false} />
              <YAxis type="category" dataKey="sector" width={110} tick={{ fontSize: 12, fill: "#57534A" }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(32,31,27,0.04)" }}
                contentStyle={{ borderRadius: 10, border: "1px solid #E6E2D6", fontSize: 13 }}
                formatter={(v: number) => `${(v * 100).toFixed(1)}%`}
              />
              <Bar dataKey="accuracy" fill="#3E7C59" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Predicted delay probability vs outcome" subtitle="Projects the model scored low should be mostly on track — if the bars separate, the score means something.">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={report.prob_bins} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E2D6" vertical={false} />
              <XAxis dataKey="bin" tick={AXIS} axisLine={{ stroke: "#E6E2D6" }} tickLine={false} />
              <YAxis tick={AXIS} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(32,31,27,0.04)" }}
                contentStyle={{ borderRadius: 10, border: "1px solid #E6E2D6", fontSize: 13 }}
              />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Bar name="Actually delayed" dataKey="delayed" stackId="a" fill="#BE4B3B" radius={[0, 0, 0, 0]} />
              <Bar name="Actually on track" dataKey="on_track" stackId="a" fill="#DFE8DC" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-card">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}
