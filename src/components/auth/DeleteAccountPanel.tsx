"use client";

import React, { FormEvent, useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/auth/AuthProvider";
import type { AuthProfile } from "@/types/auth";

type DeleteStep = "email" | "confirmOne" | "confirmTwo" | "deleting";

export default function DeleteAccountPanel({ profile }: { profile: AuthProfile }) {
  const t = useTranslations("auth.deleteAccount");
  const { deleteAccount } = useAuth();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<DeleteStep>("email");
  const [error, setError] = useState<string | null>(null);

  const handleEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!profile.email || email.trim().toLowerCase() !== profile.email.toLowerCase()) {
      setError(t("emailMismatch"));
      return;
    }
    setStep("confirmOne");
  };

  const handleDelete = async () => {
    setError(null);
    setStep("deleting");
    try {
      await deleteAccount(email);
      window.location.assign(`/${profile.locale}`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t("genericError"));
      setStep("email");
    }
  };

  return (
    <section className="rounded-2xl border border-red-500/30 bg-red-950/20 p-6">
      <div className="mb-5 flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-red-300" />
        <div>
          <h2 className="text-lg font-bold text-red-100">{t("title")}</h2>
          <p className="mt-1 text-sm leading-relaxed text-red-200/75">{t("subtitle")}</p>
        </div>
      </div>

      {step === "email" ? (
        <form className="space-y-4" onSubmit={handleEmail}>
          <label className="block">
            <span className="text-xs font-semibold text-red-100">{t("emailLabel")}</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="mt-1 w-full rounded-xl border border-red-500/30 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors focus:border-red-400"
            />
          </label>
          <DeleteError error={error} />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-100 transition-colors hover:bg-red-500/20"
          >
            <Trash2 className="h-4 w-4" />
            {t("start")}
          </button>
        </form>
      ) : null}

      {step === "confirmOne" ? (
        <div className="space-y-4">
          <p className="text-sm text-red-100">{t("confirmOne")}</p>
          <button
            type="button"
            onClick={() => setStep("confirmTwo")}
            className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-100 transition-colors hover:bg-red-500/20"
          >
            {t("confirmOneAction")}
          </button>
        </div>
      ) : null}

      {step === "confirmTwo" || step === "deleting" ? (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-red-100">{t("confirmTwo")}</p>
          <button
            type="button"
            disabled={step === "deleting"}
            onClick={() => void handleDelete()}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {step === "deleting" ? t("deleting") : t("confirmTwoAction")}
          </button>
          <DeleteError error={error} />
        </div>
      ) : null}
    </section>
  );
}

function DeleteError({ error }: { error: string | null }) {
  return error ? (
    <p
      role="alert"
      className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-100"
    >
      {error}
    </p>
  ) : null;
}
