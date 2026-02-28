"use client";
import Accordion, { AccordionItem } from "./Accordion";
import CodeBlock from "./CodeBlock";
import { SkeletonBlock } from "./Skeleton";
import { ScaffoldOutput } from "@/lib/types";

type OutputState = "empty" | "loading" | "populated" | "error";

interface OutputPanelProps {
  state: OutputState;
  data?: ScaffoldOutput;
  error?: string;
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const color = confidence >= 85 ? "#4ade80" : confidence >= 70 ? "#facc15" : "#f87171";
  return (
    <span className="text-xs font-mono px-2 py-0.5 rounded-md" style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}>
      {confidence}%
    </span>
  );
}

function StatusIcon({ done }: { done: boolean }) {
  return done ? (
    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(74,222,128,0.2)", border: "1px solid rgba(74,222,128,0.4)" }}>
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#4ade80" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  ) : (
    <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ border: "1px solid rgba(254,254,254,0.15)" }} />
  );
}

export default function OutputPanel({ state, data, error }: OutputPanelProps) {
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
        <p className="text-muted text-sm max-w-xs">Upload a paper, paste a URL, or enter text — then click "Generate Blueprint"</p>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="w-2 h-2 rounded-full bg-accent-light animate-pulse" />
          <span className="text-sm text-lavender">Analyzing paper structure...</span>
        </div>
        {[...Array(7)].map((_, i) => <SkeletonBlock key={i} />)}
      </div>
    );
  }

  if (state === "error" || !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-12 rounded-2xl card-border"
        style={{ background: "rgba(1,1,4,0.4)", minHeight: "400px" }}>
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)" }}>
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="rgba(220,38,38,0.7)" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="font-display text-2xl text-red-400 mb-2">Generation Failed</p>
        <p className="text-muted text-sm max-w-md">{error || "An error occurred while generating the blueprint. Please try again with different text."}</p>
      </div>
    );
  }

  // Populated state with real data
  const paperSummary = `${data.paper.problem_statement}\n\nKey contributions: ${data.paper.key_contributions?.join(", ") || "N/A"}`;
  const architecture = data.extracted.model_architecture;

  return (
    <div className="animate-[slideUp_0.4s_ease]">
      <div className="flex items-center gap-3 mb-5 px-1">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <span className="text-sm text-green-400 font-medium">Blueprint generated</span>
        {data._quality_score !== undefined && (
          <span className="text-xs text-muted ml-auto">Quality: {data._quality_score}%</span>
        )}
      </div>
      <Accordion>
        <AccordionItem title="🧠 Problem & Method" defaultOpen>
          <p className="text-sm text-light/70 leading-relaxed whitespace-pre-line">{paperSummary}</p>
        </AccordionItem>
        <AccordionItem title="🏗 Architecture">
          <p className="text-sm text-light/70 whitespace-pre-line leading-relaxed">{architecture}</p>
        </AccordionItem>
        <AccordionItem title="📦 Datasets">
          <div className="flex flex-col gap-3">
            {data.datasets?.map((ds, i) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: "rgba(90,71,177,0.15)" }}>
                <p className="text-sm font-medium text-lavender">{ds.name}</p>
                <p className="text-xs text-muted mt-0.5">Role: {ds.role}</p>
                <p className="text-xs text-light/60 mt-1">{ds.size}</p>
              </div>
            ))}
          </div>
        </AccordionItem>
        <AccordionItem title="⚙ Experiment Plan">
          <div className="space-y-3 text-sm text-light/70">
            <div>
              <p className="font-medium text-lavender mb-1">Steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                {data.experiment_plan?.step_by_step?.map((step, i) => (
                  <li key={i} className="text-xs">{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </AccordionItem>
        <AccordionItem title="💻 Starter Code">
          <CodeBlock code={data.starter_code} language="Python" />
        </AccordionItem>
        <AccordionItem title="📋 Pseudocode">
          <CodeBlock code={data.pseudocode} language="python" />
        </AccordionItem>
        <AccordionItem title="🧪 Reproduction Checklist">
          <div className="flex flex-col gap-2.5">
            {data.reproducibility?.checklist?.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <StatusIcon done={item.done} />
                <span className={`text-sm ${item.done ? "text-light/60 line-through" : "text-light/80"}`}>{item.text}</span>
              </div>
            ))}
          </div>
        </AccordionItem>
        <AccordionItem title="🌱 Seeding Plan">
          <CodeBlock code={data.reproducibility?.seeding_plan?.join("\n") || ""} language="python" />
        </AccordionItem>
        {data.reproducibility?.known_issues && data.reproducibility.known_issues.length > 0 && (
          <AccordionItem title="⚠ Known Issues">
            <ul className="list-disc list-inside space-y-1 text-sm text-light/70">
              {data.reproducibility.known_issues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </AccordionItem>
        )}
        <AccordionItem title="🧾 Assumptions & Confidence">
          <div className="flex flex-col gap-3">
            {data.assumptions?.map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-light/80 font-medium">{item.key}</p>
                  <p className="text-xs text-muted mt-0.5">{item.note}</p>
                </div>
                <ConfidenceBadge confidence={item.confidence} />
              </div>
            ))}
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
