"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function PaperCrumbleAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"falling" | "done">("falling");

  useEffect(() => {
    // After 2.2s the paper reaches the bottom and animation ends
    const t = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 2200);
    return () => clearTimeout(t);
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {/* Gradient overlay that follows the paper */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(90,71,177,0.15) 0%, rgba(136,117,214,0.08) 50%, transparent 100%)",
          animation: "gradientSweep 2.2s ease-in forwards",
        }}
      />

      {/* The crumpled paper ball */}
      <div
        className="absolute left-1/2"
        style={{
          animation: "paperFall 2.2s cubic-bezier(0.25, 0.1, 0.25, 1) forwards",
          transform: "translateX(-50%) translateY(-120px)",
          filter: "drop-shadow(0 0 30px rgba(136,117,214,0.6)) drop-shadow(0 0 60px rgba(90,71,177,0.4))",
        }}
      >
        {/* Rotation wrapper */}
        <div style={{ animation: "paperSpin 2.2s ease-in forwards", transformOrigin: "center center" }}>
          <Image
            src="/logo.png"
            alt="paper crumbling"
            width={120}
            height={120}
            className="object-contain"
            style={{ opacity: 0.95 }}
          />
        </div>
      </div>

      {/* Purple glow trail */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          width: "200px",
          height: "200px",
          background: "radial-gradient(ellipse, rgba(136,117,214,0.4) 0%, transparent 70%)",
          animation: "glowTrail 2.2s ease-in forwards",
          top: "-100px",
          borderRadius: "50%",
          filter: "blur(20px)",
        }}
      />

      <style>{`
        @keyframes paperFall {
          0%   { transform: translateX(-50%) translateY(-120px); }
          20%  { transform: translateX(-48%) translateY(8vh); }
          40%  { transform: translateX(-52%) translateY(22vh); }
          60%  { transform: translateX(-49%) translateY(45vh); }
          80%  { transform: translateX(-51%) translateY(70vh); }
          100% { transform: translateX(-50%) translateY(110vh); }
        }

        @keyframes paperSpin {
          0%   { transform: rotate(0deg) scale(1); }
          30%  { transform: rotate(120deg) scale(0.92); }
          60%  { transform: rotate(260deg) scale(0.85); }
          80%  { transform: rotate(400deg) scale(0.78); }
          100% { transform: rotate(540deg) scale(0.6); }
        }

        @keyframes glowTrail {
          0%   { top: -100px; opacity: 0.8; }
          20%  { top: calc(8vh - 100px); opacity: 0.7; }
          40%  { top: calc(22vh - 100px); opacity: 0.6; }
          60%  { top: calc(45vh - 100px); opacity: 0.4; }
          80%  { top: calc(70vh - 100px); opacity: 0.2; }
          100% { top: calc(110vh - 100px); opacity: 0; }
        }

        @keyframes gradientSweep {
          0%   { opacity: 0; transform: translateY(-100%); }
          15%  { opacity: 1; transform: translateY(-60%); }
          50%  { opacity: 0.8; transform: translateY(0%); }
          100% { opacity: 0; transform: translateY(60%); }
        }
      `}</style>
    </div>
  );
}
