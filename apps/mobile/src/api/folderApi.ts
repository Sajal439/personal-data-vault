import { Folder } from "../types/api";
import { request } from "./httpClient";

export const folderApi = {
  getFolders: (vaultId: string) =>
    request<Folder[]>(`/folder/vault/${vaultId}/folder`),
  createFolder: (vaultId: string, name: string, parentId?: string) =>
    request<Folder>(`/folder/vault/${vaultId}/folder`, {
      method: "POST",
      body: {
        name,
        parentId,
      },
    }),
  deleteFolder: (folderId: string) =>
    request<Folder>(`/folder/${folderId}`, {
      method: "DELETE",
    }),
};

