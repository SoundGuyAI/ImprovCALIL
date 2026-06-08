"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import Header from "@/components/Header";

export default function PrivacyPolicyPage() {
  const t = useTranslations("privacy");
  const tCommon = useTranslations("Common");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Header />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors self-start font-medium"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>{t("backToHome")}</span>
        </Link>

        {/* Header Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-indigo-400">
            <ShieldCheck className="w-8 h-8 animate-pulse" />
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{t("title")}</h1>
          </div>
          <p className="text-zinc-500 text-xs font-semibold">{t("lastUpdated")}</p>
        </div>

        {/* Content Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-zinc-900 bg-zinc-900/40 backdrop-blur-sm flex flex-col gap-6 text-sm leading-relaxed text-zinc-300">
          <p>{t("intro")}</p>

          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-bold text-white mb-2">{t("section1Title")}</h2>
              <p>{t("section1Content")}</p>
            </div>

            <div>
              <h2 className="text-base font-bold text-white mb-2">{t("section2Title")}</h2>
              <p>{t("section2Content")}</p>
            </div>

            <div>
              <h2 className="text-base font-bold text-white mb-2">{t("section3Title")}</h2>
              <p>{t("section3Content")}</p>
            </div>

            <div>
              <h2 className="text-base font-bold text-white mb-2">{t("section4Title")}</h2>
              <p>{t("section4Content")}</p>
            </div>

            <div>
              <h2 className="text-base font-bold text-white mb-2">{t("section5Title")}</h2>
              <p>{t("section5Content")}</p>
            </div>

            <div>
              <h2 className="text-base font-bold text-white mb-2">{t("section6Title")}</h2>
              <p>{t("section6Content")}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900/80 bg-zinc-950 py-6 text-center text-xs text-zinc-500 font-semibold mt-12">
        <p className="max-w-7xl mx-auto px-4">{tCommon("footer")}</p>
      </footer>
    </div>
  );
}
