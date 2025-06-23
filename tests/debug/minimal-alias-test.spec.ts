// This is a minimal test case to debug Vitest path alias resolution.
// It specifically targets the '@refactored/shared/result' alias.

import { describe, it, expect } from "vitest";
// Import actual runtime values instead of the type 'Result'
import { ok, DomainError, isSuccess } from "@/refactored/shared/result";

describe("Minimal Alias Resolution and Import Test", () => {
  it("should import 'ok', 'DomainError', and 'isSuccess' from '@/refactored/shared/result' successfully", () => {
    expect(ok).toBeDefined();
    expect(typeof ok).toBe("function");

    expect(DomainError).toBeDefined();
    expect(typeof DomainError).toBe("function"); // Classes are functions at runtime
    const err = new DomainError("test");
    expect(err.message).toBe("test");

    expect(isSuccess).toBeDefined();
    expect(typeof isSuccess).toBe("function");
  });
});
