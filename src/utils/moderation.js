// Lightweight, client-side content check — not a substitute for real
// moderation at scale, but catches obvious spam/placeholder junk before
// it ever reaches the database (the "aaaaaa" / "qqqqq" test-data problem).
const BANNED_PATTERNS = [
  /\b(viagra|casino|crypto\s*giveaway|click\s*here\s*now|make\s*money\s*fast)\b/i,
  /(.)\1{6,}/,          // same character repeated 7+ times (aaaaaaa, qqqqqqq)
  /https?:\/\/\S+.*https?:\/\/\S+.*https?:\/\/\S+/i, // 3+ links, likely spam
];

export function moderationIssue(text) {
  if (!text) return null;
  const trimmed = text.trim();
  if (trimmed.length < 3) return null;
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return "This looks like placeholder or spam text — please write real content.";
    }
  }
  const letters = trimmed.replace(/[^a-zA-Z]/g, '');
  const uniqueRatio = letters.length ? new Set(letters.toLowerCase()).size / letters.length : 1;
  if (letters.length > 8 && uniqueRatio < 0.25) {
    return "This looks like placeholder or spam text — please write real content.";
  }
  return null;
}
