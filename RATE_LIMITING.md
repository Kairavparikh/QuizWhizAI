# Rate Limiting Implementation

## Overview

QuizWhiz AI uses rate limiting to protect against abuse and control costs for AI-powered quiz generation endpoints.

## Rate Limit Tiers

### 🆓 Free Users
- **Limit**: 3 quiz generations **total** (lifetime)
- **Purpose**: Prevent abuse of free tier
- **Applies to**: Users without an active subscription

### 💎 Premium Students
- **Limit**: 10 quiz generations per hour
- **Purpose**: Fair usage for subscribed students
- **Applies to**: Users with active subscription and STUDENT role

### 👨‍🏫 Teachers
- **Limit**: 20 quiz generations per hour
- **Purpose**: Higher limits for educators managing classes
- **Applies to**: Users with active subscription and TEACHER role

## Protected Endpoints

Rate limiting is applied to these expensive AI endpoints:

1. `/api/quizz/generate` - PDF/document quiz generation
2. `/api/quizz/generate-from-notes` - Notes-based quiz generation
3. `/api/misconception/generate-adaptive-quiz` - Adaptive quiz generation

## Setup Instructions

### Development (Optional)

Rate limiting works without Redis in development mode, but will log warnings:

```bash
# Just run the app normally
npm run dev
```

### Production (Required)

For production deployment, you **must** set up Redis:

#### 1. Get Free Redis from Upstash

1. Go to [https://upstash.com](https://upstash.com)
2. Sign up for free account
3. Create a new Redis database
4. Copy the REST API credentials

#### 2. Add Environment Variables

Add these to your `.env` file:

```env
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token-here"
```

#### 3. Deploy

Deploy your application with the new environment variables.

## How It Works

### For Free Users

```
User creates quiz (1/3) ✅ → Success
User creates quiz (2/3) ✅ → Success
User creates quiz (3/3) ✅ → Success
User creates quiz (BLOCKED) ❌ → Error: "You've used all 3 free quiz generations. Please upgrade to Premium."
```

### For Premium/Teacher Users

```
Hour 1:
User creates 10 quizzes ✅ → Success
User tries 11th quiz ❌ → Error: "Rate limit exceeded. Please try again in X minutes."

Hour 2:
Limit resets → User can create 10 more quizzes ✅
```

## Error Responses

### Free Tier Limit Reached (HTTP 429)

```json
{
  "error": "Free tier limit reached",
  "message": "You've used all 3 free quiz generations. Please upgrade to Premium for unlimited access.",
  "upgradeRequired": true
}
```

### Hourly Limit Exceeded (HTTP 429)

```json
{
  "error": "Rate limit exceeded",
  "message": "You've reached your Premium tier limit of 10 quiz generations per hour. Please try again in 45 minutes.",
  "retryAfter": 45
}
```

## Benefits

✅ **Cost Protection**: Prevents runaway OpenAI API costs
✅ **Abuse Prevention**: Stops bots and malicious users
✅ **Fair Usage**: Ensures all users get access
✅ **Monetization**: Encourages free users to upgrade

## Monitoring

Check your Upstash dashboard to monitor:
- Rate limit hits per user
- Most active users
- Abuse patterns

## Customizing Limits

To change rate limits, edit `/src/lib/rate-limit.ts`:

```typescript
export const rateLimiters = {
  free: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(3, "999999 d"), // Change 3 to your limit
    prefix: "ratelimit:free",
  }),
  premium: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"), // Change 10 to your limit
    prefix: "ratelimit:premium",
  }),
  teacher: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 h"), // Change 20 to your limit
    prefix: "ratelimit:teacher",
  }),
};
```

## Testing

### Test Free Tier Limit

1. Create a new account (not subscribed)
2. Generate 3 quizzes
3. Try to generate a 4th quiz
4. Should receive rate limit error

### Test Premium Limit

1. Subscribe to Premium plan
2. Generate 10 quizzes quickly
3. Try to generate an 11th quiz
4. Should receive rate limit error
5. Wait 1 hour, limit should reset

## Troubleshooting

### "Redis not configured" Warning

This is normal in development. Rate limiting is disabled but the app still works.

### Rate Limits Not Working

1. Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set
2. Check Upstash dashboard for connection errors
3. Restart your application after adding env vars

### Users Getting Blocked Incorrectly

1. Check user subscription status in database
2. Verify user role (STUDENT vs TEACHER)
3. Check Upstash dashboard for rate limit counters

## Cost Comparison

### Without Rate Limiting
- Malicious user generates 1000 quizzes
- Cost: ~$500+ in OpenAI fees 💸

### With Rate Limiting
- Free user limited to 3 quizzes
- Premium user limited to 10/hour
- Cost: Protected ✅

## Next Steps

After setting up rate limiting:
1. ✅ Monitor usage in Upstash dashboard
2. ✅ Adjust limits based on actual usage patterns
3. ✅ Consider adding rate limiting to other endpoints
4. ✅ Set up alerts for unusual activity
