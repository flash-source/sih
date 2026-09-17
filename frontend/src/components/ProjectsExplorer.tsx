"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { IconSearch } from "./Icons";
import { ProjectStatusBadge, RiskBandBadge, PROJECT_STATUS_META, RISK_BAND_META, type ProjectStatus, type RiskBand } from "./StatusBadge";
import type { Project } from "@/lib/types";

const STATUS_FILTERS: Array<ProjectStatus | "ALL"> = ["ALL", "IN_PROGRESS", "DELAYED", "PLANNING", "COMPLETED"];
const RISK_FILTERS: Array<RiskBand | "ALL"> = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];
const PAGE_SIZE = 25;
type SortKey = "name" | "total_cost" | "progress_percent" | "blended_risk_score";

export function ProjectsExplorer({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "ALL">("ALL");
  const [risk, setRisk] = useState<RiskBand | "ALL">("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("total_cost");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = projects;
    if (status !== "ALL") rows = rows.filter((p) => p.status === status);
    if (risk !== "ALL") rows = rows.filter((p) => (p.risk_band ?? "UNKNOWN") === risk);
    if (q) {
      rows = rows.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.ministry?.toLowerCase().includes(q) ||
          p.state?.toLowerCase().includes(q) ||
          p.project_code?.toLowerCase().includes(q)
      );
    }
    return [...rows].sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      const cmp =
        typeof av === "string" || typeof bv === "string"
          ? String(av).localeCompare(String(bv))
          : Number(av) - Number(bv);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [projects, query, status, risk, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(clampedPage * PAGE_SIZE, clampedPage * PAGE_SIZE + PAGE_SIZE);
  const rowsKey = `${status}-${risk}-${query}-${sortKey}-${sortDir}-${clampedPage}`;

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(0);
  }

  function resetPage<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(0);
    };
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => resetPage(setQuery)(e.target.value)}
            placeholder="Search by name, code, ministry, state…"
            className="w-full rounded-md border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink outline-none transition-shadow focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => resetPage(setStatus)(s)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                status === s ? "bg-navy-900 text-white" : "bg-navy-50 text-ink-soft hover:text-ink"
              }`}
            >
              {s === "ALL" ? "All statuses" : PROJECT_STATUS_META[s].label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {RISK_FILTERS.map((r) => (
            <button
              key={r}
              onClick={() => resetPage(setRisk)(r)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                risk === r ? "bg-navy-900 text-white" : "bg-navy-50 text-ink-soft hover:text-ink"
              }`}
            >
              {r === "ALL" ? "All risk bands" : RISK_BAND_META[r].label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-ink-faint">
        {filtered.length.toLocaleString("en-IN")} of {projects.length.toLocaleString("en-IN")} projects
      </p>

      {/* Table, medium screens and up */}
      <div className="mt-4 hidden overflow-hidden rounded-xl border border-line bg-surface shadow-card md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-50/60 text-xs uppercase tracking-wide text-ink-faint">
            <tr>
              <SortableHeader label="Name" active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")} />
              <th className="px-4 py-3 font-medium">Ministry</th>
              <th className="px-4 py-3 font-medium">State</th>
              <SortableHeader
                label="Cost (Cr)"
                active={sortKey === "total_cost"}
                dir={sortDir}
                onClick={() => toggleSort("total_cost")}
                align="right"
              />
              <SortableHeader
                label="Progress"
                active={sortKey === "progress_percent"}
                dir={sortDir}
                onClick={() => toggleSort("progress_percent")}
                align="right"
              />
              <th className="px-4 py-3 font-medium">Status</th>
              <SortableHeader
                label="Risk"
                active={sortKey === "blended_risk_score"}
                dir={sortDir}
                onClick={() => toggleSort("blended_risk_score")}
              />
            </tr>
          </thead>
          <tbody key={rowsKey}>
            {pageRows.map((p, i) => (
              <motion.tr
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i, 12) * 0.02 }}
                className="border-t border-line hover:bg-navy-50/40"
              >
                <td className="px-4 py-3 font-medium text-ink">{p.name}</td>
                <td className="px-4 py-3 text-ink-soft">{p.ministry}</td>
                <td className="px-4 py-3 text-ink-soft">{p.state}</td>
                <td className="tabular px-4 py-3 text-right text-ink-soft">
                  ₹{Number(p.total_cost).toLocaleString("en-IN")}
                </td>
                <td className="tabular px-4 py-3 text-right text-ink-soft">
                  {typeof p.progress_percent === "number" ? `${p.progress_percent.toFixed(0)}%` : "—"}
                </td>
                <td className="px-4 py-3">
                  <ProjectStatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3">
                  {p.risk_band ? <RiskBandBadge band={p.risk_band} /> : <span className="text-xs text-ink-faint">—</span>}
                </td>
              </motion.tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-ink-faint">
                  No projects match that search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards, below medium */}
      <div key={`${rowsKey}-cards`} className="mt-4 flex flex-col gap-3 md:hidden">
        {pageRows.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(i, 12) * 0.02 }}
            className="rounded-xl border border-line bg-surface p-4 shadow-card"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-ink">{p.name}</p>
              <ProjectStatusBadge status={p.status} />
            </div>
            <p className="mt-1 text-xs text-ink-faint">
              {p.ministry} · {p.state}
            </p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="tabular text-ink-soft">₹{Number(p.total_cost).toLocaleString("en-IN")} Cr</span>
              <span className="tabular text-ink-faint">
                {typeof p.progress_percent === "number" ? `${p.progress_percent.toFixed(0)}% complete` : "No progress data"}
              </span>
            </div>
            {p.risk_band && (
              <div className="mt-3">
                <RiskBandBadge band={p.risk_band} />
              </div>
            )}
          </motion.div>
        ))}
        {pageRows.length === 0 && (
          <p className="rounded-xl border border-line bg-surface px-4 py-10 text-center text-sm text-ink-faint">
            No projects match that search.
          </p>
        )}
      </div>

      {pageCount > 1 && (
        <div className="mt-5 flex items-center justify-between text-sm">
          <button
            disabled={clampedPage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded-md border border-line px-3 py-1.5 text-ink-soft transition-colors hover:text-ink disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-ink-faint">
            Page {clampedPage + 1} of {pageCount}
          </span>
          <button
            disabled={clampedPage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            className="rounded-md border border-line px-3 py-1.5 text-ink-soft transition-colors hover:text-ink disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function SortableHeader({
  label,
  active,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <th className={`px-4 py-3 font-medium ${align === "right" ? "text-right" : "text-left"}`}>
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1 ${align === "right" ? "flex-row-reverse" : ""} ${
          active ? "text-ink" : "text-ink-faint hover:text-ink-soft"
        }`}
      >
        {label}
        <span className="w-2.5 text-[10px]">{active ? (dir === "asc" ? "▲" : "▼") : ""}</span>
      </button>
    </th>
  );
}