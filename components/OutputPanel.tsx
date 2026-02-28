"use client";
import Accordion, { AccordionItem } from "./Accordion";
import CodeBlock from "./CodeBlock";
import { SkeletonBlock } from "./Skeleton";
import { ScaffoldData } from "@/lib/api";
import { MOCK_OUTPUT } from "@/app/mockData";

type OutputState = "empty" | "loading" | "populated";

interface OutputPanelProps {
  state: OutputState;
  data?: ScaffoldData | null;
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    High:   { color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
    Medium: { color: "#facc15", bg: "rgba(250,204,21,0.12)" },
    Low:    { color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  };
  const s = map[confidence] || map.Low;
  return (
    <span className="text-xs font-code px-2.5 py-1 rounded-lg"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}30` }}>
      {confidence} confidence
    </span>
  );
}

function StatusIcon({ done }: { done: boolean }) {
  return done ? (
    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: "rgba(74,222,128,0.2)", border: "1px solid rgba(74,222,128,0.4)" }}>
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#4ade80" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  ) : (
    <div className="w-5 h-5 rounded-full flex-shrink-0"
      style={{ border: "1px solid rgba(254,254,254,0.15)" }} />
  );
}

function Tag({ text }: { text: string }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded-md text-xs font-code"
      style={{ background: "rgba(90,71,177,0.2)", color: "#A39ACF", border: "1px solid rgba(163,154,207,0.2)" }}>
      {text}
    </span>
  );
}

function HyperparamRow({ label, value }: { label: string; value: string }) {
  if (!value || value === "unknown") return null;
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-xs font-code text-lavender">{value}</span>
    </div>
  );
}

export default function OutputPanel({ state, data }: OutputPanelProps) {
  if (state === "empty") {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-12 rounded-2xl card-border"
        style={{ background: "rgba(1,1,4,0.4)", minHeight: "400px" }}>
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: "rgba(29,19,96,0.4)", border: "1px solid rgba(90,71,177,0.2)" }}>
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="rgba(163,154,207,0.5)" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <p className="font-display text-2xl text-light/30 mb-2">Blueprint will appear here</p>
        <p className="text-muted text-sm max-w-xs">Paste an abstract and click "Generate Blueprint" to start</p>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="w-2 h-2 rounded-full bg-accent-light animate-pulse" />
          <span className="text-sm text-lavender">Claude is analyzing the paper...</span>
        </div>
        {[...Array(7)].map((_, i) => <SkeletonBlock key={i} />)}
      </div>
    );
  }

  // Use real data if available, fall back to mock for demo
  const d = data || null;
  if (!d) {
    return (
      <div className="text-center p-8">
        <p className="text-muted text-sm">No data returned from server.</p>
      </div>
    );
  }

  const hp = d.extracted.baseline_hyperparameters;
  const hasHyperparams = [hp.learning_rate, hp.batch_size, hp.epochs, hp.optimizer]
    .some((v) => v && v !== "unknown");

  return (
    <div className="animate-[slideUp_0.4s_ease]">
      {/* Header row */}
      <div className="flex items-center justify-between mb-5 px-1 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-sm text-green-400 font-medium">Blueprint generated</span>
          {d._retry && (
            <span className="text-xs text-muted">(needed retry)</span>
          )}
        </div>
        <ConfidenceBadge confidence={d.confidence} />
      </div>

      {/* Paper summary strip */}
      <div className="rounded-xl p-4 mb-4"
        style={{ background: "rgba(29,19,96,0.3)", border: "1px solid rgba(90,71,177,0.2)" }}>
        <p className="text-xs text-muted mb-1">{d.paper.problem_area}</p>
        <p className="text-sm text-light font-medium leading-snug">{d.paper.one_sentence_summary}</p>
        {d.paper.source !== "unknown" && (
          <p className="text-xs text-lavender/60 mt-1 font-code">{d.paper.source}</p>
        )}
      </div>

      {/* Guardrail warnings */}
      {d._guardrail_warnings && d._guardrail_warnings.length > 0 && (
        <div className="rounded-xl p-3 mb-4"
          style={{ background: "rgba(250,204,21,0.08)", border: "1px solid rgba(250,204,21,0.2)" }}>
          <p className="text-xs font-medium mb-1" style={{ color: "#facc15" }}>⚠ Code warnings</p>
          {d._guardrail_warnings.map((w, i) => (
            <p key={i} className="text-xs text-muted">{w}</p>
          ))}
        </div>
      )}

      <Accordion>
        {/* Problem & Method */}
        <AccordionItem title="🧠 Problem & Method" defaultOpen>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-1.5">
              <Tag text={d.extracted.task_type} />
              <Tag text={d.extracted.model_type} />
            </div>
            <p className="text-sm text-light/70 leading-relaxed">{d.extracted.method_summary}</p>
            {d.extracted.key_components.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-2">Key components</p>
                <div className="flex flex-wrap gap-1.5">
                  {d.extracted.key_components.map((c, i) => <Tag key={i} text={c} />)}
                </div>
              </div>
            )}
            {d.extracted.evaluation_metrics.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-2">Evaluation metrics</p>
                <div className="flex flex-wrap gap-1.5">
                  {d.extracted.evaluation_metrics.map((m, i) => <Tag key={i} text={m} />)}
                </div>
              </div>
            )}
          </div>
        </AccordionItem>

        {/* Architecture / Hyperparameters */}
        <AccordionItem title="⚙ Hyperparameters">
          <div className="flex flex-col gap-1">
            {hasHyperparams ? (
              <>
                <HyperparamRow label="Learning rate" value={hp.learning_rate} />
                <HyperparamRow label="Batch size" value={hp.batch_size} />
                <HyperparamRow label="Epochs / steps" value={hp.epochs} />
                <HyperparamRow label="Optimizer" value={hp.optimizer} />
                {hp.other?.map((o, i) => (
                  <div key={i} className="flex items-center py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-xs font-code text-lavender/80">{o}</span>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-xs text-muted">No specific hyperparameters found in the text.</p>
            )}
          </div>
        </AccordionItem>

        {/* Datasets */}
        <AccordionItem title="📦 Datasets">
          <div className="flex flex-col gap-3">
            {d.extracted.data_used_in_paper.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-1.5">Mentioned in paper</p>
                <div className="flex flex-wrap gap-1.5">
                  {d.extracted.data_used_in_paper.map((ds, i) => <Tag key={i} text={ds} />)}
                </div>
              </div>
            )}
            {d.datasets.suggested_public_datasets.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-2">Suggested public datasets</p>
                <div className="flex flex-col gap-2">
                  {d.datasets.suggested_public_datasets.map((ds, i) => (
                    <div key={i} className="rounded-lg p-3"
                      style={{ background: "rgba(1,1,4,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-xs font-medium text-lavender">{ds.name}</p>
                      <p className="text-xs text-muted mt-0.5">{ds.why_fit}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {d.datasets.dataset_search_keywords.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-1.5">Search keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {d.datasets.dataset_search_keywords.map((kw, i) => <Tag key={i} text={kw} />)}
                </div>
              </div>
            )}
          </div>
        </AccordionItem>

        {/* Experiment Plan */}
        <AccordionItem title="🏗 Experiment Plan">
          <div className="flex flex-col gap-2.5">
            {d.experiment_plan.step_by_step.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-code"
                  style={{ background: "rgba(90,71,177,0.3)", color: "#A39ACF", border: "1px solid rgba(90,71,177,0.4)" }}>
                  {i + 1}
                </span>
                <p className="text-sm text-light/75">{step}</p>
              </div>
            ))}
            {d.experiment_plan.train_eval_split !== "unknown" && (
              <div className="mt-2 pt-2 border-t border-white/5">
                <span className="text-xs text-muted">Split: </span>
                <span className="text-xs text-lavender font-code">{d.experiment_plan.train_eval_split}</span>
              </div>
            )}
            {d.experiment_plan.expected_outputs.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-1.5">Expected outputs</p>
                {d.experiment_plan.expected_outputs.map((o, i) => (
                  <p key={i} className="text-xs text-light/60">→ {o}</p>
                ))}
              </div>
            )}
          </div>
        </AccordionItem>

        {/* Reproducibility */}
        <AccordionItem title="🧪 Reproducibility">
          <div className="flex flex-col gap-4">
            {d.reproducibility.requirements.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-2">Requirements</p>
                <div className="flex flex-wrap gap-1.5">
                  {d.reproducibility.requirements.map((r, i) => <Tag key={i} text={r} />)}
                </div>
              </div>
            )}
            {d.reproducibility.seeding_plan.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-2">Seeding</p>
                <div className="rounded-lg overflow-hidden"
                  style={{ background: "rgba(1,1,4,0.6)", border: "1px solid rgba(90,71,177,0.2)" }}>
                  {d.reproducibility.seeding_plan.map((s, i) => (
                    <p key={i} className="px-3 py-1.5 text-xs font-code text-lavender/80 border-b border-white/5 last:border-0">{s}</p>
                  ))}
                </div>
              </div>
            )}
            {d.reproducibility.checklist.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-2">Verification checklist</p>
                <div className="flex flex-col gap-2">
                  {d.reproducibility.checklist.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <StatusIcon done={false} />
                      <span className="text-xs text-light/75">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {d.reproducibility.common_failure_modes.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-2">Common failure modes</p>
                {d.reproducibility.common_failure_modes.map((f, i) => (
                  <p key={i} className="text-xs text-light/60 mb-1">⚠ {f}</p>
                ))}
              </div>
            )}
            {d.reproducibility.missing_details.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-2">Missing from paper</p>
                {d.reproducibility.missing_details.map((m, i) => (
                  <p key={i} className="text-xs text-muted mb-1">• {m}</p>
                ))}
              </div>
            )}
          </div>
        </AccordionItem>

        {/* Pseudocode */}
        <AccordionItem title="📋 Pseudocode">
          <pre className="text-xs leading-relaxed text-light/70 whitespace-pre-wrap font-code">
            {d.pseudocode}
          </pre>
        </AccordionItem>

        {/* Starter Code */}
        <AccordionItem title="💻 Starter Code">
          <CodeBlock code={d.starter_code} language="Python" />
        </AccordionItem>
      </Accordion>
    </div>
  );
}
