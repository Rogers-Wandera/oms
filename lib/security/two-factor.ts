import crypto from "crypto";
import { generateSecret, generateURI, verifySync } from "otplib";

const APP_NAME = "OMS Enterprise";

function getEncryptionKey() {
  const secret =
    process.env.TWO_FACTOR_ENCRYPTION_KEY ||
    process.env.JWT_SECRET ||
    process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error("2FA encryption key not configured");
  }

  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptText(plainText: string) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [iv, tag, encrypted].map((part) => part.toString("base64")).join(".");
}

export function decryptText(payload: string) {
  const [ivB64, tagB64, dataB64] = payload.split(".");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid encrypted payload");
  }

  const key = getEncryptionKey();
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
}

export function generateTotpSecret() {
  return generateSecret();
}

export function buildOtpAuthUrl(email: string, secret: string) {
  return generateURI({ issuer: APP_NAME, label: email, secret });
}

export function normalizeOtpCode(code: string) {
  return code.replace(/\s+/g, "").replace(/-/g, "").trim();
}

export function isValidTotp(code: string, secret: string) {
  const normalized = normalizeOtpCode(code);
  // otplib v13 verifySync throws if token is not exactly 6 digits
  if (normalized.length !== 6) {
    console.log("[2FA] Invalid token length:", normalized.length);
    return false;
  }
  try {
    const result = verifySync({
      secret,
      token: normalized,
      epochTolerance: 2, // standard is 0-1, 2 is more generous for clock drift
    });

    console.log("[2FA] Verification result raw:", JSON.stringify(result));

    // Handle both boolean and { valid: boolean } formats
    if (typeof result === "boolean") {
      return result;
    }
    if (result && typeof result === "object") {
      return !!result.valid;
    }
    return !!result;
  } catch (error) {
    console.error("[2FA] TOTP verification error:", error);
    return false;
  }
}

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function verifyWithBackupCodes(
  code: string,
  encryptedBackupCodes: string[],
) {
  const normalized = normalizeOtpCode(code).toLowerCase();
  const matchedIndex = encryptedBackupCodes.findIndex((encrypted) => {
    const plain = normalizeOtpCode(decryptText(encrypted)).toLowerCase();
    return safeEqual(plain, normalized);
  });

  if (matchedIndex === -1) {
    return { valid: false, remaining: encryptedBackupCodes };
  }

  const remaining = encryptedBackupCodes.filter(
    (_, index) => index !== matchedIndex,
  );

  return { valid: true, remaining };
}

export function generateBackupCodes(count = 8) {
  return Array.from({ length: count }, () => {
    const raw = crypto.randomBytes(5).toString("hex").toUpperCase();
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
}
