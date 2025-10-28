"use client";
import HomeContent from "../homeContent";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Content */}
      <div className="relative z-10">
        <HomeContent />
      </div>
    </div>
  );
}