import { FastifyInstance } from "fastify";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  signupController,
  loginController,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export default async function authRoutes(app: FastifyInstance) {
  app.post("/signup", asyncHandler(signupController));

  app.post("/login", asyncHandler(loginController));

  // app.get("/protected", { preHandler: authMiddleware }, async (req, reply) => {
  //   return reply.send({
  //     success: true,
  //     message: "You accessed a protected route",
  //     user: req.user,
  //   });
  // });
}
