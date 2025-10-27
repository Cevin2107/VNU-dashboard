"use client";

import { useEffect, useState } from "react";

export default function AuthDebug() {
  const [authState, setAuthState] = useState({
    hasAuth: false,
    hasAccessToken: false,
    pathname: "",
    timestamp: ""
  });

  useEffect(() => {
    const updateAuthState = () => {
      setAuthState({
        hasAuth: sessionStorage.getItem("vnu-dashboard-auth") === "ok",
        hasAccessToken: sessionStorage.getItem("accessToken") !== null,
        pathname: window.location.pathname,
        timestamp: new Date().toLocaleTimeString()
      });
    };

    updateAuthState();
    
    // Update every second
    const interval = setInterval(updateAuthState, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-[9999]">
      <div className="font-bold mb-2">Auth Debug</div>
      <div>Auth: {authState.hasAuth ? "✅" : "❌"}</div>
      <div>Token: {authState.hasAccessToken ? "✅" : "❌"}</div>
      <div>Path: {authState.pathname}</div>
      <div>Time: {authState.timestamp}</div>
      <button
        onClick={() => {
          console.log("SessionStorage:", {
            auth: sessionStorage.getItem("vnu-dashboard-auth"),
            token: sessionStorage.getItem("accessToken"),
            refreshToken: sessionStorage.getItem("refreshToken")
          });
        }}
        className="mt-2 px-2 py-1 bg-blue-500 rounded text-xs"
      >
        Log Storage
      </button>
    </div>
  );
}

