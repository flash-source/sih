import { Project, RiskScore, DashboardSummary, RiskDistribution, RiskBySector } from "./types";

const API_BASE =
  typeof window === "undefined"
    ? `${process.env.FASTAPI_BASE_URL ?? "http://localhost:8000"}/api/v1`
    : "/api/v1";

async function getJSON<T>(path: string, revalidateSeconds = 30): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: revalidateSeconds } });
  if (!res.ok) throw new Error(`${path} responded ${res.status}`);
  return res.json();
}

export const FULL_PORTFOLIO_LIMIT = 2000;

export async function fetchProjects(params: { skip?: number; limit?: number } = {}): Promise<Project[]> {
  const search = new URLSearchParams();
  if (params.skip) search.set("skip", String(params.skip));
  search.set("limit", String(params.limit ?? 100));
  return getJSON<Project[]>(`/projects?${search.toString()}`);
}

export async function fetchProject(projectId: number): Promise<Project> {
  return getJSON<Project>(`/projects/${projectId}`);
}

export async function fetchProjectRisk(projectId: number): Promise<RiskScore> {
  // Computes and persists a fresh score server-side -- POST, not GET.
  const res = await fetch(`${API_BASE}/predict-risk?project_id=${projectId}`, {
    method: "POST",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`predict-risk responded ${res.status}`);
  return res.json();
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  return getJSON<DashboardSummary>(`/dashboard/summary`);
}

export async function fetchRiskDistribution(): Promise<RiskDistribution> {
  return getJSON<RiskDistribution>(`/risk/distribution`);
}

export async function fetchRiskBySector(): Promise<RiskBySector> {
  return getJSON<RiskBySector>(`/risk/by-sector`);
}