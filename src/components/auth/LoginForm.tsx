"use client";

import React, { FormEvent, useState } from "react";
import { ArrowLeft, KeyRound, Mail, Sparkles, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { resolveSafeNextPath } from "@/lib/auth/redirect";
import { useAuth } from "@/components/auth/AuthProvider";

type LoginStep = "email" | "password" | "register" | "googleOnly";
type EmailStatus = "password" | "register" | "googleOnly";

export default function LoginForm({ locale, nextPath }: { locale: string; nextPath?: string }) {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const { signInWithGoogle, signInWithEmail, registerWithEmail } = useAuth();
  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const redirectTo = resolveSafeNextPath(nextPath, locale);

  const complete = () => {
    window.location.assign(redirectTo);
  };

  const handleGoogle = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
      complete();
    } catch {
      setError(t("genericError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailLookup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/email-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (response.status === 429) {
        setError(t("rateLimitError"));
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to look up email status.");
      }

      const data = (await response.json()) as { status?: EmailStatus };
      setStep(data.status ?? "register");
    } catch {
      setError(t("genericError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
      complete();
    } catch {
      setError(t("genericError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (password !== passwordConfirm) {
      setError(t("passwordMismatch"));
      return;
    }
    setSubmitting(true);
    try {
      await registerWithEmail(email, password);
      router.replace(`/profile/edit?next=${encodeURIComponent(redirectTo)}`);
    } catch (nextError) {
      if (getFirebaseErrorCode(nextError) === "auth/email-already-in-use") {
        setStep("password");
        setError(t("existingAccountHint"));
        return;
      }
      if (getFirebaseErrorCode(nextError) === "auth/configuration-not-found") {
        setError(t("firebaseConfigError"));
        return;
      }
      setError(t("genericError"));
    } finally {
      setSubmitting(false);
    }
  };

  const resetEmail = () => {
    setStep("email");
    setPassword("");
    setPasswordConfirm("");
    setError(null);
  };

  const emailSummary =
    step === "email" ? null : (
      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-300">
        <span className="truncate">{email}</span>
        <button
          type="button"
          onClick={resetEmail}
          className="inline-flex shrink-0 items-center gap-1 text-indigo-300 hover:text-indigo-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("changeEmail")}
        </button>
      </div>
    );

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          {t("eyebrow")}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{t("title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">{t("subtitle")}</p>
      </div>

      {emailSummary}

      <button
        type="button"
        onClick={() => void handleGoogle()}
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-100 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {t("google")}
      </button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-800" />
        <span className="text-xs font-medium text-zinc-500">{t("or")}</span>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      {step === "email" ? (
        <form className="space-y-4" onSubmit={(event) => void handleEmailLookup(event)}>
          <EmailField email={email} setEmail={setEmail} label={t("email")} />
          <AuthError error={error} />
          <SubmitButton submitting={submitting} icon={<Mail className="h-4 w-4" />}>
            {t("continue")}
          </SubmitButton>
        </form>
      ) : null}

      {step === "password" ? (
        <form className="space-y-4" onSubmit={(event) => void handlePasswordLogin(event)}>
          <PasswordField
            password={password}
            setPassword={setPassword}
            label={t("password")}
            autoComplete="current-password"
          />
          <AuthError error={error} />
          <SubmitButton submitting={submitting} icon={<KeyRound className="h-4 w-4" />}>
            {t("signIn")}
          </SubmitButton>
        </form>
      ) : null}

      {step === "register" ? (
        <form className="space-y-4" onSubmit={(event) => void handleRegister(event)}>
          <p className="text-sm text-zinc-400">{t("newAccountHint")}</p>
          <PasswordField
            password={password}
            setPassword={setPassword}
            label={t("password")}
            autoComplete="new-password"
          />
          <PasswordField
            password={passwordConfirm}
            setPassword={setPasswordConfirm}
            label={t("passwordConfirm")}
            autoComplete="new-password"
          />
          <p className="text-xs leading-relaxed text-zinc-500">{t("profileDetailsHint")}</p>
          <AuthError error={error} />
          <SubmitButton submitting={submitting} icon={<UserPlus className="h-4 w-4" />}>
            {t("register")}
          </SubmitButton>
        </form>
      ) : null}

      {step === "googleOnly" ? (
        <div className="space-y-4">
          <p className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-sm text-indigo-100">
            {t("googleOnly")}
          </p>
          <AuthError error={error} />
        </div>
      ) : null}
    </div>
  );
}

function getFirebaseErrorCode(error: unknown): string | null {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : null;
  }
  return null;
}

function EmailField({
  email,
  setEmail,
  label,
}: {
  email: string;
  setEmail: (value: string) => void;
  label: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-zinc-300">{label}</span>
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        autoComplete="email"
        className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors focus:border-indigo-500"
      />
    </label>
  );
}

function PasswordField({
  password,
  setPassword,
  label,
  autoComplete,
}: {
  password: string;
  setPassword: (value: string) => void;
  label: string;
  autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-zinc-300">{label}</span>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        minLength={6}
        autoComplete={autoComplete}
        className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors focus:border-indigo-500"
      />
    </label>
  );
}

function AuthError({ error }: { error: string | null }) {
  return error ? (
    <p
      role="alert"
      className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200"
    >
      {error}
    </p>
  ) : null;
}

function SubmitButton({
  children,
  submitting,
  icon,
}: {
  children: React.ReactNode;
  submitting: boolean;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-900/30 transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {icon}
      {children}
    </button>
  );
}
