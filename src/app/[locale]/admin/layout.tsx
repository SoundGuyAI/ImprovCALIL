import React from "react";
import { getCurrentProfile } from "@/lib/auth/server";
import { isUserAdmin } from "@/lib/permissions";
import { ShieldAlert, KeyRound } from "lucide-react";
import Header from "@/components/Header";
import { AdminClientGate } from "@/components/admin/AdminClientGate";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  const devBypass =
    (process.env.NODE_ENV === "development" || process.env.ALLOW_DEV_BYPASS === "true") &&
    process.env.NEXT_PUBLIC_ADMIN_DEV_UID === "admin-test";
  const isAdmin = devBypass || isUserAdmin(profile);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-sm">
            <div className="mx-auto w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
              <ShieldAlert className="w-8 h-8 text-red-400" />
            </div>

            {/* English Gating Message */}
            <div className="mb-6 pb-6 border-b border-zinc-800">
              <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
              <p className="text-zinc-400 text-sm leading-relaxed">
                This page is restricted to administrators only. You must be signed in with an
                authorized administrator account to view this console.
              </p>
            </div>

            {/* Hebrew Gating Message */}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-white mb-2">הגישה נדחתה</h1>
              <p className="text-zinc-400 text-sm leading-relaxed">
                דף זה מוגבל למנהלי מערכת בלבד. עליך להתחבר עם חשבון מנהל מורשה כדי לצפות בלוח הבקרה.
              </p>
            </div>

            {/* Local Development Bypass instructions */}
            <div className="bg-zinc-950/80 border border-zinc-850 rounded-xl p-4 text-left font-mono text-xs text-zinc-500 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 font-sans font-bold text-zinc-400 uppercase text-[10px]">
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dev Bypass Instructions</span>
              </div>
              <p className="leading-relaxed text-[10px]">
                To bypass this locally, copy your Firebase UID and add it to your local environment
                file:
              </p>
              <code className="bg-zinc-900 border border-zinc-800 p-1.5 rounded text-[10px] text-zinc-300 block select-all">
                {'NEXT_PUBLIC_ADMIN_DEV_UID="your-uid-here"'}
              </code>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return <AdminClientGate>{children}</AdminClientGate>;
}
