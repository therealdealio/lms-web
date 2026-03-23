/**
 * Centralized environment variable validation and constants.
 * Import this at the top of any server-side module that needs env vars.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// Validated at import time — fails fast on misconfigured deployments
export const ANTHROPIC_API_KEY = requireEnv("ANTHROPIC_API_KEY");
export const NEXTAUTH_SECRET = requireEnv("NEXTAUTH_SECRET");

/** Overridable via CLAUDE_MODEL env var; defaults to latest Haiku. */
export const LMS_MODEL = process.env.CLAUDE_MODEL ?? "claude-haiku-4-5-20251001";
