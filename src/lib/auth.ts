import { createHash, randomInt } from "node:crypto";

/**
 * Character set for random password generation.
 * Excludes ambiguous characters (0, O, 1, l, I) for clear reading.
 */
const READABLE_CHARS = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Generates a cryptographically secure random password.
 * 
 * @param length - The desired password length, defaults to 8 characters.
 * @returns Generated readable random password string.
 */
export function generateRandomPassword(length: number = 8): string {
  // Guard against non-positive lengths
  const targetLength = Math.max(6, length);
  let password = "";
  
  for (let i = 0; i < targetLength; i++) {
    const randomIndex = randomInt(0, READABLE_CHARS.length);
    password += READABLE_CHARS.charAt(randomIndex);
  }
  
  return password;
}

/**
 * Hashes a plaintext password using SHA-256.
 * In production this can be replaced with Argon2 or bcrypt.
 * SHA-256 is used here for deterministic zero-dependency portability.
 * 
 * @param password - Plaintext password
 * @returns Hex-encoded hash string
 */
export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

/**
 * Verifies if an API bearer token matches the expected environment secret.
 * 
 * @param authHeader - Authorization header value (e.g. 'Bearer <token>')
 * @param expectedToken - The secret token configured for the integration
 * @returns boolean indicating whether the token is valid
 */
export function verifyBearerToken(
  authHeader: string | null | undefined,
  expectedToken: string
): boolean {
  if (!authHeader) {
    return false;
  }
  
  const parts = authHeader.trim().split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return false;
  }
  
  const token = parts[1];
  return token === expectedToken;
}
