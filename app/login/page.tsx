"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    login();
    router.push("/experiments");
  };

  const inputStyle = {
    background: "rgba(1,1,4,0.6)",
    border: "1px solid rgba(254,254,254,0.1)",
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "rgba(90,71,177,0.7)";
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "rgba(254,254,254,0.1)";
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-15"
          style={{ background: "radial-gradient(ellipse, #5A47B1 0%, transparent 70%)" }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-light mb-2">Welcome back</h1>
          <p className="text-muted text-sm">Sign in to access your experiments</p>
        </div>

        <div className="rounded-2xl p-8 card-border"
          style={{ background: "rgba(29,19,96,0.25)" }}>
          <form onSubmit={handleSignIn} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs text-lavender mb-2 tracking-wide uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@research.ai"
                required
                className="w-full rounded-xl px-4 py-3.5 text-sm text-light placeholder-muted outline-none transition-all"
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>

            <div>
              <label className="block text-xs text-lavender mb-2 tracking-wide uppercase">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl px-4 py-3.5 text-sm text-light placeholder-muted outline-none transition-all"
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-4 text-base mt-2"
              loading={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted mt-6">
            No account?{" "}
            <span className="text-lavender cursor-pointer hover:text-light transition-colors"
              onClick={() => { login(); router.push("/experiments"); }}>
              Continue as demo user →
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
