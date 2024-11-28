import { createHash } from "node:crypto";

export function createSHA256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}
