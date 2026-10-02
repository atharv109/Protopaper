"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OutputPanel from "@/components/OutputPanel";
import PaperCrumbleAnimation from "@/components/PaperCrumbleAnimation";
import { generateBlueprint, ScaffoldData } from "@/lib/api";

type PageState = "animating" | "loading" | "populated" | "error";

export default function ResultsPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>("animating");
  const [outputData, setOutputData] = useState<ScaffoldData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [payload, setPayload] = useState<{ text: string; title: string; source: string; input_type: "abstract" | "arxiv_abstract" | "excerpt" } | null>(null);

  // Read payload from sessionStorage on mount
  useEffect(() => {
    const raw = sessionStorage.getItem("pp_payload");
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      setPayload(JSON.parse(raw));
    } catch {
      router.replace("/");
    }
  }, [router]);

  // Called when animation finishes — start the API call
  const handleAnimationComplete = useCallback(() => {
    setPageState("loading");
  }, []);

  // When state transitions to loading and we have payload, call the API
  useEffect(() => {
    if (pageState !== "loading" || !payload) return;

    generateBlueprint(payload)
      .then((data) => {
        setOutputData(data);
        setPageState("populated");
      })
      .catch((err: unknown) => {
        setErrorMsg(err instanceof Error ? err.message : "Unknown error");
        setPageState("error");
      });
  }, [pageState, payload]);

  return (
    <div className="min-h-screen relative">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(ellipse, #5A47B1 0%, transparent 70%)" }} />
      </div>

      {/* Paper crumble animation — shows while animating */}
      {pageState === "animating" && (
        <PaperCrumbleAnimation onComplete={handleAnimationComplete} />
      )}

      <div className="relative max-w-4xl mx-auto px-6 pt-12 pb-24">
        {/* Back + title row */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/"
            className="inline-flex items-center gap-2 text-muted hover:text-lavender text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            New blueprint
          </Link>

          {outputData && (
            <div className="flex items-center gap-3">
              {outputData._quality_score !== undefined && (
                <span className="text-xs px-2.5 py-1 rounded-lg font-code"
                  style={{
                    color: outputData._quality_score >= 80 ? "#4ade80" : outputData._quality_score >= 60 ? "#facc15" : "#f87171",
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}>
                  Quality {outputData._quality_score}/100
                </span>
              )}
              {outputData._retry && (
                <span className="text-xs text-muted">retried</span>
              )}
            </div>
          )}
        </div>

        {/* Paper title */}
        {payload?.title && payload.title !== "unknown" && (
          <div className="mb-6">
            <h1 className="font-display text-3xl md:text-4xl text-light font-light leading-tight">
              {payload.title}
            </h1>
          </div>
        )}

        {/* Loading state — full page skeleton with message */}
        {pageState === "animating" && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: "rgba(29,19,96,0.4)", border: "1px solid rgba(90,71,177,0.3)" }}>
              <div className="w-5 h-5 rounded-full border-2 border-lavender border-t-transparent animate-spin" />
            </div>
            <p className="font-display text-2xl text-light/40 mb-2">Preparing analysis...</p>
          </div>
        )}

        {pageState === "loading" && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative mb-8">
              {/* Outer ring */}
              <div className="w-20 h-20 rounded-full border border-accent/30 animate-ping absolute inset-0" />
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ border: "1px solid rgba(90,71,177,0.5)", background: "rgba(29,19,96,0.4)" }}>
                <div className="w-8 h-8 rounded-full border-2 border-lavender border-t-transparent animate-spin" />
              </div>
            </div>
            <p className="font-display text-3xl text-light/60 mb-3">Claude is thinking...</p>
            <p className="text-muted text-sm max-w-xs">
              Extended thinking enabled · 8,000 thinking tokens · This takes 15–45 seconds
            </p>
            {/* Animated dots */}
            <div className="flex gap-1.5 mt-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-lavender/40"
                  style={{ animation: `pulse 1.2s ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {pageState === "error" && (
          <div className="rounded-2xl p-8 text-center card-border"
            style={{ background: "rgba(248,113,113,0.06)" }}>
            <p className="text-lg font-medium mb-2" style={{ color: "#f87171" }}>Generation failed</p>
            <p className="text-sm text-light/50 whitespace-pre-line mb-6 max-w-md mx-auto">{errorMsg}</p>
            <Link href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm text-light transition-all glow-btn"
              style={{ background: "linear-gradient(135deg, #5A47B1, #8875D6)" }}>
              ← Try again
            </Link>
          </div>
        )}

        {/* Results */}
        {pageState === "populated" && outputData && (
          <div className="animate-[slideUp_0.5s_ease]">
            <div className="rounded-2xl p-6 card-border"
              style={{ background: "rgba(1,1,4,0.5)" }}>
              <OutputPanel state="populated" data={outputData} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
