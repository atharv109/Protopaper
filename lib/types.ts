/**
 * Complete TypeScript schema for Paper-to-Prototype
 * Mirrors the Python schema structure
 */

export interface ChecklistItem {
  text: string;
  done: boolean;
}

export interface AssumptionItem {
  key: string;
  confidence: number; // 0-100
  note: string;
}

export interface ExperimentPlan {
  problem_statement: string;
  step_by_step: string[];
}

export interface ReproducibilityInfo {
  checklist: ChecklistItem[];
  seeding_plan: string[];
  known_issues: string[];
}

export interface ScaffoldOutput {
  // Core paper analysis
  paper: {
    title: string;
    problem_statement: string;
    key_contributions: string[];
  };

  // Extracted architecture/evaluation framework
  extracted: {
    model_architecture: string;
    training_details: Record<string, string>;
  };

  // Datasets used
  datasets: {
    name: string;
    role: string; // "pre-training", "fine-tuning", "evaluation"
    size: string;
  }[];

  // Experiment plan
  experiment_plan: ExperimentPlan;

  // Reproducibility info
  reproducibility: ReproducibilityInfo;

  // Pseudocode overview
  pseudocode: string;

  // Runnable starter code snippet
  starter_code: string;

  // Confidence and metadata
  confidence: number; // 0-100
  assumptions: AssumptionItem[];

  // Internal metadata (added by backend)
  _retry?: boolean;
  _quality_score?: number;
}

/**
 * API request/response types
 */

export interface GenerateRequest {
  text: string;
  title?: string;
  source?: string;
  inputType?: "pdf" | "url" | "text";
}

export interface GenerateResponse {
  success: boolean;
  data?: ScaffoldOutput;
  error?: string;
  retries?: number;
}
