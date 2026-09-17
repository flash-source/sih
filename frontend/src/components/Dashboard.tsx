"use client";

import { useMemo, useState } from "react";
import { AnimatedBar } from "./AnimatedBar";
import type { Project } from "@/lib/types";

type GroupBy = "ministry" | "sector";

function formatCr(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")} Cr`;
}

export function DashboardBreakdown({ projects }: { projects: Project[] }) {
  const [groupBy, setGroupBy] = useState<GroupBy>("ministry");

  const groups = useMemo(() => {
    const map = new Map<string, { count: number; cost: number }>();
    for (const p of projects) {
      const key = (groupBy === "ministry" ? p.ministry : p.sector) || "Unspecified";
      const entry = map.get(key) ?? { count: 0, cost: 0 };
      entry.count += 1;
      entry.cost += Number(p.total_cost) || 0;
      map.set(key, entry);
    }
    return Array.from(map.entries())
      .map(([label, v]) => ({ label, ...v }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 7);
  }, [projects, groupBy]);

  const max = groups[0]?.cost || 1;

  return (
    <div className="rounded-xl border border-line bg-surface p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-ink">
          Portfolio by {groupBy === "ministry" ? "ministry" : "sector"}
        </h3>
        <div className="flex rounded-md border border-line p-0.5 text-xs font-medium">
          {(["ministry", "sector"] as GroupBy[]).map((g) => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className={`rounded px-3 py-1.5 transition-colors ${
                groupBy === g ? "bg-navy-900 text-white" : "text-ink-soft hover:text-ink"
              }`}
            >
              {g === "ministry" ? "Ministry-wise" : "Sector-wise"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {groups.length === 0 && (
          <p className="py-4 text-center text-sm text-ink-faint">No projects to break down yet.</p>
        )}
        {groups.map((g, i) => (
          <div key={g.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-medium text-ink" title={g.label}>
                {g.label}
              </span>
              <span className="tabular flex-shrink-0 text-ink-faint">
                {g.count} · {formatCr(g.cost)}
              </span>
            </div>
            <AnimatedBar pct={(g.cost / max) * 100} delay={i * 0.05} />
          </div>
        ))}
      </div>
    </div>
  );
}