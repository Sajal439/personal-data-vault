import React, { PropsWithChildren } from "react";
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

interface ScreenContainerProps extends PropsWithChildren {
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function ScreenContainer({
  children,
  scroll = false,
  style,
  contentContainerStyle,
}: ScreenContainerProps) {
  if (scroll) {
    return (
      <ScrollView
        style={styles.base}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      >
        <View style={style}>{children}</View>
      </ScrollView>
    );
  }

  return <View style={[styles.base, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});

