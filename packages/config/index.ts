import "dotenv/config";

const env = process.env.NODE_ENV || "development";

function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_MASTER_KEY || process.env.ENCRYPTION_KEY;

  if (!key || !/^[a-fA-F0-9]{64}$/.test(key)) {
    throw new Error(
      "ENCRYPTION_MASTER_KEY must be a 64-character hex string (32 bytes)",
    );
  }

  return key;
}

const storageEndpoint =
  process.env.S3_ENDPOINT ||
  process.env.MINIO_ENDPOINT ||
  "http://localhost:9000";

// Global Environment Variable Definitions
export const config = {
  env,
  port: parseInt(process.env.API_PORT || process.env.PORT || "4000", 10),
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  jwtSecret: process.env.JWT_SECRET || "",
  minio: {
    endpoint: storageEndpoint,
    url: new URL(storageEndpoint),
    accessKey:
      process.env.S3_ACCESS_KEY || process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretKey:
      process.env.S3_SECRET_KEY ||
      process.env.MINIO_SECRET_KEY ||
      "minioadmin",
    bucketName:
      process.env.S3_BUCKET || process.env.MINIO_BUCKET_NAME || "vault-documents",
    region: process.env.S3_REGION || "us-east-1",
  },
  encryptionKey: getEncryptionKey(),
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
};
