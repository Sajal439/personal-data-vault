import { Queue, Worker, QueueEvents } from "bullmq";
import moduleRedis from "ioredis";
import { processDocumentWithAI } from "./services/ai.service.js";
import { prisma } from "@repo/db";
import "dotenv/config";
import { config } from "@repo/config";

// Force TypeScript to accept the construct signature on the imported module
const Redis = moduleRedis as unknown as any;

// Redis Connection
const connection = new Redis(config.redisUrl);

// Queues
export const aiQueue = new Queue("ai-processing", { connection });
export const reminderQueue = new Queue("daily-reminders", { connection });

console.log("👷 Background Workers Initializing...");

// AI Worker
const aiWorker = new Worker(
  "ai-processing",
  async (job) => {
    console.log(`[AI Worker] Processing document: ${job.data.documentId}`);
    try {
      await processDocumentWithAI(job.data.documentId, job.data.userId);
      console.log(
        `[AI Worker] Successfully processed document: ${job.data.documentId}`,
      );
    } catch (error: any) {
      console.error(
        `[AI Worker] Error processing document: ${job.data.documentId}`,
        error.message,
      );
      throw error;
    }
  },
  { connection },
);

// Daily Reminder Worker
const reminderWorker = new Worker(
  "daily-reminders",
  async () => {
    console.log(`[Reminder Worker] Checking for due reminders...`);
    const today = new Date();

    const dueReminders = await prisma.reminder.findMany({
      where: {
        reminderDate: { lte: today },
        status: "PENDING",
      },
      include: { document: true },
    });

    console.log(
      `[Reminder Worker] Found ${dueReminders.length} due reminders.`,
    );

    for (const reminder of dueReminders) {
      console.log(
        `🔔 NOTIFICATION: Document "${reminder.document.title}" has an upcoming expiry!`,
      );

      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { status: "SENT" },
      });
    }
  },
  { connection },
);

// Setup cron job for daily reminders
async function scheduleCronJobs() {
  await reminderQueue.add(
    "check-reminders",
    {},
    {
      repeat: {
        pattern: "0 8 * * *", // Every day at 8:00 AM
      },
    },
  );
  console.log("⏰ Daily reminder cron job scheduled.");
}

scheduleCronJobs();

aiWorker.on("failed", (job, err) => {
  console.error(`[AI Worker] Job ${job?.id} failed with error:`, err.message);
});

reminderWorker.on("failed", (job, err) => {
  console.error(
    `[Reminder Worker] Job ${job?.id} failed with error:`,
    err.message,
  );
});
