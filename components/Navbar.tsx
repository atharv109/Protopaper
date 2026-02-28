"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10"
      style={{ background: "rgba(1,1,4,0.8)" }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 relative">
            <Image src="/logo.png" alt="proto paper logo" fill className="object-contain" />
          </div>
          <span className="font-display text-xl tracking-wide text-light/90 group-hover:text-light transition-colors">
            proto <span className="text-lavender">paper</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-2">
          <Link href="/about"
            className="px-4 py-2 text-sm text-muted hover:text-light transition-colors rounded-lg hover:bg-white/5">
            About
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/experiments"
                className="px-4 py-2 text-sm text-lavender hover:text-light transition-colors rounded-lg hover:bg-white/5">
                My Experiments
              </Link>
              <button onClick={handleLogout}
                className="px-4 py-2 text-sm text-muted hover:text-light transition-colors rounded-lg hover:bg-white/5">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login"
              className="px-5 py-2 text-sm rounded-xl glow-btn transition-all font-medium"
              style={{
                background: "linear-gradient(135deg, #5A47B1, #8875D6)",
                color: "#FEFEFE",
              }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
