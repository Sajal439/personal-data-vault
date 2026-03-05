import { FastifyReply, FastifyRequest } from "fastify";
import { ApiError } from "./apiError.js";
import * as z from "zod";

type AsyncRouteHandler = (
  req: FastifyRequest,
  reply: FastifyReply,
) => Promise<void>;

export const asyncHandler =
  (fn: AsyncRouteHandler) =>
  async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      await fn(req, reply);
    } catch (error: unknown) {
      // Zod v4 validation errors
      if (error instanceof z.ZodError) {
        reply.status(400).send({
          success: false,
          message: "Validation failed",
          errors: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
        return;
      }

      if (error instanceof ApiError) {
        reply.status(error.statusCode).send({
          success: false,
          message: error.message,
          errors: error.errors,
        });
        return;
      }

      reply.status(500).send({
        success: false,
        message: "Internal Server Error",
      });
    }
  };
