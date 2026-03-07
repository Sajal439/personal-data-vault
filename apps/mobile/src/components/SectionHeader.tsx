import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">{title}</Text>
      {subtitle ? (
        <Text variant="bodyMedium" style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.75,
  },
});

