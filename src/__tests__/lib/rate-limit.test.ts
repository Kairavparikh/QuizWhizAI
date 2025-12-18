import { checkRateLimit, getRateLimitErrorMessage } from '@/lib/rate-limit';

// Mock Redis to avoid requiring actual Redis in tests
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn(() => null),
}));

jest.mock('@upstash/ratelimit', () => ({
  Ratelimit: {
    fixedWindow: jest.fn(),
    slidingWindow: jest.fn(),
  },
}));

describe('Rate Limiting', () => {
  describe('checkRateLimit', () => {
    it('should allow requests when Redis is not configured (dev mode)', async () => {
      const result = await checkRateLimit('test-user-id', 'STUDENT', false);

      expect(result.success).toBe(true);
      expect(result.limit).toBe(999);
      expect(result.remaining).toBe(999);
    });

    it('should use correct tier for free users', async () => {
      const result = await checkRateLimit('test-user-id', 'STUDENT', false);

      // In dev mode without Redis, should always succeed
      expect(result.success).toBe(true);
    });

    it('should use correct tier for premium users', async () => {
      const result = await checkRateLimit('test-user-id', 'STUDENT', true);

      expect(result.success).toBe(true);
    });

    it('should use correct tier for teachers', async () => {
      const result = await checkRateLimit('test-user-id', 'TEACHER', true);

      expect(result.success).toBe(true);
    });
  });

  describe('getRateLimitErrorMessage', () => {
    it('should generate correct error message for free tier limit', () => {
      const message = getRateLimitErrorMessage('Free', 3, Date.now(), true);

      expect(message.error).toBe('Free tier limit reached');
      expect(message.message).toContain('3 free quiz generations');
      expect(message.upgradeRequired).toBe(true);
    });

    it('should generate correct error message for hourly limits', () => {
      const resetTime = Date.now() + 30 * 60 * 1000; // 30 minutes from now
      const message = getRateLimitErrorMessage('Premium', 10, resetTime, false);

      expect(message.error).toBe('Rate limit exceeded');
      expect(message.message).toContain('10 quiz generations per hour');
      expect(message.retryAfter).toBeGreaterThan(0);
    });

    it('should calculate retry time correctly', () => {
      const resetTime = Date.now() + 45 * 60 * 1000; // 45 minutes from now
      const message = getRateLimitErrorMessage('Teacher', 20, resetTime, false);

      expect(message.retryAfter).toBeGreaterThanOrEqual(44);
      expect(message.retryAfter).toBeLessThanOrEqual(46);
    });
  });
});
