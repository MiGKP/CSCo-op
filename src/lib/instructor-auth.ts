/**
 * Instructor Authentication & Session Management
 * Built on Web Crypto API for compatibility across Node.js runtime and Edge Middleware.
 */

const DEFAULT_SECRET = "cs_coop_instructor_secret_key_2026_super_secure";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function getSecretString(): string {
  return process.env.INSTRUCTOR_SESSION_SECRET || DEFAULT_SECRET;
}

async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecretString()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBuffer(base64Url: string): ArrayBuffer {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return buffer;
}

/**
 * Creates a signed session token for the instructor.
 * Format: username.expiresAt.signature
 */
export async function createInstructorSessionToken(
  username: string
): Promise<string> {
  const expiresAt = Date.now() + SEVEN_DAYS_MS;
  const payload = `${username}.${expiresAt}`;
  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );

  const signatureBase64 = bufferToBase64Url(signatureBuffer);
  return `${payload}.${signatureBase64}`;
}

export interface VerifySessionResult {
  valid: boolean;
  username: string | null;
}

/**
 * Verifies a signed session token. Checks signature and expiration.
 */
export async function verifyInstructorSessionToken(
  token: string | null | undefined
): Promise<VerifySessionResult> {
  if (!token) {
    return { valid: false, username: null };
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return { valid: false, username: null };
  }

  const [username, expiresAtStr, signatureBase64] = parts;
  const expiresAt = Number.parseInt(expiresAtStr, 10);

  if (Number.isNaN(expiresAt) || Date.now() > expiresAt) {
    return { valid: false, username: null };
  }

  try {
    const payload = `${username}.${expiresAtStr}`;
    const key = await getCryptoKey();
    const signatureBytes = base64UrlToBuffer(signatureBase64);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      new TextEncoder().encode(payload)
    );

    return {
      valid: isValid,
      username: isValid ? username : null,
    };
  } catch {
    return { valid: false, username: null };
  }
}

/**
 * Checks whether provided credentials match the configured instructor credentials.
 */
export function checkInstructorCredentials(
  user: string,
  pass: string
): boolean {
  const expectedUser = process.env.INSTRUCTOR_USERNAME || "admin";
  const expectedPass = process.env.INSTRUCTOR_PASSWORD || "coop2026pass";

  return user === expectedUser && pass === expectedPass;
}
