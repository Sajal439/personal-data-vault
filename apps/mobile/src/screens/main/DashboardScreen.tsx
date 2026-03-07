import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Button, Card, Text } from "react-native-paper";
import { reminderApi } from "../../api/reminderApi";
import { vaultApi } from "../../api/vaultApi";
import { EmptyState } from "../../components/EmptyState";
import { ScreenContainer } from "../../components/ScreenContainer";
import { SectionHeader } from "../../components/SectionHeader";
import { MainTabParamList } from "../../navigation/types";
import { Reminder } from "../../types/api";
import { formatDate, getErrorMessage } from "../../utils/format";

type Props = BottomTabScreenProps<MainTabParamList, "Dashboard">;

export function DashboardScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vaultCount, setVaultCount] = useState(0);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setError("");
      const [vaults, reminderItems] = await Promise.all([
        vaultApi.getVaults(),
        reminderApi.getReminders(),
      ]);

      setVaultCount(vaults.length);
      setReminders(reminderItems);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  return (
    <ScreenContainer
      scroll
      contentContainerStyle={{ paddingBottom: 30 }}
      style={{ paddingBottom: 8 }}
    >
      <SectionHeader
        title="Overview"
        subtitle="Your encrypted personal data system at a glance"
      />

      <View style={styles.summaryGrid}>
        <Card mode="elevated" style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium">Vaults</Text>
            <Text variant="displaySmall" style={styles.metric}>
              {vaultCount}
            </Text>
          </Card.Content>
        </Card>
        <Card mode="elevated" style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium">Active Reminders</Text>
            <Text variant="displaySmall" style={styles.metric}>
              {reminders.length}
            </Text>
          </Card.Content>
        </Card>
      </View>

      <Card mode="contained" style={styles.quickActions}>
        <Card.Content>
          <Text variant="titleMedium">Quick Actions</Text>
          <View style={styles.actionsRow}>
            <Button
              mode="contained-tonal"
              icon="folder-plus"
              onPress={() => navigation.navigate("Vault")}
            >
              Open Vault
            </Button>
            <Button
              mode="contained-tonal"
              icon="magnify"
              onPress={() => navigation.navigate("Search")}
            >
              Search
            </Button>
          </View>
        </Card.Content>
      </Card>

      <SectionHeader title="Upcoming Reminders" />
      {loading ? (
        <Card>
          <Card.Content>
            <Text>Loading your dashboard...</Text>
          </Card.Content>
        </Card>
      ) : error ? (
        <EmptyState title="Could not load dashboard" message={error} />
      ) : reminders.length === 0 ? (
        <EmptyState
          title="No reminders yet"
          message="Create reminders from document details to track expiry dates."
          actionLabel="Open Vault"
          onActionPress={() => navigation.navigate("Vault")}
        />
      ) : (
        reminders.slice(0, 5).map((reminder) => (
          <Card key={reminder.id} mode="outlined" style={styles.reminderCard}>
            <Card.Content>
              <Text variant="titleSmall">{reminder.document.title}</Text>
              <Text variant="bodySmall" style={styles.reminderMeta}>
                Reminder date: {formatDate(reminder.reminderDate)}
              </Text>
            </Card.Content>
          </Card>
        ))
      )}

      <Button
        mode="text"
        onPress={() => {
          setRefreshing(true);
          loadData();
        }}
        loading={refreshing}
      >
        Refresh Dashboard
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
  },
  metric: {
    marginTop: 8,
    fontWeight: "700",
  },
  quickActions: {
    borderRadius: 16,
    marginBottom: 16,
  },
  actionsRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  reminderCard: {
    marginBottom: 8,
    borderRadius: 14,
  },
  reminderMeta: {
    marginTop: 4,
    opacity: 0.75,
  },
});
