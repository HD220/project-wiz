import { handleAuthError } from "./handle-auth-error";

describe("handleAuthError", () => {
  const fallback = "Fallback message";

  it("returns message from Error object", () => {
    const error = new Error("Auth failed");
    expect(handleAuthError(error, fallback)).toBe("Auth failed");
  });

  it("returns message from object with message property", () => {
    const error = { message: "Token expired" };
    expect(handleAuthError(error, fallback)).toBe("Token expired");
  });

  it("returns string input as is", () => {
    expect(handleAuthError("Invalid credentials", fallback)).toBe("Invalid credentials");
  });

  it("returns fallback for null", () => {
    expect(handleAuthError(null, fallback)).toBe(fallback);
  });

  it("returns fallback for undefined", () => {
    expect(handleAuthError(undefined, fallback)).toBe(fallback);
  });

  it("returns fallback for array input", () => {
    expect(handleAuthError(["error", "auth"], fallback)).toBe(fallback);
  });

  it("returns JSON string for generic object", () => {
    const obj = { code: 401, reason: "unauthorized" };
    expect(handleAuthError(obj, fallback)).toBe(JSON.stringify(obj));
  });

  it("returns fallback for object not serializable (circular)", () => {
    const obj: any = {};
    obj.self = obj;
    expect(handleAuthError(obj, fallback)).toBe(fallback);
  });

  it("returns fallback for number input", () => {
    expect(handleAuthError(123, fallback)).toBe(fallback);
    expect(handleAuthError(NaN, fallback)).toBe(fallback);
    expect(handleAuthError(Infinity, fallback)).toBe(fallback);
  });

  it("returns fallback for boolean input", () => {
    expect(handleAuthError(true, fallback)).toBe(fallback);
    expect(handleAuthError(false, fallback)).toBe(fallback);
  });

  it("returns fallback for symbol input", () => {
    expect(handleAuthError(Symbol("auth"), fallback)).toBe(fallback);
  });

  it("returns fallback for bigint input", () => {
    expect(handleAuthError(BigInt(10), fallback)).toBe(fallback);
  });

  it("returns fallback for function input", () => {
    expect(handleAuthError(() => "error", fallback)).toBe(fallback);
  });
});

/**
 * Test coverage:
 * - Error object with message
 * - Object with message property
 * - String
 * - null, undefined
 * - Array
 * - Generic object (serializable and not serializable)
 * - Number (including NaN, Infinity)
 * - Boolean
 * - Symbol
 * - BigInt
 * - Function
 * 
 * All edge cases are covered and documented.
 */