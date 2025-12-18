import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Rate limiters for different user tiers
export const rateLimiters = {
  // Free users: 3 total quizzes for their entire lifetime
  free: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.fixedWindow(3, "999999 d"), // 3 requests per lifetime (999999 days)
        prefix: "ratelimit:free",
      })
    : null,

  // Premium users: 10 quiz generations per hour
  premium: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 h"),
        prefix: "ratelimit:premium",
      })
    : null,

  // Teacher users: 20 quiz generations per hour
  teacher: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "1 h"),
        prefix: "ratelimit:teacher",
      })
    : null,
};

export type UserRole = "FREE" | "STUDENT" | "TEACHER";

export async function checkRateLimit(userId: string, role: UserRole, isSubscribed: boolean) {
  // If Redis is not configured, allow the request (dev mode)
  if (!redis) {
    console.warn("Redis not configured - rate limiting disabled");
    return { success: true, limit: 999, remaining: 999, reset: 0 };
  }

  // Determine which rate limiter to use
  let limiter;
  let tierName;

  if (isSubscribed && role === "TEACHER") {
    limiter = rateLimiters.teacher;
    tierName = "Teacher";
  } else if (isSubscribed) {
    limiter = rateLimiters.premium;
    tierName = "Premium";
  } else {
    limiter = rateLimiters.free;
    tierName = "Free";
  }

  if (!limiter) {
    return { success: true, limit: 999, remaining: 999, reset: 0 };
  }

  // Check rate limit
  const result = await limiter.limit(userId);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
    tierName,
  };
}

// Helper function to format rate limit error message
export function getRateLimitErrorMessage(
  tierName: string,
  limit: number,
  reset: number,
  isLifetime: boolean = false
) {
  if (isLifetime) {
    return {
      error: "Free tier limit reached",
      message: `You've used all ${limit} free quiz generations. Please upgrade to Premium for unlimited access.`,
      upgradeRequired: true,
    };
  }

  const resetDate = new Date(reset);
  const now = new Date();
  const minutesUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / 60000);

  return {
    error: "Rate limit exceeded",
    message: `You've reached your ${tierName} tier limit of ${limit} quiz generations per hour. Please try again in ${minutesUntilReset} minute${minutesUntilReset !== 1 ? 's' : ''}.`,
    retryAfter: minutesUntilReset,
  };
}
