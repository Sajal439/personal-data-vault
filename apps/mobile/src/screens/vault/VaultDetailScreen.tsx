import React, { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Button,
  Card,
  Dialog,
  FAB,
  List,
  Portal,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";
import { folderApi } from "../../api/folderApi";
import { EmptyState } from "../../components/EmptyState";
import { ScreenContainer } from "../../components/ScreenContainer";
import { SectionHeader } from "../../components/SectionHeader";
import { SwipeRow } from "../../components/SwipeRow";
import { VaultStackParamList } from "../../navigation/types";
import { Folder } from "../../types/api";
import { getErrorMessage } from "../../utils/format";

type Props = NativeStackScreenProps<VaultStackParamList, "VaultDetail">;

export function VaultDetailScreen({ route, navigation }: Props) {
  const { vaultId } = route.params;
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState("");
  const [createVisible, setCreateVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [folderName, setFolderName] = useState("");

  const loadFolders = useCallback(async () => {
    try {
      setError("");
      const data = await folderApi.getFolders(vaultId);
      setFolders(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [vaultId]);

  useFocusEffect(
    useCallback(() => {
      loadFolders();
    }, [loadFolders]),
  );

  async function onCreateFolder() {
    if (!folderName.trim()) {
      return;
    }

    setCreating(true);
    try {
      await folderApi.createFolder(vaultId, folderName.trim());
      setFolderName("");
      setCreateVisible(false);
      await loadFolders();
      setSnackbar("Folder created");
    } catch (createError) {
      setSnackbar(getErrorMessage(createError));
    } finally {
      setCreating(false);
    }
  }

  function onDeleteFolder(folder: Folder) {
    Alert.alert("Delete Folder", `Delete "${folder.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await folderApi.deleteFolder(folder.id);
            setFolders((current) => current.filter((item) => item.id !== folder.id));
            setSnackbar("Folder deleted");
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
        title="Folders"
        subtitle="Swipe left on a folder to delete it quickly"
      />

      {loading ? (
        <Card mode="outlined">
          <Card.Content>
            <Text>Loading folders...</Text>
          </Card.Content>
        </Card>
      ) : error ? (
        <EmptyState
          title="Failed to load folders"
          message={error}
          actionLabel="Retry"
          onActionPress={loadFolders}
        />
      ) : (
        <FlatList
          data={folders}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadFolders();
          }}
          contentContainerStyle={{ paddingBottom: 90 }}
          ListEmptyComponent={
            <EmptyState
              title="No folders in this vault"
              message="Create a folder and start uploading documents."
              actionLabel="Create Folder"
              onActionPress={() => setCreateVisible(true)}
            />
          }
          renderItem={({ item }) => (
            <SwipeRow actionLabel="Delete" onActionPress={() => onDeleteFolder(item)}>
              <Card mode="elevated" style={styles.folderCard}>
                <Card.Content>
                  <List.Item
                    title={item.name}
                    description={
                      item.parentId ? "Nested folder" : "Top-level folder"
                    }
                    left={(props) => <List.Icon {...props} icon="folder" />}
                    right={(props) => <List.Icon {...props} icon="chevron-right" />}
                    onPress={() =>
                      navigation.navigate("FolderDocuments", {
                        vaultId,
                        folderId: item.id,
                        folderName: item.name,
                      })
                    }
                  />
                </Card.Content>
              </Card>
            </SwipeRow>
          )}
        />
      )}

      <View style={styles.footerButtons}>
        <Button mode="outlined" icon="plus" onPress={() => setCreateVisible(true)}>
          New Folder
        </Button>
      </View>

      <FAB icon="plus" style={styles.fab} onPress={() => setCreateVisible(true)} />

      <Portal>
        <Dialog visible={createVisible} onDismiss={() => setCreateVisible(false)}>
          <Dialog.Title>Create Folder</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              label="Folder name"
              value={folderName}
              onChangeText={setFolderName}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCreateVisible(false)}>Cancel</Button>
            <Button
              onPress={onCreateFolder}
              loading={creating}
              disabled={creating || !folderName.trim()}
            >
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={Boolean(snackbar)} onDismiss={() => setSnackbar("")}>
        {snackbar}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  folderCard: {
    borderRadius: 14,
    marginBottom: 10,
  },
  footerButtons: {
    paddingBottom: 12,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});

