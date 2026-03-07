import { prisma, IntegrationProvider } from "@repo/db";
import { ApiError } from "../utils/apiError.js";
import { encryptSecret, isEncryptedSecret } from "./encryption.service.js";

/**
 * Saves or updates an OAuth integration for a user.
 */
export async function saveIntegration(
  userId: string,
  provider: IntegrationProvider,
  accessToken: string,
  refreshToken?: string,
) {
  const encryptedAccessToken = isEncryptedSecret(accessToken)
    ? accessToken
    : encryptSecret(accessToken);

  const encryptedRefreshToken = refreshToken
    ? isEncryptedSecret(refreshToken)
      ? refreshToken
      : encryptSecret(refreshToken)
    : undefined;

  return prisma.integration.upsert({
    where: {
      userId_provider: {
        userId,
        provider,
      },
    },
    update: {
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
    },
    create: {
      userId,
      provider,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
    },
  });
}

/**
 * Fetches configured integrations for a user.
 */
export async function getUserIntegrations(userId: string) {
  const integrations = await prisma.integration.findMany({
    where: { userId },
    select: {
      id: true,
      provider: true,
      accessToken: true,
      refreshToken: true,
      createdAt: true,
      updatedAt: true,
      // exclude sensitive tokens from view
    },
    orderBy: { provider: "asc" },
  });

  const normalizedIntegrations = await Promise.all(
    integrations.map(async (integration) => {
      const encryptedAccessToken = isEncryptedSecret(integration.accessToken)
        ? integration.accessToken
        : encryptSecret(integration.accessToken);

      const encryptedRefreshToken = integration.refreshToken
        ? isEncryptedSecret(integration.refreshToken)
          ? integration.refreshToken
          : encryptSecret(integration.refreshToken)
        : null;

      if (
        encryptedAccessToken !== integration.accessToken ||
        encryptedRefreshToken !== integration.refreshToken
      ) {
        await prisma.integration.update({
          where: { id: integration.id },
          data: {
            accessToken: encryptedAccessToken,
            refreshToken: encryptedRefreshToken,
          },
        });
      }

      return {
        id: integration.id,
        provider: integration.provider,
        hasRefreshToken: Boolean(encryptedRefreshToken),
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt,
      };
    }),
  );

  return normalizedIntegrations.map((integration) => ({
    id: integration.id,
    provider: integration.provider,
    hasRefreshToken: integration.hasRefreshToken,
    createdAt: integration.createdAt,
    updatedAt: integration.updatedAt,
  }));
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
