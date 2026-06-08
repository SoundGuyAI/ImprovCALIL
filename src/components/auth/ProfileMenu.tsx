"use client";

import React, { useState } from "react";
import { Home, LogIn, LogOut, Settings, UserCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useAuth } from "@/components/auth/AuthProvider";

export default function ProfileMenu() {
  const t = useTranslations("auth.profileMenu");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const name = profile?.displayName ?? profile?.email ?? user?.displayName ?? user?.email;
  const next = `/${locale}${pathname === "/" ? "" : pathname}`;
  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    router.refresh();
  };

  if (!user && !loading) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(next)}`}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300 hover:text-zinc-100 transition-all text-xs font-medium"
      >
        <LogIn className="w-3.5 h-3.5 text-indigo-400" />
        <span>{t("signIn")}</span>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300 hover:text-zinc-100 transition-all text-xs font-medium"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <UserCircle className="w-3.5 h-3.5 text-indigo-400" />
        <span>{loading ? t("loading") : (name ?? t("account"))}</span>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute end-0 z-20 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl"
        >
          <div className="px-3 py-2 border-b border-zinc-900 mb-1">
            <p className="text-xs font-semibold text-zinc-100 truncate">{name ?? t("account")}</p>
            {profile?.isAdmin ? (
              <p className="text-[10px] uppercase tracking-wider text-indigo-400 mt-1">
                {t("admin")}
              </p>
            ) : null}
          </div>
          <Link
            href="/"
            role="menuitem"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
          >
            <Home className="w-3.5 h-3.5" />
            {t("home")}
          </Link>
          <Link
            href="/profile"
            role="menuitem"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
          >
            <Settings className="w-3.5 h-3.5" />
            {t("profile")}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => void handleSignOut()}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t("signOut")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
