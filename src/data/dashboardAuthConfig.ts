/**
 * Bcrypt hash for the shared dashboard password (not the plaintext password).
 * Default matches DASHBOARD_PASSWORD / USC-ADRC-Metrics-2026 until rotated in GitHub Secrets.
 * CI can override via NEXT_PUBLIC_DASHBOARD_PASSWORD_HASH at build time.
 */
export const DASHBOARD_PASSWORD_HASH_FALLBACK =
  "$2b$10$ZkeBQ4kefd6wK.pptg7Dz.xUeEEe08LuqsD1jWCQZUMzuwWsbPNgC";

export const DASHBOARD_USERNAME_DEFAULT = "usc-adrc";
