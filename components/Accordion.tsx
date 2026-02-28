"use client";
import { useState, ReactNode } from "react";

interface AccordionItemProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl overflow-hidden transition-all"
      style={{ border: "1px solid rgba(254,254,254,0.08)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors"
        style={{ background: open ? "rgba(29,19,96,0.4)" : "rgba(1,1,4,0.4)" }}
      >
        <span className="text-sm font-medium text-light/90">{title}</span>
        <svg
          className={`w-4 h-4 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 py-4 animate-[fadeIn_0.2s_ease]"
          style={{ background: "rgba(1,1,4,0.3)", borderTop: "1px solid rgba(254,254,254,0.06)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function Accordion({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2">{children}</div>;
}
