"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Header from "@/components/Header";
import LoginForm from "@/components/auth/LoginForm";

function LoginPageContent() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? undefined;

  return <LoginForm locale={locale} nextPath={nextPath} />;
}

export default function LoginPage() {
  const t = useTranslations("auth.profileMenu");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header />
      <main className="mx-auto max-w-md px-4 py-10">
        <Suspense fallback={<p className="text-center text-sm text-zinc-400">{t("loading")}</p>}>
          <LoginPageContent />
        </Suspense>
      </main>
    </div>
  );
}
