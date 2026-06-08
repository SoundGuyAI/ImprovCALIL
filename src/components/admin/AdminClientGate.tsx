"use client";

import { useEffect, useState } from "react";
import { getIdToken, signInWithCustomToken } from "firebase/auth";
import { useAuth } from "@/components/auth/AuthProvider";
import { auth, isConfigMissing } from "@/lib/firebase";

export function AdminClientGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (isConfigMissing || !auth) {
      setReady(true);
      return;
    }

    if (loading) {
      return;
    }

    if (user && auth.currentUser) {
      void getIdToken(auth.currentUser, true)
        .then(() => setReady(true))
        .catch(() => setFailed(true));
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await fetch("/api/auth/custom-token", { cache: "no-store" });
        if (!response.ok) {
          if (!cancelled) {
            setFailed(true);
          }
          return;
        }

        const data = (await response.json()) as { customToken: string };
        const credential = await signInWithCustomToken(auth, data.customToken);
        await credential.user.getIdToken(true);

        if (!cancelled) {
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          setFailed(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  if (failed) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
        <p className="text-zinc-400 text-sm text-center max-w-md">
          Unable to restore Firebase authentication for admin actions. Please sign in again.
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
        <p className="text-zinc-400 text-sm">Preparing admin session...</p>
      </div>
    );
  }

  return <>{children}</>;
}
