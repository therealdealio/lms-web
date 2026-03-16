import { Membership } from "./types";

export const FREE_LIMIT = 15;
export const PRO_LIMIT = 500;

const storageKey = (userId: string) => `laa_membership_${userId}`;

export const defaultMembership = (): Membership => ({
  tier: "free",
  promptsUsed: 0,
});

export const loadMembership = (userId: string): Membership => {
  if (typeof window === "undefined") return defaultMembership();
  try {
    const stored = localStorage.getItem(storageKey(userId));
    if (!stored) return defaultMembership();
    return JSON.parse(stored) as Membership;
  } catch {
    return defaultMembership();
  }
};

export const saveMembership = (userId: string, m: Membership): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(userId), JSON.stringify(m));
};

export const getLimit = (tier: "free" | "pro", promptLimit?: number) =>
  promptLimit ?? (tier === "pro" ? PRO_LIMIT : FREE_LIMIT);

export const getPromptsRemaining = (userId: string): number => {
  const m = loadMembership(userId);
  return Math.max(0, getLimit(m.tier, m.promptLimit) - m.promptsUsed);
};

export const incrementPromptCount = (userId: string): Membership => {
  const m = loadMembership(userId);
  m.promptsUsed = m.promptsUsed + 1;
  saveMembership(userId, m);
  return m;
};

export const addPromptPack = (userId: string, licenseKey: string): Membership => {
  const m = loadMembership(userId);
  m.tier = "pro";
  m.licenseKey = licenseKey;
  m.upgradedAt = new Date().toISOString();
  m.promptLimit = (m.promptLimit ?? FREE_LIMIT) + PRO_LIMIT;
  saveMembership(userId, m);
  return m;
};

// Keep old name as alias
export const upgradeToPro = addPromptPack;

export const clearMembership = (userId: string): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey(userId));
};
