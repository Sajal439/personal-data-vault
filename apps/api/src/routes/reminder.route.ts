import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createReminderController,
  getRemindersController,
  dismissReminderController,
} from "../controllers/reminder.controller.js";

export default async function reminderRoutes(app: FastifyInstance) {
  app.post("/", { preHandler: authMiddleware }, createReminderController);
  app.get("/", { preHandler: authMiddleware }, getRemindersController);
  app.patch(
    "/:id/dismiss",
    { preHandler: authMiddleware },
    dismissReminderController,
  );
}
