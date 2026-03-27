/**
 * Centralized environment variable validation and constants.
 * Import this at the top of any server-side module that needs env vars.
 * Variables are lazily evaluated to avoid crashing during build.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// Lazy getters — only throw when actually accessed at runtime, not at build time
export const getAnthropicApiKey = () => requireEnv("ANTHROPIC_API_KEY");
export const getNextAuthSecret = () => requireEnv("NEXTAUTH_SECRET");

// Keep backward compat exports as getters
Object.defineProperty(exports, "ANTHROPIC_API_KEY", { get: getAnthropicApiKey });
Object.defineProperty(exports, "NEXTAUTH_SECRET", { get: getNextAuthSecret });

/** Overridable via CLAUDE_MODEL env var; defaults to latest Haiku. */
export const LMS_MODEL = process.env.CLAUDE_MODEL ?? "claude-haiku-4-5-20251001";
