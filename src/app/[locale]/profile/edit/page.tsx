"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Header from "@/components/Header";
import ProfileEditForm from "@/components/auth/ProfileEditForm";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "@/i18n/routing";

function ProfileEditPageContent() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? undefined;
  const { profile } = useAuth();

  if (!profile) {
    return null;
  }

  return <ProfileEditForm profile={profile} nextPath={nextPath} />;
}

export default function ProfileEditPage() {
  const t = useTranslations("auth.profileMenu");
  const locale = useLocale();
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(`/${locale}/profile/edit`)}`);
    }
  }, [loading, locale, user, router]);

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <Header />
        <main className="mx-auto max-w-md px-4 py-10">
          <p className="text-center text-sm text-zinc-400">{t("loading")}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header />
      <main className="mx-auto max-w-md px-4 py-10">
        <Suspense
          fallback={
            <p className="text-center text-sm text-zinc-400">{t("loading")}</p>
          }
        >
          <ProfileEditPageContent />
        </Suspense>
      </main>
    </div>
  );
}
