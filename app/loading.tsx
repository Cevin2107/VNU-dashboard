"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        {/* Animated spinner */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 dark:border-gray-700 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        
        {/* Loading text */}
        <div className="text-center">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
            Đang tải...
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    </div>
  );
}