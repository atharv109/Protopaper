// lib/api.ts
// Matches app.py GenerateRequest schema exactly

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface GenerateRequest {
  text: string;       // 50–8000 chars
  title?: string;     // max 300 chars
  source?: string;    // max 300 chars
  input_type?: "abstract" | "arxiv_abstract" | "excerpt";
}

// Mirrors the backend JSON schema from prompts.py / schema.py
export interface ScaffoldData {
  paper: {
    title: string;
    source: string;
    problem_area: string;
    one_sentence_summary: string;
  };
  confidence: "High" | "Medium" | "Low";
  extracted: {
    task_type: string;
    method_summary: string;
    model_type: string;
    key_components: string[];
    data_used_in_paper: string[];
    evaluation_metrics: string[];
    baseline_hyperparameters: {
      learning_rate: string;
      batch_size: string;
      epochs: string;
      optimizer: string;
      other: string[];
    };
  };
  datasets: {
    suggested_public_datasets: { name: string; why_fit: string }[];
    dataset_search_keywords: string[];
  };
  experiment_plan: {
    step_by_step: string[];
    train_eval_split: string;
    expected_outputs: string[];
  };
  reproducibility: {
    requirements: string[];
    seeding_plan: string[];
    checklist: string[];
    common_failure_modes: string[];
    missing_details: string[];
  };
  pseudocode: string;
  starter_code: string;
  _retry?: boolean;
  _quality_score?: number;
  _guardrail_warnings?: string[];
}

export interface GenerateResponse {
  ok: boolean;
  data: ScaffoldData | null;
  error: string | null;
}

export async function generateBlueprint(req: GenerateRequest): Promise<ScaffoldData> {
  const payload: GenerateRequest = {
    text: req.text,
    title: req.title || "unknown",
    source: req.source || "unknown",
    input_type: req.input_type || "abstract",
  };

  const res = await fetch(`${BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(detail.detail || `HTTP ${res.status}`);
  }

  const body: GenerateResponse = await res.json();
  if (!body.ok || !body.data) {
    throw new Error(body.error || "Unknown server error");
  }
  return body.data;
}

// Extract text from PDF using FileReader (client-side, no upload needed)
export async function extractTextFromPDF(file: File): Promise<string> {
  // We read the PDF as text — for real extraction the backend handles it
  // Here we send the raw text content; for binary PDFs we send filename as title
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // PDFs as raw text are garbled; return what we can
      resolve(text?.slice(0, 8000) || "");
    };
    reader.readAsText(file);
  });
}
