import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onActionPress,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text variant="titleMedium">{title}</Text>
      <Text variant="bodyMedium" style={styles.message}>
        {message}
      </Text>
      {actionLabel && onActionPress ? (
        <Button mode="outlined" onPress={onActionPress}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: 24,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    gap: 8,
  },
  message: {
    textAlign: "center",
    opacity: 0.75,
    marginBottom: 6,
  },
});

