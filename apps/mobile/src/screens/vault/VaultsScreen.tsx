import React, { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Button,
  Card,
  Dialog,
  FAB,
  Portal,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";
import { vaultApi } from "../../api/vaultApi";
import { EmptyState } from "../../components/EmptyState";
import { ScreenContainer } from "../../components/ScreenContainer";
import { SectionHeader } from "../../components/SectionHeader";
import { SwipeRow } from "../../components/SwipeRow";
import { VaultStackParamList } from "../../navigation/types";
import { Vault } from "../../types/api";
import { formatDate, getErrorMessage } from "../../utils/format";

type Props = NativeStackScreenProps<VaultStackParamList, "Vaults">;

export function VaultsScreen({ navigation }: Props) {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState("");
  const [createVisible, setCreateVisible] = useState(false);
  const [newVaultName, setNewVaultName] = useState("");
  const [creating, setCreating] = useState(false);

  const loadVaults = useCallback(async () => {
    try {
      setError("");
      const data = await vaultApi.getVaults();
      setVaults(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadVaults();
    }, [loadVaults]),
  );

  async function onCreateVault() {
    if (!newVaultName.trim()) {
      return;
    }

    setCreating(true);
    try {
      await vaultApi.createVault(newVaultName.trim());
      setNewVaultName("");
      setCreateVisible(false);
      await loadVaults();
      setSnackbar("Vault created");
    } catch (createError) {
      setSnackbar(getErrorMessage(createError));
    } finally {
      setCreating(false);
    }
  }

  function onDeleteVault(vault: Vault) {
    Alert.alert(
      "Delete Vault",
      `Delete "${vault.name}" and all folders/documents inside it?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await vaultApi.deleteVault(vault.id);
              setVaults((current) => current.filter((item) => item.id !== vault.id));
              setSnackbar("Vault deleted");
            } catch (deleteError) {
              setSnackbar(getErrorMessage(deleteError));
            }
          },
        },
      ],
    );
  }

  return (
    <ScreenContainer style={{ flex: 1 }}>
      <SectionHeader
        title="Your Vaults"
        subtitle="Organize folders and encrypted documents per vault"
      />

      {loading ? (
        <Card mode="outlined">
          <Card.Content>
            <Text>Loading vaults...</Text>
          </Card.Content>
        </Card>
      ) : error ? (
        <EmptyState
          title="Failed to load vaults"
          message={error}
          actionLabel="Retry"
          onActionPress={loadVaults}
        />
      ) : (
        <FlatList
          data={vaults}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadVaults();
          }}
          contentContainerStyle={{ paddingBottom: 90 }}
          ListEmptyComponent={
            <EmptyState
              title="No vaults created"
              message="Create your first vault to start managing folders and documents."
              actionLabel="Create Vault"
              onActionPress={() => setCreateVisible(true)}
            />
          }
          renderItem={({ item }) => (
            <SwipeRow actionLabel="Delete" onActionPress={() => onDeleteVault(item)}>
              <Card
                mode="elevated"
                style={styles.vaultCard}
                onPress={() =>
                  navigation.navigate("VaultDetail", {
                    vaultId: item.id,
                    vaultName: item.name,
                  })
                }
              >
                <Card.Content>
                  <Text variant="titleMedium">{item.name}</Text>
                  <Text variant="bodySmall" style={styles.meta}>
                    Created {formatDate(item.createdAt)}
                  </Text>
                </Card.Content>
              </Card>
            </SwipeRow>
          )}
        />
      )}

      <FAB icon="plus" style={styles.fab} onPress={() => setCreateVisible(true)} />

      <Portal>
        <Dialog visible={createVisible} onDismiss={() => setCreateVisible(false)}>
          <Dialog.Title>Create Vault</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              label="Vault name"
              value={newVaultName}
              onChangeText={setNewVaultName}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCreateVisible(false)}>Cancel</Button>
            <Button
              onPress={onCreateVault}
              loading={creating}
              disabled={creating || !newVaultName.trim()}
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
  vaultCard: {
    borderRadius: 14,
    marginBottom: 10,
  },
  meta: {
    marginTop: 4,
    opacity: 0.7,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});

