"use client";

// Bilingual language switcher ported from Improv Dashboard
import React, { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Common");
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const switchLocale = (nextLocale: "en" | "he") => {
    if (nextLocale === locale) {
      setIsOpen(false);
      return;
    }
    router.replace(pathname, { locale: nextLocale });
    setIsOpen(false);
  };

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!containerRef.current?.contains(event.relatedTarget as Node)) {
      setIsOpen(false);
    }
  };

  const activeLang =
    locale === "en"
      ? { code: "en", label: t("english"), flag: "🇺🇸" }
      : { code: "he", label: t("hebrew"), flag: "🇮🇱" };

  return (
    <div
      className="relative inline-block text-left rtl:text-right"
      ref={containerRef}
      onBlur={handleBlur}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300 hover:text-zinc-100 transition-all text-xs font-medium active:scale-95 shadow-sm"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={t("language")}
      >
        <span className="text-sm leading-none" aria-hidden="true">
          {activeLang.flag}
        </span>
        <span>{activeLang.label}</span>
        <svg
          className={`w-3 h-3 transition-transform text-zinc-500 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div
          className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-36 origin-top-right rtl:origin-top-left rounded-xl border border-zinc-800 bg-zinc-950 p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in slide-in-from-top-1 duration-100"
          role="menu"
          aria-orientation="vertical"
        >
          <button
            onClick={() => switchLocale("en")}
            className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-lg text-left rtl:text-right transition-colors ${
              locale === "en"
                ? "bg-zinc-900 text-zinc-100"
                : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
            }`}
            role="menuitem"
            dir="ltr"
          >
            <span className="text-sm leading-none" aria-hidden="true">
              🇺🇸
            </span>
            <span>{t("englishNative")}</span>
          </button>
          <button
            onClick={() => switchLocale("he")}
            className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-lg text-right rtl:text-right transition-colors ${
              locale === "he"
                ? "bg-zinc-900 text-zinc-100"
                : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
            }`}
            role="menuitem"
            dir="rtl"
          >
            <span className="text-sm leading-none" aria-hidden="true">
              🇮🇱
            </span>
            <span>{t("hebrewNative")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
