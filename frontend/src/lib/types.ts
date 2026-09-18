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

export interface ConfusionMatrix {
  tp: number;
  fp: number;
  tn: number;
  fn: number;
}

export interface RocPoint {
  fpr: number;
  tpr: number;
}

export interface BandCount {
  band: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  predicted: number;
  actual: number;
}

export interface SectorAccuracy {
  sector: string;
  accuracy: number;
  n: number;
}

export interface ProbBin {
  bin: string;
  delayed: number;
  on_track: number;
}

export interface BacktestReport {
  train_snapshot: string;
  test_snapshot: string;
  model: string;
  n_train: number;
  n_test: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  threshold: number;
  confusion: ConfusionMatrix;
  roc: RocPoint[];
  bands: BandCount[];
  by_sector: SectorAccuracy[];
  prob_bins: ProbBin[];
  notes: string;
}
