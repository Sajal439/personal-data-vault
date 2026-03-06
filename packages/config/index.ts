import "dotenv/config";

// Global Environment Variable Definitions
export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  jwtSecret: process.env.JWT_SECRET || "fallback_secret_for_development_only",
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
    url: new URL(process.env.MINIO_ENDPOINT || "http://localhost:9000"),
    accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
    bucketName: process.env.MINIO_BUCKET_NAME || "personal-data-os",
  },
  encryptionKey:
    process.env.ENCRYPTION_KEY || "0123456789abcdef0123456789abcdef",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
};
