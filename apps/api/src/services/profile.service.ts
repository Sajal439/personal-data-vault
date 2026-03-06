import { prisma } from "@repo/db";
import { ApiError } from "../utils/apiError.js";

/**
 * Get user profile (excludes password).
 */
export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
}

/**
 * Update user profile fields.
 */
export async function updateProfile(
  userId: string,
  data: { name?: string; bio?: string; avatarUrl?: string },
) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
    },
  });
}
