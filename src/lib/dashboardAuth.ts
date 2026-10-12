import bcrypt from "bcryptjs";

export const AUTH_SESSION_KEY = "adrc-dashboard-auth-v1";
/** Session lifetime after successful login (ms). */
export const AUTH_SESSION_MS = 12 * 60 * 60 * 1000;

export function dashboardUsername(): string {
  return process.env.NEXT_PUBLIC_DASHBOARD_USERNAME?.trim() || "usc-adrc";
}

export function passwordHashConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD_HASH?.trim());
}

export function authDisabledForLocalDev(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_DASHBOARD_AUTH_DISABLED === "1"
  );
}

export function verifyCredentials(
  username: string,
  password: string,
): boolean {
  const expectedUser = dashboardUsername();
  const hash = process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD_HASH?.trim();
  if (!hash) return false;
  if (username.trim() !== expectedUser) return false;
  return bcrypt.compareSync(password, hash);
}

export type AuthSession = {
  user: string;
  expiresAt: number;
};

export function readSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.user || !parsed?.expiresAt) return null;
    if (Date.now() > parsed.expiresAt) {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
      return null;
    }
    if (parsed.user !== dashboardUsername()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeSession(): void {
  const payload: AuthSession = {
    user: dashboardUsername(),
    expiresAt: Date.now() + AUTH_SESSION_MS,
  };
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(payload));
}

export function clearSession(): void {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
}
