import crypto from "node:crypto";
import { Readable, Transform, TransformCallback } from "node:stream";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

import { config } from "@repo/config";

/**
 * Get the master encryption key from environment.
 * Must be a 64-char hex string (32 bytes).
 */
function getMasterKey(): Buffer {
  const key = config.encryptionKey;
  if (!key || key.length !== 64) {
    throw new Error(
      "ENCRYPTION_MASTER_KEY must be a 64-character hex string (32 bytes)",
    );
  }
  return Buffer.from(key, "hex");
}

/**
 * Encrypt a readable stream using AES-256-GCM.
 * Returns the encrypted buffer, IV (hex), auth tag (hex), and algorithm name.
 */
export async function encryptBuffer(plainBuffer: Buffer): Promise<{
  encrypted: Buffer;
  iv: string;
  authTag: string;
  algorithm: string;
}> {
  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainBuffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    algorithm: ALGORITHM,
  };
}

/**
 * Decrypt a buffer using AES-256-GCM.
 * Requires the IV and auth tag that were produced during encryption.
 */
export function decryptBuffer(
  encryptedBuffer: Buffer,
  ivHex: string,
  authTagHex: string,
): Buffer {
  const key = getMasterKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
}

/**
 * Collect a readable stream into a Buffer.
 */
export async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
