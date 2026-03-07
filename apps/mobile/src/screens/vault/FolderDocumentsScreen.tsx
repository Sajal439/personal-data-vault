import React, { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import DocumentPicker from "react-native-document-picker";
import { launchCamera } from "react-native-image-picker";
import {
  ActivityIndicator,
  Button,
  Card,
  List,
  Snackbar,
  Text,
} from "react-native-paper";
import { documentApi, UploadableFile } from "../../api/documentApi";
import { EmptyState } from "../../components/EmptyState";
import { ScreenContainer } from "../../components/ScreenContainer";
import { SectionHeader } from "../../components/SectionHeader";
import { SwipeRow } from "../../components/SwipeRow";
import { VaultStackParamList } from "../../navigation/types";
import { DocumentItem } from "../../types/api";
import { formatBytes, formatDate, getErrorMessage } from "../../utils/format";

type Props = NativeStackScreenProps<VaultStackParamList, "FolderDocuments">;

export function FolderDocumentsScreen({ route, navigation }: Props) {
  const { folderId } = route.params;
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState("");

  const loadDocuments = useCallback(async () => {
    try {
      setError("");
      const data = await documentApi.getDocuments(folderId);
      setDocuments(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [folderId]);

  useFocusEffect(
    useCallback(() => {
      loadDocuments();
    }, [loadDocuments]),
  );

  async function uploadFile(file: UploadableFile) {
    setUploading(true);
    try {
      await documentApi.uploadDocument(folderId, file);
      await loadDocuments();
      setSnackbar("Document uploaded");
    } catch (uploadError) {
      setSnackbar(getErrorMessage(uploadError));
    } finally {
      setUploading(false);
    }
  }

  async function onPickDocument() {
    try {
      const picked = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });

      await uploadFile({
        uri: picked.uri,
        name: picked.name || "upload.file",
        type: picked.type || "application/octet-stream",
      });
    } catch (pickerError) {
      if (!DocumentPicker.isCancel(pickerError)) {
        setSnackbar(getErrorMessage(pickerError));
      }
    }
  }

  async function onScanDocument() {
    const result = await launchCamera({
      mediaType: "photo",
      quality: 0.9,
      saveToPhotos: false,
      includeBase64: false,
    });

    if (result.didCancel) {
      return;
    }

    if (result.errorMessage) {
      setSnackbar(result.errorMessage);
      return;
    }

    const asset = result.assets?.[0];
    if (!asset?.uri) {
      setSnackbar("Camera capture failed");
      return;
    }

    await uploadFile({
      uri: asset.uri,
      name: asset.fileName || `scan-${Date.now()}.jpg`,
      type: asset.type || "image/jpeg",
    });
  }

  function onDeleteDocument(document: DocumentItem) {
    Alert.alert("Delete Document", `Delete "${document.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await documentApi.deleteDocument(document.id);
            setDocuments((current) => current.filter((item) => item.id !== document.id));
            setSnackbar("Document deleted");
          } catch (deleteError) {
            setSnackbar(getErrorMessage(deleteError));
          }
        },
      },
    ]);
  }

  return (
    <ScreenContainer style={{ flex: 1 }}>
      <SectionHeader
        title="Documents"
        subtitle="Upload files or scan with camera for instant vault sync"
      />

      <View style={styles.actions}>
        <Button
          mode="contained-tonal"
          icon="file-upload"
          onPress={onPickDocument}
          disabled={uploading}
        >
          Upload File
        </Button>
        <Button
          mode="contained-tonal"
          icon="camera"
          onPress={onScanDocument}
          disabled={uploading}
        >
          Scan Document
        </Button>
      </View>

      {uploading ? (
        <View style={styles.uploadBanner}>
          <ActivityIndicator size="small" />
          <Text>Uploading...</Text>
        </View>
      ) : null}

      {loading ? (
        <Card mode="outlined">
          <Card.Content>
            <Text>Loading documents...</Text>
          </Card.Content>
        </Card>
      ) : error ? (
        <EmptyState
          title="Failed to load documents"
          message={error}
          actionLabel="Retry"
          onActionPress={loadDocuments}
        />
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadDocuments();
          }}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <EmptyState
              title="No documents yet"
              message="Upload a file or scan with camera to create your first encrypted document."
            />
          }
          renderItem={({ item }) => (
            <SwipeRow actionLabel="Delete" onActionPress={() => onDeleteDocument(item)}>
              <Card
                mode="elevated"
                style={styles.documentCard}
                onPress={() =>
                  navigation.navigate("DocumentDetails", {
                    documentId: item.id,
                    folderId,
                    documentTitle: item.title,
                  })
                }
              >
                <Card.Content>
                  <List.Item
                    title={item.title}
                    description={`Size ${formatBytes(item.size)}  |  Added ${formatDate(item.createdAt)}`}
                    left={(props) => <List.Icon {...props} icon="file-document-outline" />}
                    right={(props) => <List.Icon {...props} icon="chevron-right" />}
                  />
                </Card.Content>
              </Card>
            </SwipeRow>
          )}
        />
      )}

      <Snackbar visible={Boolean(snackbar)} onDismiss={() => setSnackbar("")}>
        {snackbar}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  uploadBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  documentCard: {
    borderRadius: 14,
    marginBottom: 10,
  },
});

