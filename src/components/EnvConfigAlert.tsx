"use client";

import React from "react";
import { useLocale } from "next-intl";
import { Database } from "lucide-react";
import { isMock } from "@/lib/firebase";

export default function EnvConfigAlert() {
  const locale = useLocale();

  if (!isMock) {
    return null;
  }

  const message =
    locale === "he"
      ? "שים לב: המערכת פועלת במצב הדגמה עם נתונים מדומים. (קוד: MOCK_DATA_MODE)"
      : "Notice: Running in Demo Mode with simulated data. (Code: MOCK_DATA_MODE)";

  return (
    <div className="w-full bg-red-950/40 border-b border-red-500/20 px-4 py-2 text-center text-xs font-semibold text-red-200 flex items-center justify-center gap-2 backdrop-blur-md sticky top-0 z-50 animate-fadeIn select-none">
      <Database className="w-3.5 h-3.5 text-red-400 animate-pulse shrink-0" />
      <span>{message}</span>
    </div>
  );
}
