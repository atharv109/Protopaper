"use client";
import { useState } from "react";
import Tabs from "@/components/Tabs";
import Button from "@/components/Button";
import UploadDropzone from "@/components/UploadDropzone";
import OutputPanel from "@/components/OutputPanel";
import { generateBlueprint, ScaffoldData } from "@/lib/api";

const INPUT_TABS = [
  { id: "text", label: "Abstract", icon: "✏️" },
  { id: "url", label: "arXiv URL", icon: "🔗" },
  { id: "pdf", label: "PDF", icon: "📄" },
];

type OutputState = "empty" | "loading" | "populated" | "error";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("text");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [outputState, setOutputState] = useState<OutputState>("empty");
  const [outputData, setOutputData] = useState<ScaffoldData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const canGenerate =
    (activeTab === "pdf" && pdfFile !== null) ||
    (activeTab === "url" && url.trim().length > 0) ||
    (activeTab === "text" && text.trim().length >= 50);

  const handleGenerate = async () => {
    setOutputState("loading");
    setErrorMsg("");
    setOutputData(null);

    try {
      let payload = {
        text: "",
        title: title.trim() || "unknown",
        source: "unknown",
        input_type: "abstract" as const,
      };

      if (activeTab === "text") {
        if (text.trim().length < 50) {
          throw new Error("Please enter at least 50 characters of abstract text.");
        }
        payload.text = text.trim().slice(0, 8000);
        payload.input_type = "abstract";

      } else if (activeTab === "url") {
        // For arXiv URLs we send the URL as source and ask user to paste abstract
        // The backend expects text, not a URL fetcher
        const arxivId = url.match(/arxiv\.org\/(?:abs|pdf)\/([0-9.]+)/)?.[1];
        payload.source = url.trim();
        payload.input_type = "arxiv_abstract";

        if (!text.trim()) {
          throw new Error(
            "Please also paste the abstract text below.\n\nThe backend analyzes text — paste the abstract from the arXiv page."
          );
        }
        payload.text = text.trim().slice(0, 8000);
        if (arxivId) payload.title = payload.title === "unknown" ? arxivId : payload.title;

      } else if (activeTab === "pdf") {
        if (!pdfFile) throw new Error("Please select a PDF file.");
        if (!text.trim()) {
          throw new Error(
            "Please paste the abstract text from the PDF.\n\nThe backend analyzes text — paste the abstract or key excerpt."
          );
        }
        payload.text = text.trim().slice(0, 8000);
        payload.title = payload.title === "unknown" ? pdfFile.name.replace(".pdf", "") : payload.title;
        payload.source = pdfFile.name;
        payload.input_type = "excerpt";
      }

      const data = await generateBlueprint(payload);
      setOutputData(data);
      setOutputState("populated");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setErrorMsg(msg);
      setOutputState("error");
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Hero BG */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, #5A47B1 0%, transparent 70%)" }} />
        <div className="absolute top-20 -left-20 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, #8875D6 0%, transparent 70%)" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-24">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs text-lavender"
            style={{ border: "1px solid rgba(163,154,207,0.25)", background: "rgba(90,71,177,0.1)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-lavender animate-pulse" />
            Powered by Claude · Extended Thinking
          </div>
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-light text-light mb-6 leading-none tracking-tight">
            Paper-to-<span className="italic" style={{ color: "#A39ACF" }}>Prototype</span>
          </h1>
          <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed">
            Paste an abstract or arXiv URL → get runnable experiment scaffolding in seconds.
          </p>
        </div>

        {/* 2-col layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl p-6 card-border"
              style={{ background: "rgba(29,19,96,0.2)" }}>
              <h2 className="text-sm font-medium text-lavender mb-5 tracking-wide uppercase">Input</h2>

              <Tabs tabs={INPUT_TABS} active={activeTab} onChange={(id) => { setActiveTab(id); setOutputState("empty"); }} />

              <div className="mt-5 flex flex-col gap-4">
                {/* Title field (all tabs) */}
                <div>
                  <label className="block text-xs text-lavender mb-1.5 tracking-wide uppercase">
                    Paper Title <span className="text-muted normal-case">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Attention Is All You Need"
                    maxLength={300}
                    className="w-full rounded-xl px-4 py-3 text-sm text-light placeholder-muted outline-none transition-all"
                    style={{ background: "rgba(1,1,4,0.6)", border: "1px solid rgba(254,254,254,0.1)" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(90,71,177,0.7)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(254,254,254,0.1)")}
                  />
                </div>

                {/* PDF tab */}
                {activeTab === "pdf" && (
                  <UploadDropzone file={pdfFile} onFile={setPdfFile} />
                )}

                {/* URL tab */}
                {activeTab === "url" && (
                  <div>
                    <label className="block text-xs text-lavender mb-1.5 tracking-wide uppercase">arXiv URL</label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://arxiv.org/abs/1706.03762"
                      className="w-full rounded-xl px-4 py-3.5 text-sm text-light placeholder-muted outline-none transition-all"
                      style={{ background: "rgba(1,1,4,0.6)", border: "1px solid rgba(254,254,254,0.1)" }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(90,71,177,0.7)")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(254,254,254,0.1)")}
                    />
                  </div>
                )}

                {/* Abstract text (shown for all tabs) */}
                <div>
                  <label className="block text-xs text-lavender mb-1.5 tracking-wide uppercase">
                    {activeTab === "text" ? "Abstract / Excerpt" : "Paste Abstract Text"}
                    {activeTab !== "text" && <span className="text-muted normal-case ml-1">(required)</span>}
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={
                      activeTab === "url"
                        ? "Paste the abstract from the arXiv page here..."
                        : activeTab === "pdf"
                        ? "Paste the abstract or key excerpt from the PDF here..."
                        : "Paste the paper abstract or methodology section here (min 50 chars)..."
                    }
                    rows={activeTab === "text" ? 9 : 6}
                    maxLength={8000}
                    className="w-full rounded-xl px-4 py-3.5 text-sm text-light placeholder-muted outline-none resize-none transition-all"
                    style={{ background: "rgba(1,1,4,0.6)", border: "1px solid rgba(254,254,254,0.1)" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(90,71,177,0.7)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(254,254,254,0.1)")}
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-muted text-xs">{text.length}/8000 characters</p>
                    {text.length < 50 && text.length > 0 && (
                      <p className="text-xs" style={{ color: "#f87171" }}>{50 - text.length} more chars needed</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <Button
                  variant="primary"
                  className="w-full py-4 text-base"
                  disabled={!canGenerate || outputState === "loading"}
                  loading={outputState === "loading"}
                  onClick={handleGenerate}
                >
                  {outputState === "loading" ? "Generating Blueprint..." : "Generate Blueprint"}
                </Button>
                {outputState === "loading" && (
                  <p className="text-center text-xs text-muted mt-3">
                    Claude is thinking deeply — this takes 15–45 seconds
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "Claude", label: "Extended Thinking" },
                { value: "8k", label: "Thinking tokens" },
                { value: "3×", label: "Auto-retry on fail" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl p-4 text-center card-border"
                  style={{ background: "rgba(1,1,4,0.4)" }}>
                  <p className="font-display text-xl text-lavender">{stat.value}</p>
                  <p className="text-muted text-xs mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Output Panel */}
          <div className="rounded-2xl p-6 card-border"
            style={{ background: "rgba(1,1,4,0.5)" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-medium text-lavender tracking-wide uppercase">Blueprint Output</h2>
              {outputData?._quality_score !== undefined && (
                <span className="text-xs px-2 py-1 rounded-lg font-code"
                  style={{
                    color: outputData._quality_score >= 80 ? "#4ade80" : outputData._quality_score >= 60 ? "#facc15" : "#f87171",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.1)"
                  }}>
                  Quality: {outputData._quality_score}/100
                </span>
              )}
            </div>

            {outputState === "error" && (
              <div className="rounded-xl p-4 mb-4"
                style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)" }}>
                <p className="text-xs font-medium mb-1" style={{ color: "#f87171" }}>Generation failed</p>
                <p className="text-xs text-light/60 whitespace-pre-line">{errorMsg}</p>
                <button onClick={() => setOutputState("empty")}
                  className="mt-3 text-xs text-muted hover:text-light transition-colors underline">
                  Dismiss
                </button>
              </div>
            )}

            <OutputPanel state={outputState === "error" ? "empty" : outputState} data={outputData} />
          </div>
        </div>
      </div>
    </div>
  );
}
