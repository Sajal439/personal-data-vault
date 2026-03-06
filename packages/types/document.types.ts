export interface DocumentResponse {
  id: string;
  title: string;
  mimeType: string;
  size: number;
  encrypted: boolean;
  folderId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TagResponse {
  id: string;
  name: string;
  createdAt: Date;
}

export interface ShareLinkResponse {
  id: string;
  token: string;
  documentId: string;
  permission: "VIEW_ONLY" | "DOWNLOAD";
  maxAccesses: number | null;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface AccessLogResponse {
  id: string;
  documentId: string;
  shareLinkId: string | null;
  accessedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
}
