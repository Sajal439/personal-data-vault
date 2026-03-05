import { FastifyInstance } from "fastify";
import {
  signupController,
  loginController,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export default async function authRoutes(app: FastifyInstance) {
  app.post("/signup", { preHandler: authMiddleware }, signupController);

  app.post("/login", { preHandler: authMiddleware }, loginController);

  // app.get("/protected", { preHandler: authMiddleware }, async (req, reply) => {
  //   return reply.send({
  //     success: true,
  //     message: "You accessed a protected route",
  //     user: req.user,
  //   });
  // });
}
