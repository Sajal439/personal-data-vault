import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { signup, login, refreshAuthToken } from "../services/auth.service.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const signupController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = authSchema.parse(req.body);

    const result = await signup(email, password);

    return reply
      .status(201)
      .send(apiResponse(result, "User created successfully"));
  },
);

export const loginController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = authSchema.parse(req.body);

    const result = await login(email, password);

    return reply.status(200).send(apiResponse(result, "Login successful"));
  },
);

export const refreshTokenController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const { refreshToken } = refreshSchema.parse(req.body);
    const result = await refreshAuthToken(refreshToken);

    return reply.status(200).send(apiResponse(result, "Token refreshed"));
  },
);
