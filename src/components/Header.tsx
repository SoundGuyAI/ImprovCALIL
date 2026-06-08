"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Calendar, Users, FilePlus, ShieldAlert, Languages } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { isUserAdmin } from "@/lib/permissions";
import ProfileMenu from "@/components/auth/ProfileMenu";

export default function Header() {
  const t = useTranslations("Navigation");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuth();
  const isAdminUser = isUserAdmin(profile);

  const switchLocale = () => {
    const nextLocale = locale === "en" ? "he" : "en";
    router.replace(pathname, { locale: nextLocale });
  };

  const navItems = [
    { href: "/", label: t("calendar"), icon: Calendar },
    { href: "/organizers", label: t("organizers"), icon: Users },
    { href: "/submit", label: t("submit"), icon: FilePlus },
    ...(isAdminUser ? [{ href: "/admin", label: t("admin"), icon: ShieldAlert }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            locale={locale}
            data-locale={locale}
            className="flex items-center gap-2 group"
          >
            <span className="text-xl sm:text-2xl font-black tracking-tight text-gradient bg-gradient-primary pulse-hover">
              {tCommon("logo")}
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1 rtl:space-x-reverse items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-zinc-800/80 text-white border-b-2 border-indigo-500 shadow-md shadow-indigo-500/10"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"}`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions (Language Switcher & Profile) */}
          <div className="flex items-center gap-2">
            <button
              onClick={switchLocale}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all text-xs sm:text-sm font-semibold cursor-pointer"
            >
              <Languages className="w-4 h-4 text-indigo-400" />
              <span>{locale === "en" ? "עברית" : "English"}</span>
            </button>
            <ProfileMenu />
          </div>
        </div>

        {/* Mobile Navigation Footer Bar for small screens */}
        <div className="flex md:hidden justify-around py-2 border-t border-zinc-900/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                  isActive ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
