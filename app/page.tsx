"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Tabs from "@/components/Tabs";
import Button from "@/components/Button";
import UploadDropzone from "@/components/UploadDropzone";

const INPUT_TABS = [
  { id: "text", label: "Abstract", icon: "✏️" },
  { id: "url", label: "arXiv URL", icon: "🔗" },
  { id: "pdf", label: "PDF", icon: "📄" },
];

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("text");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");

  const canGenerate =
    (activeTab === "pdf" && pdfFile !== null && text.trim().length >= 50) ||
    (activeTab === "url" && url.trim().length > 0 && text.trim().length >= 50) ||
    (activeTab === "text" && text.trim().length >= 50);

  const handleGenerate = () => {
    const payload = {
      text: text.trim().slice(0, 8000),
      title: title.trim() || "unknown",
      source: activeTab === "url" ? url.trim() : activeTab === "pdf" ? pdfFile?.name || "unknown" : "unknown",
      input_type: activeTab === "url" ? "arxiv_abstract" : activeTab === "pdf" ? "excerpt" : "abstract",
    };
    sessionStorage.setItem("pp_payload", JSON.stringify(payload));
    router.push("/results");
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

      <div className="relative max-w-3xl mx-auto px-6 pt-16 pb-24">
        {/* Hero */}
        <div className="text-center mb-12">
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

        {/* Input Panel */}
        <div className="rounded-2xl p-6 card-border" style={{ background: "rgba(29,19,96,0.2)" }}>
          <Tabs tabs={INPUT_TABS} active={activeTab} onChange={setActiveTab} />

          <div className="mt-5 flex flex-col gap-4">
            {/* Title */}
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

            {/* PDF dropzone */}
            {activeTab === "pdf" && (
              <UploadDropzone file={pdfFile} onFile={setPdfFile} />
            )}

            {/* URL input */}
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

            {/* Abstract textarea */}
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
                rows={8}
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
              disabled={!canGenerate}
              onClick={handleGenerate}
            >
              Generate Blueprint →
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
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
    </div>
  );
}