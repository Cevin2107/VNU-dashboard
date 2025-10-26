"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (password === "Anhquan210706") {
        sessionStorage.setItem("vnu-dashboard-auth", "ok");
        router.push("/login");
      } else {
        setError("Mật khẩu không đúng!");
      }
    }, 450);
  };

  return (
    <div>
      {/* Fullscreen overlay to block the entire app (including sidebar) */}
      <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-gradient-to-br from-sky-50/60 via-white/30 to-violet-50/60 backdrop-blur-sm">
        {/* Decorative blurred shapes */}
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-gradient-to-br from-indigo-200/30 to-cyan-200/30 rounded-full filter blur-3xl opacity-60" />
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-gradient-to-br from-pink-200/30 to-yellow-200/20 rounded-full filter blur-3xl opacity-50" />

        <div className="relative w-full max-w-3xl p-6">
          <div className="absolute inset-0 rounded-3xl bg-white/6 backdrop-blur-xl border border-white/20 shadow-2xl -z-10" />
          <div className="relative bg-white/30 backdrop-blur-3xl border border-white/25 rounded-3xl p-10 shadow-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-black text-center">Chào mừng đến với VNU Dashboard</h1>
            <p className="text-sm text-black/70 text-center mt-2 mb-6">Ứng dụng dành cho sinh viên — nhập mật khẩu để tiếp tục.</p>

            <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto flex flex-col gap-4">
              <input
                id="welcome-password"
                type="password"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full px-4 py-3 rounded-lg bg-white/80 text-black border border-black/10 placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-shadow duration-200"
              />

              {error && <div className="text-red-600 text-center text-sm animate-shake">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex items-center justify-center gap-2 w-full rounded-lg py-3 bg-gradient-to-r from-indigo-500 to-cyan-400 text-black font-semibold shadow-md hover:scale-[1.02] transition-transform duration-200 disabled:opacity-60"
              >
                {loading ? "Đang kiểm tra..." : "Tiếp tục"}
              </button>
            </form>

            <div className="mt-6 text-xs text-black/60 text-center">Liên hệ admin nếu bạn gặp vấn đề đăng nhập.</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-8px); }
          40%, 60% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.45s; }
      `}</style>
    </div>
  );
}