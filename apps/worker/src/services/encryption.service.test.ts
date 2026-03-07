import assert from "node:assert/strict";
import test from "node:test";

const TEST_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

test("worker encryption roundtrip", async () => {
  process.env.ENCRYPTION_MASTER_KEY = TEST_KEY;
  process.env.JWT_SECRET = "test-jwt-secret";

  const { encryptBuffer, decryptBuffer } = await import("./encryption.service.js");

  const plain = Buffer.from("worker-encryption");
  const encrypted = await encryptBuffer(plain);
  const decrypted = decryptBuffer(encrypted.encrypted, encrypted.iv, encrypted.authTag);

  assert.equal(decrypted.toString("utf8"), "worker-encryption");
});
