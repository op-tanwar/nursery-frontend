"use client";

import { useState } from "react";
import LoginView from "@/components/customer/auth/LoginView";
import SignUpView from "@/components/customer/auth/SignUpView";
import ForgotPasswordView from "@/components/customer/auth/ForgotPasswordView";
import ResetPasswordView from "@/components/customer/auth/ResetPasswordView";
import { useAuthSessionCleanup } from "@/hooks/useAuthSessionCleanup";

type ScreenState = "auth-tabs" | "forgot" | "reset";
type TabState = "login" | "signup";

export default function AuthPageIndex() {
  const [screen, setScreen] = useState<ScreenState>("auth-tabs");
  const [activeTab, setActiveTab] = useState<TabState>("login");
  const [resetToken, setResetToken] = useState<string>("");

  // Clean up any stale/expired session when landing on Auth pages
  const { isSessionExpired } = useAuthSessionCleanup();

  const handleTokenReceived = (token: string) => {
    setResetToken(token);
    setScreen("reset");
  };

  const handleResetSuccess = () => {
    setResetToken("");
    setScreen("auth-tabs");
    setActiveTab("login");
  };

  return (
    <section className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-50 via-green-100/50 to-emerald-50/30 px-6 py-20 relative overflow-hidden">
      <div className="absolute top-[10%] -right-[5%] w-[500px] h-[500px] rounded-full bg-green-600/5 blur-[64px] pointer-events-none" />
      <div className="absolute bottom-[5%] -left-[8%] w-[400px] h-[400px] rounded-full bg-teal-900/5 blur-[64px] pointer-events-none" />
      <div className="w-full max-w-[460px] relative z-10">
        <div className="bg-white border border-black/[0.06] rounded-3xl px-8 py-10 shadow-xl shadow-black/[0.03]">
          {screen === "auth-tabs" && (
            <>
              <div className="flex bg-black/[0.03] p-1 rounded-2xl mb-8">
                <button type="button" onClick={() => setActiveTab("login")}
                  className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer border-none ${activeTab === "login" ? "bg-white text-green-600 shadow-md shadow-black/[0.05]" : "bg-transparent text-gray-500 hover:text-gray-900"}`}>
                  Log In
                </button>
                <button type="button" onClick={() => setActiveTab("signup")}
                  className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer border-none ${activeTab === "signup" ? "bg-white text-green-600 shadow-md shadow-black/[0.05]" : "bg-transparent text-gray-500 hover:text-gray-900"}`}>
                  Sign Up
                </button>
              </div>
              {activeTab === "login" ? (
                <LoginView onForgotPassword={() => setScreen("forgot")} isSessionExpired={isSessionExpired} />
              ) : (
                <SignUpView />
              )}
            </>
          )}
          {screen === "forgot" && (
            <ForgotPasswordView onBackToLogin={() => setScreen("auth-tabs")} onTokenReceived={handleTokenReceived} />
          )}
          {screen === "reset" && (
            <ResetPasswordView token={resetToken} onSuccessRedirect={handleResetSuccess} />
          )}
        </div>
      </div>
    </section>
  );
}
