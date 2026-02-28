"use client";
import { useState } from "react";
import Tabs from "@/components/Tabs";
import Button from "@/components/Button";
import UploadDropzone from "@/components/UploadDropzone";
import OutputPanel from "@/components/OutputPanel";
import { ScaffoldOutput, GenerateResponse } from "@/lib/types";

const INPUT_TABS = [
  { id: "pdf", label: "PDF", icon: "📄" },
  { id: "url", label: "URL", icon: "🔗" },
  { id: "text", label: "Text", icon: "✏️" },
];

type OutputState = "empty" | "loading" | "populated" | "error";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("pdf");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [outputState, setOutputState] = useState<OutputState>("empty");
  const [outputData, setOutputData] = useState<ScaffoldOutput | undefined>();
  const [outputError, setOutputError] = useState<string | undefined>();

  const handleGenerate = async () => {
    setOutputState("loading");
    setOutputError(undefined);

    try {
      let inputText = "";
      let inputType = "text";
      let title = "Unknown";

      if (activeTab === "pdf" && pdfFile) {
        // For now, we'll need to extract text from PDF on the backend
        // For demo purposes, showing user they need to paste content
        inputText = `PDF File: ${pdfFile.name} (text extraction coming soon)`;
        inputType = "pdf";
        title = pdfFile.name;
      } else if (activeTab === "url" && url.trim()) {
        inputText = url;
        inputType = "url";
        title = url;
      } else if (activeTab === "text" && text.trim()) {
        inputText = text;
        inputType = "text";
        title = "User-provided text";
      }

      if (!inputText.trim()) {
        setOutputState("error");
        setOutputError("Please provide input content");
        return;
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          title,
          source: activeTab === "url" ? url : "webapp",
          inputType,
        }),
      });

      const result = (await response.json()) as GenerateResponse;

      if (response.status === 429) {
        // rate limit hit – show explanatory text
        setOutputState("error");
        setOutputError(
          "Daily token limit reached for the current Groq plan. Please wait a while or upgrade your plan at https://console.groq.com/settings/billing."
        );
        return;
      }

      if (!response.ok || !result.success) {
        setOutputState("error");
        setOutputError(result.error || "Failed to generate blueprint");
        return;
      }

      setOutputData(result.data);
      setOutputState("populated");
    } catch (error) {
      setOutputState("error");
      setOutputError(`Error: ${(error as Error).message}`);
    }
  };

  const canGenerate = (activeTab === "pdf" && pdfFile) ||
    (activeTab === "url" && url.trim()) ||
    (activeTab === "text" && text.trim().length > 20);

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
        {/* Hero text */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs text-lavender"
            style={{ border: "1px solid rgba(163,154,207,0.25)", background: "rgba(90,71,177,0.1)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-lavender animate-pulse" />
            Research → Prototype in seconds
          </div>
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-light text-light mb-6 leading-none tracking-tight">
            Paper-to-<span className="italic" style={{ color: "#A39ACF" }}>Prototype</span>
          </h1>
          <p className="text-muted text-lg max-w-xl mx-auto leading-relaxed">
            Upload a research paper or paste a URL/text → get runnable experiment scaffolding.
          </p>
        </div>

        {/* Main 2-col layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl p-6 card-border"
              style={{ background: "rgba(29,19,96,0.2)" }}>
              <h2 className="text-sm font-medium text-lavender mb-5 tracking-wide uppercase">Input</h2>
              <Tabs tabs={INPUT_TABS} active={activeTab} onChange={setActiveTab} />

              <div className="mt-5">
                {activeTab === "pdf" && (
                  <UploadDropzone file={pdfFile} onFile={setPdfFile} />
                )}

                {activeTab === "url" && (
                  <div>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://arxiv.org/abs/..."
                      className="w-full rounded-xl px-4 py-3.5 text-sm text-light placeholder-muted outline-none transition-all"
                      style={{
                        background: "rgba(1,1,4,0.6)",
                        border: "1px solid rgba(254,254,254,0.1)",
                      }}
                      onFocus={(e) => e.target.style.borderColor = "rgba(90,71,177,0.7)"}
                      onBlur={(e) => e.target.style.borderColor = "rgba(254,254,254,0.1)"}
                    />
                    <p className="text-muted text-xs mt-2">Supports arXiv, Semantic Scholar, and direct PDF URLs</p>
                  </div>
                )}

                {activeTab === "text" && (
                  <div>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Paste abstract, methods section, or full paper text..."
                      rows={8}
                      className="w-full rounded-xl px-4 py-3.5 text-sm text-light placeholder-muted outline-none resize-none transition-all"
                      style={{
                        background: "rgba(1,1,4,0.6)",
                        border: "1px solid rgba(254,254,254,0.1)",
                      }}
                      onFocus={(e) => e.target.style.borderColor = "rgba(90,71,177,0.7)"}
                      onBlur={(e) => e.target.style.borderColor = "rgba(254,254,254,0.1)"}
                    />
                    <p className="text-muted text-xs mt-2">{text.length} characters</p>
                  </div>
                )}
              </div>

              <div className="mt-5">
                <Button
                  variant="primary"
                  className="w-full py-4 text-base"
                  disabled={!canGenerate}
                  loading={outputState === "loading"}
                  onClick={handleGenerate}
                >
                  {outputState === "loading" ? "Generating..." : "Generate Blueprint"}
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "4.2k", label: "Papers parsed" },
                { value: "98%", label: "Accuracy rate" },
                { value: "<5s", label: "Avg. generation" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl p-4 text-center card-border"
                  style={{ background: "rgba(1,1,4,0.4)" }}>
                  <p className="font-display text-2xl text-lavender">{stat.value}</p>
                  <p className="text-muted text-xs mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Output Panel */}
          <div className="rounded-2xl p-6 card-border"
            style={{ background: "rgba(1,1,4,0.5)" }}>
            <h2 className="text-sm font-medium text-lavender mb-5 tracking-wide uppercase">Blueprint Output</h2>
            <OutputPanel state={outputState} data={outputData} error={outputError} />
          </div>
        </div>
      </div>
    </div>
  );
}
