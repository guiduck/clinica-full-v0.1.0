import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const ITERATIONS = 120000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return `${ITERATIONS}:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [iterationsValue, salt, originalHash] = stored.split(":");
  const iterations = Number(iterationsValue);

  if (!iterations || !salt || !originalHash) {
    return false;
  }

  const candidateHash = pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST);
  const originalBuffer = Buffer.from(originalHash, "hex");

  return originalBuffer.length === candidateHash.length && timingSafeEqual(originalBuffer, candidateHash);
}
