import { pbkdf2Sync, randomBytes } from "crypto";

/**
 * Hash a plain text password using PBKDF2 with SHA-256 and a random salt.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 1000, 64, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a plain text password against a stored salt:hash string.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) {
    return false;
  }
  const [salt, originalHash] = storedHash.split(":");
  const testHash = pbkdf2Sync(password, salt, 1000, 64, "sha256").toString("hex");
  return testHash === originalHash;
}
