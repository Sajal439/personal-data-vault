import { FastifyInstance } from "fastify";
import {
  signupController,
  loginController,
  refreshTokenController,
} from "../controllers/auth.controller.js";

export default async function authRoutes(app: FastifyInstance) {
  app.post("/signup", signupController);

  app.post("/login", loginController);
  app.post("/refresh", refreshTokenController);

  // app.get("/protected", { preHandler: authMiddleware }, async (req, reply) => {
  //   return reply.send({
  //     success: true,
  //     message: "You accessed a protected route",
  //     user: req.user,
  //   });
  // });
}
