import assert from "node:assert/strict";
import test from "node:test";

const TEST_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

test("encryptBuffer/decryptBuffer roundtrip", async () => {
  process.env.ENCRYPTION_MASTER_KEY = TEST_KEY;
  process.env.JWT_SECRET = "test-jwt-secret";

  const { encryptBuffer, decryptBuffer } = await import("./encryption.service.js");

  const original = Buffer.from("personal-data-os");
  const encrypted = await encryptBuffer(original);
  const decrypted = decryptBuffer(
    encrypted.encrypted,
    encrypted.iv,
    encrypted.authTag,
  );

  assert.equal(decrypted.toString("utf8"), "personal-data-os");
});

test("encryptSecret/decryptSecret roundtrip", async () => {
  process.env.ENCRYPTION_MASTER_KEY = TEST_KEY;
  process.env.JWT_SECRET = "test-jwt-secret";

  const { encryptSecret, decryptSecret, isEncryptedSecret } = await import(
    "./encryption.service.js"
  );

  const payload = encryptSecret("refresh-token-value");
  assert.equal(isEncryptedSecret(payload), true);
  assert.equal(decryptSecret(payload), "refresh-token-value");
});
