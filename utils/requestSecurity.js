const rateLimitStore = globalThis.__sbRateLimitStore || new Map();
globalThis.__sbRateLimitStore = rateLimitStore;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getClientIdentifier = (req, scope = "global") => {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const realIp = req.headers.get("x-real-ip") || "";
  const ip = forwarded.split(",")[0]?.trim() || realIp.trim() || "unknown";
  return `${scope}:${ip}`;
};

export const enforceRateLimit = ({
  key,
  limit,
  windowMs,
}) => {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, entry.resetAt - now),
    };
  }

  entry.count += 1;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: Math.max(0, limit - entry.count),
  };
};

export const isValidEmail = (value = "") => EMAIL_REGEX.test(value.trim());

export const normalizeEmail = (value = "") => value.trim().toLowerCase();

export const isStrongEnoughPassword = (value = "") => value.trim().length >= 8;

export const isValidMongoId = (value = "") =>
  /^[a-f\d]{24}$/i.test(String(value).trim());

export const sanitizeText = (value = "") => value.trim();
