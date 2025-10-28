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
    
    // Giảm delay để chuyển nhanh hơn
    setTimeout(() => {
      setLoading(false);
      if (password === "Anhquan210706") {
        // Chỉ set flag để cho phép truy cập trang login, không set auth hoàn toàn
        sessionStorage.setItem("welcome-passed", "ok");
        router.push("/login");
      } else {
        setError("Mật khẩu không đúng!");
      }
    }, 100);
  };

  return (
    <div>
      {/* Fullscreen overlay to block the entire app (including sidebar) */}
      <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-gradient-to-br from-sky-50/60 via-white/30 to-violet-50/60 overflow-hidden">
        {/* Decorative blurred shapes */}
        <div className="absolute -left-16 -top-16 w-64 h-64 bg-gradient-to-br from-indigo-200/30 to-cyan-200/30 rounded-full filter blur-3xl opacity-60" />
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-gradient-to-br from-pink-200/30 to-yellow-200/20 rounded-full filter blur-3xl opacity-50" />

        <div className="relative w-full max-w-lg px-4 py-8 animate-fadeInUp">
          <div className="absolute inset-0 rounded-3xl glass -z-10" />
          <div className="relative glass rounded-3xl p-6 shadow-2xl">
            {/* Header with Icon */}
            <div className="text-center mb-6 animate-slideInLeft" style={{ animationDelay: '0.2s' }}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                VNU Dashboard
              </h1>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
                Ứng dụng quản lý dành cho sinh viên VNU
              </p>
            </div>

            {/* Welcome Content */}
            <div className="text-center mb-6 animate-slideInLeft" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Chào mừng đến với VNU Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Ứng dụng dành cho sinh viên — nhập mật khẩu để tiếp tục trải nghiệm
              </p>
            </div>

            {/* Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm mx-auto animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
              <div>
                <label htmlFor="welcome-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mật khẩu truy cập
                </label>
                <div className="relative">
                  <input
                    id="welcome-password"
                    type="password"
                    placeholder="Nhập mật khẩu..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    className="w-full px-4 py-3 pl-12 rounded-xl glass-input border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    required
                    disabled={loading}
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed btn-hover animate-pulse"
                style={{ animationDelay: '0.8s' }}
              >
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Tiếp tục
                </div>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-white/20 dark:border-gray-700/30 animate-fadeInUp" style={{ animationDelay: '1s' }}>
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Liên hệ admin nếu bạn gặp vấn đề đăng nhập
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}