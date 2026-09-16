import { Project, RiskScore, DashboardSummary } from './types';

const API_BASE = '/api/v1'; 

export async function fetchProjects(limit: number = 2000): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/projects?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function fetchProjectRisk(projectId: number): Promise<RiskScore> {
  const res = await fetch(`${API_BASE}/predict-risk?project_id=${projectId}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to fetch risk score');
  return res.json();
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch(`${API_BASE}/dashboard/summary`);
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return res.json();
}

export async function fetchRiskDistribution(): Promise<Record<string, number>> {
  const res = await fetch(`${API_BASE}/risk/distribution`);
  if (!res.ok) throw new Error('Failed to fetch risk distribution');
  return res.json();
}

export async function fetchRiskBySector(): Promise<Record<string, Record<string, number>>> {
  const res = await fetch(`${API_BASE}/risk/by-sector`);
  if (!res.ok) throw new Error('Failed to fetch risk by sector');
  return res.json();
}