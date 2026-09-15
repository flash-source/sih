import { Project, RiskScore, DashboardSummary } from './types';

const API_BASE = '/api/v1'; 

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/projects`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function fetchProjectRisk(projectId: number): Promise<RiskScore> {
  const res = await fetch(`${API_BASE}/predict-risk?project_id=${projectId}`);
  if (!res.ok) throw new Error('Failed to fetch risk score');
  return res.json();
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch(`${API_BASE}/dashboard/summary`);
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return res.json();
}