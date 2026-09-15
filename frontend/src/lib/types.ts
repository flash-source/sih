// frontend/src/lib/types.ts

export interface Project {
  id: number;
  name: string;
  ministry: string;
  state: string;
  district?: string;
  sector?: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'DELAYED' | 'COMPLETED';
  progress_percent?: number;
  total_cost: number;
  created_at: string;
}

export interface RiskScore {
  project_id: number;
  cost_overrun_prob: number;
  delay_prob: number;
  blended_risk_score: number;
  risk_band: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  calculated_at: string;
}

export interface DashboardSummary {
  total_projects: number;
  total_cost: number;
  avg_risk_score: number;
  projects_by_status: Record<string, number>;
  critical_projects: Project[];
}