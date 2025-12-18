import { stripe } from '@/lib/stripe';

describe('Stripe Configuration', () => {
  it('should have stripe instance configured', () => {
    expect(stripe).toBeDefined();
    expect(typeof stripe).toBe('object');
  });

  it('should have required Stripe methods', () => {
    expect(stripe.customers).toBeDefined();
    expect(stripe.subscriptions).toBeDefined();
    expect(stripe.checkout).toBeDefined();
    expect(stripe.webhooks).toBeDefined();
    expect(stripe.billingPortal).toBeDefined();
  });

  it('should be able to retrieve API version', () => {
    // Stripe client should have an apiVersion property
    expect(stripe.getApiField).toBeDefined();
  });
});
