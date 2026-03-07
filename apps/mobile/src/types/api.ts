export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: unknown[];
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

export interface Vault {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  vaultId: string;
  parentId: string | null;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: string;
}

export interface DocumentTagEdge {
  id: string;
  documentId: string;
  tagId: string;
  tag: Tag;
}

export interface ShareLink {
  id: string;
  token: string;
  documentId: string;
  permission: "VIEW_ONLY" | "DOWNLOAD";
  expiresAt: string;
  maxAccesses: number | null;
  revokedAt: string | null;
  createdAt: string;
  _count?: {
    accessLogs: number;
  };
}

export interface DocumentItem {
  id: string;
  title: string;
  mimeType: string;
  size: number;
  folderId: string;
  encrypted: boolean;
  extractedText: string | null;
  expiryDate: string | null;
  aiProcessed: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: DocumentTagEdge[];
  shareLinks?: ShareLink[];
}

export interface Reminder {
  id: string;
  documentId: string;
  reminderDate: string;
  status: "PENDING" | "SENT" | "DISMISSED";
  createdAt: string;
  updatedAt: string;
  document: {
    id: string;
    title: string;
    expiryDate: string | null;
  };
}

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

export interface Integration {
  id: string;
  provider: "GOOGLE_DRIVE" | "DROPBOX";
  hasRefreshToken: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult extends DocumentItem {
  folder: {
    id: string;
    name: string;
  };
}

