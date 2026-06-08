"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { auth, isConfigMissing } from "@/lib/firebase";
import type { AuthLocale, AuthProfile, AuthUser, EditableProfileFields } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  profile: AuthProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<AuthProfile>;
  signInWithEmail: (email: string, password: string) => Promise<AuthProfile>;
  registerWithEmail: (
    email: string,
    password: string,
    profile?: EditableProfileFields
  ) => Promise<AuthProfile>;
  refreshProfile: () => Promise<AuthProfile | null>;
  deleteAccount: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
  };
}

function profileToAuthUser(profile: AuthProfile): AuthUser {
  return {
    uid: profile.uid,
    displayName: profile.displayName,
    email: profile.email,
  };
}

async function fetchCookieProfile(): Promise<AuthProfile | null> {
  if (
    typeof document !== "undefined" &&
    !document.cookie.includes("improv_cal_il_logged_in=true")
  ) {
    return null;
  }
  const response = await fetch("/api/auth/me", { cache: "no-store" });
  if (!response.ok) {
    return null;
  }
  const data = (await response.json()) as { profile: AuthProfile | null };
  return data.profile;
}

async function postSession(
  user: User,
  locale: AuthLocale,
  profile?: EditableProfileFields
): Promise<AuthProfile> {
  const idToken = await user.getIdToken();
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, locale, profile }),
  });

  if (!response.ok) {
    throw new Error("Unable to create authenticated session.");
  }

  await user.getIdToken(true);

  const data = (await response.json()) as { profile: AuthProfile };
  return data.profile;
}

export function AuthProvider({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: AuthLocale;
}) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const signingInRef = React.useRef(false);

  const localeRef = React.useRef(locale);
  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  useEffect(() => {
    if (isConfigMissing || !auth) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, async (nextUser) => {
      setFirebaseUser(nextUser);
      if (!nextUser) {
        try {
          setProfile(await fetchCookieProfile());
        } catch {
          setProfile(null);
        } finally {
          setLoading(false);
        }
        return;
      }

      if (signingInRef.current) {
        return;
      }

      try {
        setProfile(await postSession(nextUser, localeRef.current));
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (isConfigMissing || !auth) {
      throw new Error("Authentication is currently unavailable (missing configuration).");
    }
    signingInRef.current = true;
    setLoading(true);
    try {
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      const nextProfile = await postSession(credential.user, locale);
      setProfile(nextProfile);
      return nextProfile;
    } catch (error) {
      setProfile(null);
      throw error;
    } finally {
      signingInRef.current = false;
      setLoading(false);
    }
  }, [locale]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      if (isConfigMissing || !auth) {
        throw new Error("Authentication is currently unavailable (missing configuration).");
      }
      signingInRef.current = true;
      setLoading(true);
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const nextProfile = await postSession(credential.user, locale);
        setProfile(nextProfile);
        return nextProfile;
      } catch (error) {
        setProfile(null);
        throw error;
      } finally {
        signingInRef.current = false;
        setLoading(false);
      }
    },
    [locale]
  );

  const registerWithEmail = useCallback(
    async (email: string, password: string, requestedProfile?: EditableProfileFields) => {
      if (isConfigMissing || !auth) {
        throw new Error("Authentication is currently unavailable (missing configuration).");
      }
      signingInRef.current = true;
      setLoading(true);
      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        try {
          const nextProfile = await postSession(credential.user, locale, requestedProfile);
          setProfile(nextProfile);
          return nextProfile;
        } catch (error) {
          await credential.user.delete().catch(() => undefined);
          throw error;
        }
      } catch (error) {
        setProfile(null);
        throw error;
      } finally {
        signingInRef.current = false;
        setLoading(false);
      }
    },
    [locale]
  );

  const refreshProfile = useCallback(async () => {
    if (isConfigMissing) {
      setProfile(null);
      return null;
    }
    const nextProfile = await fetchCookieProfile();
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  const deleteAccount = useCallback(async (email: string) => {
    if (isConfigMissing || !auth) {
      throw new Error("Authentication is currently unavailable (missing configuration).");
    }
    const response = await fetch("/api/auth/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error ?? "Unable to delete account.");
    }

    await firebaseSignOut(auth);
    setFirebaseUser(null);
    setProfile(null);
  }, []);

  const signOut = useCallback(async () => {
    if (isConfigMissing || !auth) {
      await fetch("/api/auth/session", { method: "DELETE" });
      setFirebaseUser(null);
      setProfile(null);
      return;
    }
    await firebaseSignOut(auth);
    await fetch("/api/auth/session", { method: "DELETE" });
    setFirebaseUser(null);
    setProfile(null);
  }, []);

  const getIdToken = useCallback(async () => {
    return firebaseUser ? firebaseUser.getIdToken() : null;
  }, [firebaseUser]);

  const user = useMemo<AuthUser | null>(
    () => (firebaseUser ? toAuthUser(firebaseUser) : profile ? profileToAuthUser(profile) : null),
    [firebaseUser, profile]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      signInWithGoogle,
      signInWithEmail,
      registerWithEmail,
      refreshProfile,
      deleteAccount,
      signOut,
      getIdToken,
    }),
    [
      user,
      profile,
      loading,
      signInWithGoogle,
      signInWithEmail,
      registerWithEmail,
      refreshProfile,
      deleteAccount,
      signOut,
      getIdToken,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
