import { z } from "zod";
import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import {
  createReminder,
  getUserReminders,
  dismissReminder,
} from "../services/reminder.service.js";

const createReminderSchema = z.object({
  documentId: z.string().uuid(),
  reminderDate: z.string().datetime(), // ISO 8601
});

export const createReminderController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { documentId, reminderDate } = createReminderSchema.parse(req.body);
    const userId = req.user!.userId;

    const reminder = await createReminder(
      documentId,
      userId,
      new Date(reminderDate),
    );

    return reply
      .status(201)
      .send(apiResponse(reminder, "Reminder created successfully"));
  },
);

export const getRemindersController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = req.user!.userId;
    const reminders = await getUserReminders(userId);

    return reply
      .status(200)
      .send(apiResponse(reminders, "Reminders fetched successfully"));
  },
);

export const dismissReminderController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const userId = req.user!.userId;

    await dismissReminder(id, userId);

    return reply
      .status(200)
      .send(apiResponse(null, "Reminder dismissed successfully"));
  },
);
