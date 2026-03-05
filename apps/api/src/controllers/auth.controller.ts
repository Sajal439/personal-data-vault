import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { signup, login } from "../services/auth.service.js";
import { apiResponse } from "../utils/apiResponse.js";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function signupController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { email, password } = authSchema.parse(req.body);

  const result = await signup(email, password);

  return reply
    .status(201)
    .send(apiResponse(result, "User created successfully"));
}

export async function loginController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { email, password } = authSchema.parse(req.body);

  const result = await login(email, password);

  return reply.status(200).send(apiResponse(result, "Login successful"));
}
