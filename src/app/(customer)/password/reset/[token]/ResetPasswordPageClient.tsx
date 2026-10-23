"use client";

import { use } from "react";
import ResetPasswordView from "@/components/customer/auth/ResetPasswordView";

interface ResetPageProps {
  params: Promise<{ token: string }>;
}

export default function DeepLinkResetPasswordPage({ params }: ResetPageProps) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const handleSuccessRedirect = () => {
    window.location.href = "/login";
  };

  return (
    <section
      style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(160deg, #f0fdf4 0%, #dcfce7 35%, #fcfdfc 70%)",
        padding: "80px 24px 40px", position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: "10%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: "rgba(22, 163, 74, 0.05)", filter: "blur(64px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "5%", left: "-8%", width: 400, height: 400, borderRadius: "50%", background: "rgba(2, 44, 34, 0.03)", filter: "blur(64px)", pointerEvents: "none" }} />
      <div style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 10 }}>
        <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 24, padding: "40px 32px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05)" }}>
          <ResetPasswordView token={token} onSuccessRedirect={handleSuccessRedirect} />
        </div>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .auth-input { width: 100%; outline: none; border: 1px solid #e5e7eb; border-radius: 12px; padding: 13px 14px 13px 44px; font-size: 14px; color: #1c1c1c; background: transparent; transition: all 0.2s ease; }
        .auth-input:focus { border-color: rgba(22, 163, 74, 0.4); box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.05); }
        .auth-submit-btn { width: 100%; background: #16a34a; border: none; color: #ffffff; padding: 14px; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s ease-in-out; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2); }
        .auth-submit-btn:hover { background: #15803d; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(22, 163, 74, 0.3); }
      `}</style>
    </section>
  );
}
