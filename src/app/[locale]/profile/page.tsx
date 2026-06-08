"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import Header from "@/components/Header";
import { useAuth } from "@/components/auth/AuthProvider";
import DeleteAccountPanel from "@/components/auth/DeleteAccountPanel";
import { Link, useRouter } from "@/i18n/routing";

export default function ProfilePage() {
  const t = useTranslations("auth.profile");
  const tEdit = useTranslations("auth.profileEdit");
  const tMenu = useTranslations("auth.profileMenu");
  const locale = useLocale();
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(`/${locale}/profile`)}`);
    }
  }, [loading, locale, user, router]);

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <Header />
        <main className="mx-auto max-w-md px-4 py-10">
          <p className="text-center text-sm text-zinc-400">{tMenu("loading")}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header />
      <main className="mx-auto max-w-md space-y-6 px-4 py-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-zinc-400">{t("subtitle")}</p>
        </div>

        <dl className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-zinc-500">
              {tEdit("displayName")}
            </dt>
            <dd className="mt-1 text-sm">{profile.displayName || t("empty")}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-zinc-500">
              {t("email")}
            </dt>
            <dd className="mt-1 text-sm">{profile.email || t("empty")}</dd>
          </div>
        </dl>

        <Link
          href="/profile/edit"
          className="inline-flex w-full items-center justify-center rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
        >
          {t("edit")}
        </Link>

        <DeleteAccountPanel profile={profile} />
      </main>
    </div>
  );
}
