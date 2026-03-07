import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Button,
  Card,
  Chip,
  SegmentedButtons,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";
import { documentApi } from "../../api/documentApi";
import { reminderApi } from "../../api/reminderApi";
import { EmptyState } from "../../components/EmptyState";
import { ScreenContainer } from "../../components/ScreenContainer";
import { SectionHeader } from "../../components/SectionHeader";
import { VaultStackParamList } from "../../navigation/types";
import { DocumentItem, ShareLink } from "../../types/api";
import { formatBytes, formatDate, getErrorMessage, toIsoDateTime } from "../../utils/format";

type Props = NativeStackScreenProps<VaultStackParamList, "DocumentDetails">;

export function DocumentDetailsScreen({ route, navigation }: Props) {
  const { documentId } = route.params;
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingAI, setProcessingAI] = useState(false);
  const [creatingShare, setCreatingShare] = useState(false);
  const [creatingReminder, setCreatingReminder] = useState(false);
  const [sharePermission, setSharePermission] = useState<"VIEW_ONLY" | "DOWNLOAD">(
    "VIEW_ONLY",
  );
  const [shareHours, setShareHours] = useState("24");
  const [maxAccesses, setMaxAccesses] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [snackbar, setSnackbar] = useState("");

  const loadDocument = useCallback(async () => {
    try {
      const data = await documentApi.getDocument(documentId);
      setDocument(data);
    } catch (loadError) {
      setSnackbar(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useFocusEffect(
    useCallback(() => {
      loadDocument();
    }, [loadDocument]),
  );

  async function onProcessAI() {
    setProcessingAI(true);
    try {
      const processed = await documentApi.processWithAI(documentId);
      setDocument(processed);
      setSnackbar("AI processing completed");
    } catch (processError) {
      setSnackbar(getErrorMessage(processError));
    } finally {
      setProcessingAI(false);
    }
  }

  async function onCreateShareLink() {
    const expiresInHours = Number(shareHours);
    if (!Number.isFinite(expiresInHours) || expiresInHours < 1 || expiresInHours > 720) {
      setSnackbar("Share expiry hours must be between 1 and 720");
      return;
    }

    const max = maxAccesses.trim() ? Number(maxAccesses.trim()) : undefined;
    if (max !== undefined && (!Number.isFinite(max) || max < 1)) {
      setSnackbar("Max accesses must be a positive number");
      return;
    }

    setCreatingShare(true);
    try {
      const created = await documentApi.createShareLink({
        documentId,
        permission: sharePermission,
        expiresInHours,
        maxAccesses: max,
      });

      setDocument((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          shareLinks: [created as ShareLink, ...(current.shareLinks || [])],
        };
      });
      setSnackbar("Share link created");
    } catch (shareError) {
      setSnackbar(getErrorMessage(shareError));
    } finally {
      setCreatingShare(false);
    }
  }

  async function onCreateReminder() {
    const isoDate = toIsoDateTime(reminderDate);
    if (!isoDate) {
      setSnackbar("Use YYYY-MM-DD format for reminder date");
      return;
    }

    setCreatingReminder(true);
    try {
      await reminderApi.createReminder(documentId, isoDate);
      setReminderDate("");
      setSnackbar("Reminder created");
    } catch (reminderError) {
      setSnackbar(getErrorMessage(reminderError));
    } finally {
      setCreatingReminder(false);
    }
  }

  function onDeleteDocument() {
    if (!document) {
      return;
    }

    Alert.alert("Delete Document", `Delete "${document.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await documentApi.deleteDocument(document.id);
            setSnackbar("Document deleted");
            navigation.goBack();
          } catch (deleteError) {
            setSnackbar(getErrorMessage(deleteError));
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <ScreenContainer>
        <Card>
          <Card.Content>
            <Text>Loading document...</Text>
          </Card.Content>
        </Card>
      </ScreenContainer>
    );
  }

  if (!document) {
    return (
      <ScreenContainer>
        <EmptyState
          title="Document not found"
          message="This document could not be loaded."
          actionLabel="Go Back"
          onActionPress={() => navigation.goBack()}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <SectionHeader title={document.title} subtitle="Metadata and actions" />

      <Card mode="outlined" style={styles.card}>
        <Card.Content style={styles.metaGrid}>
          <Text variant="bodyMedium">Type: {document.mimeType}</Text>
          <Text variant="bodyMedium">Size: {formatBytes(document.size)}</Text>
          <Text variant="bodyMedium">Uploaded: {formatDate(document.createdAt)}</Text>
          <Text variant="bodyMedium">
            AI processed: {document.aiProcessed ? "Yes" : "No"}
          </Text>
          <Text variant="bodyMedium">Expiry: {formatDate(document.expiryDate)}</Text>
          <Text variant="bodyMedium">Encrypted: {document.encrypted ? "Yes" : "No"}</Text>
        </Card.Content>
      </Card>

      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Tags</Text>
          <View style={styles.tagsWrap}>
            {document.tags?.length ? (
              document.tags.map((item) => (
                <Chip key={item.id} compact>
                  {item.tag.name}
                </Chip>
              ))
            ) : (
              <Text variant="bodySmall" style={styles.muted}>
                No tags attached
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>

      <Card mode="outlined" style={styles.card}>
        <Card.Content style={styles.sectionGap}>
          <Text variant="titleMedium">Secure Sharing</Text>
          <SegmentedButtons
            value={sharePermission}
            onValueChange={(value) =>
              setSharePermission(value as "VIEW_ONLY" | "DOWNLOAD")
            }
            buttons={[
              { value: "VIEW_ONLY", label: "View Only" },
              { value: "DOWNLOAD", label: "Download" },
            ]}
          />
          <TextInput
            mode="outlined"
            label="Expires in hours"
            value={shareHours}
            keyboardType="number-pad"
            onChangeText={setShareHours}
          />
          <TextInput
            mode="outlined"
            label="Max accesses (optional)"
            value={maxAccesses}
            keyboardType="number-pad"
            onChangeText={setMaxAccesses}
          />
          <Button
            mode="contained"
            icon="share-variant"
            loading={creatingShare}
            onPress={onCreateShareLink}
          >
            Create Share Link
          </Button>
          {document.shareLinks?.length ? (
            <View style={styles.sectionGap}>
              {document.shareLinks.map((link) => (
                <Card mode="contained" key={link.id}>
                  <Card.Content>
                    <Text variant="titleSmall">{link.permission}</Text>
                    <Text variant="bodySmall" numberOfLines={1}>
                      Token: {link.token}
                    </Text>
                    <Text variant="bodySmall">
                      Expires: {formatDate(link.expiresAt)}
                    </Text>
                  </Card.Content>
                </Card>
              ))}
            </View>
          ) : null}
        </Card.Content>
      </Card>

      <Card mode="outlined" style={styles.card}>
        <Card.Content style={styles.sectionGap}>
          <Text variant="titleMedium">Reminder</Text>
          <TextInput
            mode="outlined"
            label="Reminder date (YYYY-MM-DD)"
            value={reminderDate}
            onChangeText={setReminderDate}
          />
          <Button
            mode="contained-tonal"
            icon="calendar-clock"
            loading={creatingReminder}
            onPress={onCreateReminder}
          >
            Add Reminder
          </Button>
        </Card.Content>
      </Card>

      <Card mode="outlined" style={styles.card}>
        <Card.Content style={styles.sectionGap}>
          <Text variant="titleMedium">AI Actions</Text>
          <Button
            mode="contained-tonal"
            icon="robot-outline"
            loading={processingAI}
            onPress={onProcessAI}
          >
            Run AI Processing
          </Button>
          <Text variant="bodySmall" style={styles.muted}>
            AI can extract text, classify document type, and infer expiry dates.
          </Text>
        </Card.Content>
      </Card>

      <Button
        mode="text"
        icon="delete-outline"
        textColor="#B00020"
        onPress={onDeleteDocument}
      >
        Delete Document
      </Button>

      <Snackbar visible={Boolean(snackbar)} onDismiss={() => setSnackbar("")}>
        {snackbar}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    marginBottom: 12,
  },
  metaGrid: {
    gap: 4,
  },
  tagsWrap: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  muted: {
    opacity: 0.7,
  },
  sectionGap: {
    gap: 10,
  },
});

