"use client";

import { useCallback, useEffect, useState } from "react";
import {
  authDisabledForLocalDev,
  clearSession,
  dashboardUsername,
  readSession,
  verifyCredentials,
  writeSession,
} from "@/lib/dashboardAuth";

export default function DashboardAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authDisabledForLocalDev()) {
      setAuthed(true);
      setReady(true);
      return;
    }
    setAuthed(readSession() != null);
    setReady(true);
  }, []);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (verifyCredentials(username, password)) {
        writeSession();
        setAuthed(true);
        setPassword("");
        return;
      }
      setError("Invalid username or password.");
    },
    [username, password],
  );

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cpbh-mist/40">
        <p className="text-sm text-cpbh-navy/60">Loading…</p>
      </div>
    );
  }

  if (authDisabledForLocalDev() || authed) {
    return (
      <>
        {!authDisabledForLocalDev() && passwordHashConfigured() ? (
          <div className="fixed bottom-3 right-3 z-[100]">
            <button
              type="button"
              className="text-[10px] font-medium text-cpbh-navy/45 hover:text-cpbh-navy bg-white/90 border border-cpbh-mist rounded-md px-2 py-1 shadow-sm"
              onClick={() => {
                clearSession();
                setAuthed(false);
              }}
            >
              Sign out
            </button>
          </div>
        ) : null}
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cpbh-mist/50 to-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-cpbh-mist bg-white shadow-lg shadow-cpbh-navy/10 p-8">
        <p className="font-display text-2xl font-semibold text-cpbh-navy">
          USC ADRC Metrics
        </p>
        <p className="text-sm text-cpbh-navy/60 mt-2 leading-relaxed">
          Authorized access only. Sign in with the credentials shared by the
          Clinical Core team.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label
              htmlFor="dashboard-username"
              className="block text-xs font-semibold uppercase tracking-wide text-cpbh-navy/55 mb-1"
            >
              Username
            </label>
            <input
              id="dashboard-username"
              type="text"
              autoComplete="username"
              className="w-full rounded-lg border border-cpbh-mist px-3 py-2 text-sm text-cpbh-navy focus:outline-none focus:ring-2 focus:ring-cpbh-purple/40"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={dashboardUsername()}
            />
          </div>
          <div>
            <label
              htmlFor="dashboard-password"
              className="block text-xs font-semibold uppercase tracking-wide text-cpbh-navy/55 mb-1"
            >
              Password
            </label>
            <input
              id="dashboard-password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-cpbh-mist px-3 py-2 text-sm text-cpbh-navy focus:outline-none focus:ring-2 focus:ring-cpbh-purple/40"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? (
            <p className="text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-lg bg-cpbh-navy text-white text-sm font-semibold py-2.5 hover:bg-cpbh-navy/90 transition-colors"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-[10px] text-cpbh-navy/40 leading-relaxed">
          Do not share this link or credentials outside USC ADRC / CPBH. Site is
          not indexed for search engines.
        </p>
      </div>
    </div>
  );
}
