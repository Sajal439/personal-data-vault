import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getProfileController,
  updateProfileController,
} from "../controllers/profile.controller.js";

export default async function profileRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: authMiddleware }, getProfileController);

  app.put("/", { preHandler: authMiddleware }, updateProfileController);
}
