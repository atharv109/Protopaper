"use client";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MOCK_EXPERIMENTS } from "@/app/mockData";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  complete: { bg: "rgba(74,222,128,0.1)", text: "#4ade80", label: "Complete" },
  running: { bg: "rgba(251,191,36,0.1)", text: "#fbbf24", label: "Running" },
  draft: { bg: "rgba(96,96,109,0.2)", text: "#60606D", label: "Draft" },
};

const TYPE_STYLES: Record<string, string> = {
  PDF: "rgba(90,71,177,0.3)",
  URL: "rgba(136,117,214,0.2)",
  Text: "rgba(163,154,207,0.15)",
};

export default function ExperimentsPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) router.push("/login");
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, #5A47B1 0%, transparent 70%)" }} />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="font-display text-5xl text-light mb-2">My Experiments</h1>
            <p className="text-muted text-sm">{MOCK_EXPERIMENTS.length} papers blueprinted</p>
          </div>
          <Link href="/">
            <button className="px-5 py-2.5 rounded-xl text-sm text-lavender hover:text-light transition-all"
              style={{ border: "1px solid rgba(163,154,207,0.25)", background: "rgba(90,71,177,0.1)" }}>
              + New Blueprint
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {MOCK_EXPERIMENTS.map((exp) => {
            const status = STATUS_STYLES[exp.status];
            return (
              <div key={exp.id}
                className="rounded-2xl p-5 card-border hover:border-white/20 transition-all group"
                style={{ background: "rgba(29,19,96,0.2)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-0.5 rounded-md text-xs font-code"
                        style={{ background: TYPE_STYLES[exp.inputType], color: "#A39ACF", border: "1px solid rgba(163,154,207,0.2)" }}>
                        {exp.inputType}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs"
                        style={{ background: status.bg, color: status.text, border: `1px solid ${status.text}30` }}>
                        {status.label}
                      </span>
                      <span className="text-xs text-muted">{exp.date}</span>
                    </div>
                    <h3 className="text-light font-medium text-base group-hover:text-lavender transition-colors mb-1 truncate">{exp.title}</h3>
                    <p className="text-muted text-sm">{exp.description}</p>
                  </div>
                  <Link href={`/experiments/${exp.id}`}>
                    <button className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-lavender hover:text-light transition-all"
                      style={{ border: "1px solid rgba(163,154,207,0.2)", background: "rgba(90,71,177,0.1)" }}>
                      View
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
