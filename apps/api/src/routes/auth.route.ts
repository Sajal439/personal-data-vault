import { FastifyInstance } from "fastify";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  signupController,
  loginController,
} from "../controllers/auth.controller.js";

export default async function authRoutes(app: FastifyInstance) {
  app.post("/signup", asyncHandler(signupController));

  app.post("/login", asyncHandler(loginController));
}
