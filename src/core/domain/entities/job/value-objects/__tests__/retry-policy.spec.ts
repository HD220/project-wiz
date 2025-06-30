import { RetryPolicy, BackoffType } from "./retry-policy.vo";

describe("RetryPolicy", () => {
  describe("constructor", () => {
    it("should create with default values when empty", () => {
      const policy = new RetryPolicy();
      expect(policy.value).toEqual({
        maxAttempts: 3,
        delayBetweenAttempts: 1000,
        backoffType: BackoffType.EXPONENTIAL,
      });
    });

    it("should create with provided valid values", () => {
      const policy = new RetryPolicy({
        maxAttempts: 5,
        delayBetweenAttempts: 2000,
        backoffType: BackoffType.LINEAR,
        maxDelay: 5000,
      });
      expect(policy.value).toEqual({
        maxAttempts: 5,
        delayBetweenAttempts: 2000,
        backoffType: BackoffType.LINEAR,
        maxDelay: 5000,
      });
    });

    it("should throw when maxAttempts is not positive", () => {
      expect(() => new RetryPolicy({ maxAttempts: 0 })).toThrow();
      expect(() => new RetryPolicy({ maxAttempts: -1 })).toThrow();
    });

    it("should throw when maxAttempts is not integer", () => {
      expect(() => new RetryPolicy({ maxAttempts: 1.5 })).toThrow();
    });

    it("should throw when delayBetweenAttempts is negative", () => {
      expect(() => new RetryPolicy({ delayBetweenAttempts: -1 })).toThrow();
    });

    it("should accept zero delayBetweenAttempts", () => {
      const policy = new RetryPolicy({ delayBetweenAttempts: 0 });
      expect(policy.value.delayBetweenAttempts).toBe(0);
    });
  });

  describe("value", () => {
    it("should return the policy values", () => {
      const policy = new RetryPolicy({
        maxAttempts: 2,
        delayBetweenAttempts: 500,
      });
      expect(policy.value).toEqual({
        maxAttempts: 2,
        delayBetweenAttempts: 500,
        backoffType: BackoffType.EXPONENTIAL,
      });
    });

    it("should be immutable", () => {
      const policy = new RetryPolicy();
      expect(() => {
        // @ts-expect-error Testing immutability
        policy.value = { maxAttempts: 10, delayBetweenAttempts: 100 };
      }).toThrow();
    });
  });

  describe("calculateDelay", () => {
    it("should calculate exponential backoff correctly", () => {
      const policy = new RetryPolicy({
        delayBetweenAttempts: 1000,
        backoffType: BackoffType.EXPONENTIAL,
      });
      expect(policy.calculateDelay(0)).toBe(1000); // (0+1)^2 * 1000 = 1000
      expect(policy.calculateDelay(1)).toBe(4000); // (1+1)^2 * 1000 = 4000
      expect(policy.calculateDelay(2)).toBe(9000); // (2+1)^2 * 1000 = 9000
    });

    it("should calculate linear backoff correctly", () => {
      const policy = new RetryPolicy({
        delayBetweenAttempts: 1000,
        backoffType: BackoffType.LINEAR,
      });
      expect(policy.calculateDelay(0)).toBe(1000); // (0+1) * 1000 = 1000
      expect(policy.calculateDelay(1)).toBe(2000); // (1+1) * 1000 = 2000
      expect(policy.calculateDelay(2)).toBe(3000); // (2+1) * 1000 = 3000
    });

    it("should calculate fixed backoff correctly", () => {
      const policy = new RetryPolicy({
        delayBetweenAttempts: 1000,
        backoffType: BackoffType.FIXED,
      });
      expect(policy.calculateDelay(0)).toBe(1000);
      expect(policy.calculateDelay(1)).toBe(1000);
      expect(policy.calculateDelay(2)).toBe(1000);
    });

    it("should respect maxDelay when provided", () => {
      const policy = new RetryPolicy({
        delayBetweenAttempts: 1000,
        backoffType: BackoffType.EXPONENTIAL,
        maxDelay: 5000,
      });
      expect(policy.calculateDelay(0)).toBe(1000); // 1000 < 5000
      expect(policy.calculateDelay(1)).toBe(4000); // 4000 < 5000
      expect(policy.calculateDelay(2)).toBe(5000); // 9000 > 5000 → capped
    });

    it("should return 0 when delayBetweenAttempts is 0", () => {
      const policy = new RetryPolicy({
        delayBetweenAttempts: 0,
        backoffType: BackoffType.EXPONENTIAL,
      });
      expect(policy.calculateDelay(0)).toBe(0);
      expect(policy.calculateDelay(1)).toBe(0);
    });
  });
});
