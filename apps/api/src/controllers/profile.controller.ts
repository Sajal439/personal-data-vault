import { z } from "zod";
import { FastifyReply, FastifyRequest } from "fastify";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { getProfile, updateProfile } from "../services/profile.service.js";

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
});

export const getProfileController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = req.user!.userId;
    const profile = await getProfile(userId);

    return reply
      .status(200)
      .send(apiResponse(profile, "Profile fetched successfully"));
  },
);

export const updateProfileController = asyncHandler(
  async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = req.user!.userId;
    const data = updateProfileSchema.parse(req.body);

    const profile = await updateProfile(userId, data);

    return reply
      .status(200)
      .send(apiResponse(profile, "Profile updated successfully"));
  },
);
