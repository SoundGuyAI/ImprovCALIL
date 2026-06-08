"use client";

import React, { FormEvent, useState } from "react";
import { Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/auth/AuthProvider";
import { normalizeUsername } from "@/lib/auth/profile";
import { isSafeLocalizedPath, resolveSafeNextPath } from "@/lib/auth/redirect";
import type { AuthProfile, ProfileLink } from "@/types/auth";

function linksToText(links: ProfileLink[]): string {
  return links.map((link) => `${link.label} | ${link.url}`).join("\n");
}

function textToLinks(value: string): ProfileLink[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...urlParts] = line.split("|");
      return {
        label: label.trim(),
        url: urlParts.join("|").trim(),
      };
    });
}

export default function ProfileEditForm({
  profile,
  nextPath = "/profile",
}: {
  profile: AuthProfile;
  nextPath?: string;
}) {
  const t = useTranslations("auth.profileEdit");
  const { refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  const [username, setUsername] = useState(profile.username ?? "");
  const [usernameValidationError, setUsernameValidationError] = useState<string | null>(null);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [linksText, setLinksText] = useState(linksToText(profile.links));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const storedUsername = profile.username ?? "";
  const redirectPath = resolveSafeNextPath(
    isSafeLocalizedPath(nextPath) ? nextPath : `/${profile.locale}${nextPath}`,
    profile.locale
  );

  const handleUsernameChange = (val: string) => {
    setUsername(val);
    if (val === storedUsername || val.trim() === storedUsername.trim()) {
      setUsernameValidationError(null);
      return;
    }
    if (val.trim() === "") {
      setUsernameValidationError(null);
    } else {
      const normalized = normalizeUsername(val);
      if (!normalized) {
        setUsernameValidationError(t("usernameError"));
      } else {
        setUsernameValidationError(null);
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const isUsernameChanged =
      username !== storedUsername && username.trim() !== storedUsername.trim();
    if (isUsernameChanged) {
      if (username.trim() !== "") {
        const normalized = normalizeUsername(username);
        if (!normalized) {
          setUsernameValidationError(t("usernameError"));
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          username: isUsernameChanged
            ? username.trim() === ""
              ? ""
              : (normalizeUsername(username) ?? "")
            : storedUsername,
          phone,
          bio,
          links: textToLinks(linksText),
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? t("genericError"));
      }

      await refreshProfile();
      window.location.assign(redirectPath);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : t("genericError"));
    } finally {
      setSubmitting(false);
    }
  };

  const optionalLabel = (label: string) => `${label} ${t("optionalSuffix")}`;

  return (
    <form noValidate className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
      <label className="block">
        <span className="text-xs font-semibold text-zinc-300">
          {optionalLabel(t("displayName"))}
        </span>
        <input
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          autoComplete="name"
          className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors focus:border-indigo-500"
        />
      </label>
      <div>
        <label className="block">
          <span className="text-xs font-semibold text-zinc-300">
            {optionalLabel(t("username"))}
          </span>
          <input
            type="text"
            value={username}
            onChange={(event) => handleUsernameChange(event.target.value)}
            autoComplete="username"
            aria-describedby={usernameValidationError ? "username-error" : "username-helper"}
            className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors focus:border-indigo-500"
          />
        </label>
        {usernameValidationError ? (
          <p id="username-error" className="mt-1 text-xs text-red-400" role="alert">
            {usernameValidationError}
          </p>
        ) : (
          <p id="username-helper" className="mt-1 text-xs text-zinc-500">
            {t("usernameHelper")}
          </p>
        )}
      </div>
      <label className="block">
        <span className="text-xs font-semibold text-zinc-300">{optionalLabel(t("phone"))}</span>
        <input
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          autoComplete="tel"
          className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors focus:border-indigo-500"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-zinc-300">{optionalLabel(t("bio"))}</span>
        <textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          rows={4}
          className="mt-1 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors focus:border-indigo-500"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-zinc-300">{optionalLabel(t("links"))}</span>
        <textarea
          value={linksText}
          onChange={(event) => setLinksText(event.target.value)}
          rows={4}
          placeholder={t("linksPlaceholder")}
          className="mt-1 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none transition-colors focus:border-indigo-500"
        />
      </label>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-900/30 transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {t("save")}
        </button>
        <button
          type="button"
          onClick={() => window.location.assign(redirectPath)}
          disabled={submitting}
          className="inline-flex items-center rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t("skip")}
        </button>
      </div>
    </form>
  );
}
