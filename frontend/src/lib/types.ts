export interface Project {
  id: number;
  name: string;
  ministry: string;
  state: string;
  district?: string;
  sector?: string;
  project_code?: string;
  status: "PLANNING" | "IN_PROGRESS" | "DELAYED" | "COMPLETED";
  progress_percent?: number;
  total_cost: number;
  original_cost?: number;
  revised_cost?: number;
  cumulative_expenditure?: number;
  original_commissioning_date?: string;
  revised_commissioning_date?: string;
  created_at: string;
  // Left-joined from RiskScore by GET /projects -- present once
  // /predict-risk has run for a project, undefined until then.
  blended_risk_score?: number;
  risk_band?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface RiskScore {
  project_id: number;
  cost_overrun_prob: number;
  delay_prob: number;
  blended_risk_score: number;
  risk_band: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  calculated_at: string;
}

export interface DashboardSummary {
  total_projects: number;
  total_cost: number;
  avg_risk_score: number;
  projects_by_status: Record<string, number>;
  critical_projects: Project[];
}

export type RiskDistribution = Record<string, number>;
export type RiskBySector = Record<string, Record<string, number>>;