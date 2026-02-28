"use client";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MOCK_EXPERIMENTS } from "@/app/mockData";
import OutputPanel from "@/components/OutputPanel";

export default function ExperimentDetailPage({ params }: { params: { id: string } }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const exp = MOCK_EXPERIMENTS.find((e) => e.id === params.id);

  useEffect(() => {
    if (!isLoggedIn) router.push("/login");
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;
  if (!exp) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="font-display text-3xl text-light/30 mb-4">Experiment not found</p>
        <Link href="/experiments" className="text-lavender hover:text-light text-sm transition-colors">← Back to experiments</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link href="/experiments"
          className="inline-flex items-center gap-2 text-muted hover:text-lavender text-sm transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to experiments
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-lavender font-code px-2 py-0.5 rounded-md"
              style={{ background: "rgba(90,71,177,0.2)", border: "1px solid rgba(90,71,177,0.3)" }}>
              {exp.inputType}
            </span>
            <span className="text-xs text-muted">{exp.date}</span>
          </div>
          <h1 className="font-display text-4xl text-light">{exp.title}</h1>
          <p className="text-muted mt-2">{exp.description}</p>
        </div>

        <div className="rounded-2xl p-6 card-border"
          style={{ background: "rgba(1,1,4,0.5)" }}>
          <OutputPanel state="populated" />
        </div>
      </div>
    </div>
  );
}
