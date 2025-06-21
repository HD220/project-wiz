import { JobId } from "./job-id.vo";

describe("JobId", () => {
  describe("constructor", () => {
    it("should create a valid JobId from UUID string", () => {
      const id = "550e8400-e29b-41d4-a716-446655440000";
      const jobId = new JobId(id);
      expect(jobId.value).toBe(id);
    });

    it("should throw when creating with empty string", () => {
      expect(() => new JobId("")).toThrow();
    });

    it("should throw when creating with invalid UUID", () => {
      expect(() => new JobId("invalid-uuid")).toThrow();
    });
  });

  describe("equals", () => {
    it("should return true for equal JobIds", () => {
      const id = "550e8400-e29b-41d4-a716-446655440000";
      const jobId1 = new JobId(id);
      const jobId2 = new JobId(id);
      expect(jobId1.equals(jobId2)).toBe(true);
    });

    it("should return false for different JobIds", () => {
      const jobId1 = new JobId("550e8400-e29b-41d4-a716-446655440000");
      const jobId2 = new JobId("550e8400-e29b-41d4-a716-446655440001");
      expect(jobId1.equals(jobId2)).toBe(false);
    });
  });
});
