import { Queue } from "bullmq";
import moduleRedis from "ioredis";
import { config } from "@repo/config";

// Force TypeScript to accept the construct signature on the imported module
const Redis = moduleRedis as unknown as any;

// Redis Connection
const connection = new Redis(config.redisUrl);

// Export queues so the API can push jobs to them
export const aiQueue = new Queue("ai-processing", {
  connection: connection as any,
});
export const reminderQueue = new Queue("daily-reminders", {
  connection: connection as any,
});
