export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type VaultStackParamList = {
  Vaults: undefined;
  VaultDetail: {
    vaultId: string;
    vaultName: string;
  };
  FolderDocuments: {
    folderId: string;
    folderName: string;
    vaultId: string;
  };
  DocumentDetails: {
    documentId: string;
    folderId: string;
    documentTitle?: string;
  };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Vault: undefined;
  Search: undefined;
  Reminders: undefined;
  Profile: undefined;
};

