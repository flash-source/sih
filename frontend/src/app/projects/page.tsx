"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchProjects } from "@/lib/api";
import { Project } from "@/lib/types";

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
  IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
  DELAYED: "bg-red-100 text-red-800 border-red-200",
  PLANNING: "bg-gray-100 text-gray-800 border-gray-200",
};

const RISK_COLOR: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-800 border-red-200",
  HIGH: "bg-orange-100 text-orange-800 border-orange-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
  LOW: "bg-green-100 text-green-800 border-green-200",
};

const PAGE_SIZE = 50;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch(() => setError("Couldn't reach the backend — start it and reload."));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.ministry.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        (p.sector ?? "").toLowerCase().includes(q)
    );
  }, [projects, query]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">All Projects</h1>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(PAGE_SIZE);
          }}
          placeholder="Search by name, ministry, state, sector..."
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all w-80"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ministry</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost (Cr)</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.slice(0, visible).map((project) => (
              <tr key={project.id} className="hover:bg-blue-50 transition-colors duration-150">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-md truncate" title={project.name}>{project.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.ministry}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.state}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                  ₹{Number(project.total_cost).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${STATUS_COLOR[project.status] ?? STATUS_COLOR.PLANNING}`}>
                    {project.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {project.risk_band ? (
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${RISK_COLOR[project.risk_band]}`}>
                      {project.risk_band}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Showing {Math.min(visible, filtered.length)} of {filtered.length} project{filtered.length === 1 ? "" : "s"}
          {query && ` (filtered from ${projects.length})`}
        </span>
        {visible < filtered.length && (
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            Show more
          </button>
        )}
      </div>
    </div>
  );
}