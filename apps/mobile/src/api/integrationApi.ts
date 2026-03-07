import { Integration } from "../types/api";
import { request } from "./httpClient";

type Provider = "GOOGLE_DRIVE" | "DROPBOX";

export const integrationApi = {
  getIntegrations: () => request<Integration[]>("/integration"),
  saveIntegration: (payload: {
    provider: Provider;
    accessToken: string;
    refreshToken?: string;
  }) =>
    request<Integration>("/integration", {
      method: "POST",
      body: payload,
    }),
  deleteIntegration: (integrationId: string) =>
    request<null>(`/integration/${integrationId}`, {
      method: "DELETE",
    }),
};

