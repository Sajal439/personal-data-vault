import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Card, List, Snackbar, Text } from "react-native-paper";
import { reminderApi } from "../../api/reminderApi";
import { EmptyState } from "../../components/EmptyState";
import { ScreenContainer } from "../../components/ScreenContainer";
import { SectionHeader } from "../../components/SectionHeader";
import { SwipeRow } from "../../components/SwipeRow";
import { Reminder } from "../../types/api";
import { formatDate, getErrorMessage } from "../../utils/format";

export function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState("");

  const loadReminders = useCallback(async () => {
    try {
      const data = await reminderApi.getReminders();
      setReminders(data);
    } catch (loadError) {
      setSnackbar(getErrorMessage(loadError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [loadReminders]),
  );

  async function dismissReminder(reminder: Reminder) {
    try {
      await reminderApi.dismissReminder(reminder.id);
      setReminders((current) => current.filter((item) => item.id !== reminder.id));
      setSnackbar("Reminder dismissed");
    } catch (dismissError) {
      setSnackbar(getErrorMessage(dismissError));
    }
  }

  return (
    <ScreenContainer style={{ flex: 1 }}>
      <SectionHeader
        title="Reminders"
        subtitle="Swipe left to dismiss completed reminders"
      />

      {loading ? (
        <Card>
          <Card.Content>
            <Text>Loading reminders...</Text>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadReminders();
          }}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <EmptyState
              title="No active reminders"
              message="Create reminders from document details to track expiry events."
            />
          }
          renderItem={({ item }) => (
            <SwipeRow actionLabel="Dismiss" onActionPress={() => dismissReminder(item)}>
              <Card mode="elevated" style={styles.card}>
                <Card.Content>
                  <List.Item
                    title={item.document.title}
                    description={`Reminder: ${formatDate(item.reminderDate)}`}
                    left={(props) => <List.Icon {...props} icon="calendar-clock" />}
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
  card: {
    borderRadius: 14,
    marginBottom: 10,
  },
});

