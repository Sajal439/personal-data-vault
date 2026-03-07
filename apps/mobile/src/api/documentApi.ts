import { DocumentItem, ShareLink } from "../types/api";
import { request } from "./httpClient";

export interface UploadableFile {
  uri: string;
  name: string;
  type: string;
}

export const documentApi = {
  getDocuments: (folderId: string) =>
    request<DocumentItem[]>(`/document/folder/${folderId}`),
  getDocument: (documentId: string) =>
    request<DocumentItem>(`/document/${documentId}`),
  deleteDocument: (documentId: string) =>
    request<null>(`/document/${documentId}`, {
      method: "DELETE",
    }),
  uploadDocument: async (folderId: string, file: UploadableFile) => {
    const form = new FormData();

    form.append("folderId", folderId);
    form.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    return request<DocumentItem>("/document/upload", {
      method: "POST",
      body: form,
      isMultipart: true,
    });
  },
  processWithAI: (documentId: string) =>
    request<DocumentItem>(`/ai/document/${documentId}/process`, {
      method: "POST",
    }),
  createShareLink: (payload: {
    documentId: string;
    expiresInHours: number;
    permission: "VIEW_ONLY" | "DOWNLOAD";
    maxAccesses?: number;
  }) =>
    request<ShareLink>("/share", {
      method: "POST",
      body: payload,
    }),
};
