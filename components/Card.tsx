import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export default function Card({ children, className = "", glow }: CardProps) {
  return (
    <div
      className={`rounded-2xl p-6 ${glow ? "glow-border" : "card-border"} ${className}`}
      style={{ background: "rgba(29, 19, 96, 0.3)" }}
    >
      {children}
    </div>
  );
}
