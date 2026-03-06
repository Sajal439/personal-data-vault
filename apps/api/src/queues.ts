import { Queue } from "bullmq";
import moduleRedis from "ioredis";

// Force TypeScript to accept the construct signature on the imported module
const Redis = moduleRedis as unknown as any;

// Redis Connection
const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// Export queues so the API can push jobs to them
export const aiQueue = new Queue("ai-processing", {
  connection: connection as any,
});
export const reminderQueue = new Queue("daily-reminders", {
  connection: connection as any,
});
