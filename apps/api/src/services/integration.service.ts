import { prisma } from "@repo/db";
import { ApiError } from "../utils/apiError.js";
import { IntegrationProvider } from "@prisma/client";

/**
 * Saves or updates an OAuth integration for a user.
 */
export async function saveIntegration(
  userId: string,
  provider: IntegrationProvider,
  accessToken: string,
  refreshToken?: string,
) {
  return prisma.integration.upsert({
    where: {
      userId_provider: {
        userId,
        provider,
      },
    },
    update: {
      accessToken,
      refreshToken,
    },
    create: {
      userId,
      provider,
      accessToken,
      refreshToken,
    },
  });
}

/**
 * Fetches configured integrations for a user.
 */
export async function getUserIntegrations(userId: string) {
  return prisma.integration.findMany({
    where: { userId },
    select: {
      id: true,
      provider: true,
      createdAt: true,
      updatedAt: true,
      // exclude sensitive tokens from view
    },
  });
}

/**
 * Deletes an integration.
 */
export async function deleteIntegration(integrationId: string, userId: string) {
  const integration = await prisma.integration.findFirst({
    where: { id: integrationId, userId },
  });

  if (!integration) {
    throw new ApiError(404, "Integration not found");
  }

  await prisma.integration.delete({
    where: { id: integrationId },
  });
}
