"use client";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  children: ReactNode;
}

export default function Button({ variant = "primary", loading, children, className = "", disabled, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-medium text-sm transition-all duration-200 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "glow-btn text-light",
    secondary: "border border-white/15 text-lavender hover:border-accent-light hover:text-light hover:bg-white/5",
    ghost: "text-muted hover:text-light hover:bg-white/5",
  };

  const primaryStyle = variant === "primary" ? {
    background: "linear-gradient(135deg, #5A47B1, #8875D6)",
  } : {};

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      style={primaryStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
