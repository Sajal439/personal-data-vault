import { prisma } from "@repo/db";
import { ApiError } from "../utils/apiError.js";

/**
 * Creates a new reminder for a document.
 */
export async function createReminder(
  documentId: string,
  userId: string,
  reminderDate: Date,
) {
  // Ensure the user owns the document
  const document = await prisma.document.findFirst({
    where: { id: documentId, folder: { vault: { userId } } },
  });

  if (!document) {
    throw new ApiError(404, "Document not found to attach reminder");
  }

  return prisma.reminder.create({
    data: { documentId, reminderDate },
  });
}

/**
 * Gets all active/pending reminders for a user, ordered by date.
 */
export async function getUserReminders(userId: string) {
  return prisma.reminder.findMany({
    where: {
      document: { folder: { vault: { userId } } },
      status: { not: "DISMISSED" },
    },
    include: {
      document: { select: { id: true, title: true, expiryDate: true } },
    },
    orderBy: { reminderDate: "asc" },
  });
}

/**
 * Dismisses a reminder, changing its status.
 */
export async function dismissReminder(reminderId: string, userId: string) {
  const reminder = await prisma.reminder.findFirst({
    where: { id: reminderId, document: { folder: { vault: { userId } } } },
  });

  if (!reminder) {
    throw new ApiError(404, "Reminder not found");
  }

  return prisma.reminder.update({
    where: { id: reminderId },
    data: { status: "DISMISSED" },
  });
}
