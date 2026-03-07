import { Vault } from "../types/api";
import { request } from "./httpClient";

export const vaultApi = {
  getVaults: () => request<Vault[]>("/vault"),
  createVault: (name: string) =>
    request<Vault>("/vault", {
      method: "POST",
      body: { name },
    }),
  deleteVault: (vaultId: string) =>
    request<null>(`/vault/${vaultId}`, {
      method: "DELETE",
    }),
};

