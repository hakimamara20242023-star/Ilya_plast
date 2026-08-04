import { createHash } from "crypto";

/** SHA-256 hex digest, lowercased+trimmed input — Meta's expected format for hashed PII fields. */
export function sha256Hex(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}
