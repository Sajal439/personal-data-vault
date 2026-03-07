import React, { PropsWithChildren, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { RectButton, Swipeable } from "react-native-gesture-handler";

interface SwipeRowProps extends PropsWithChildren {
  actionLabel: string;
  onActionPress: () => void;
  actionColor?: string;
}

export function SwipeRow({
  children,
  actionLabel,
  onActionPress,
  actionColor = "#C62828",
}: SwipeRowProps) {
  const rowRef = useRef<Swipeable>(null);

  return (
    <Swipeable
      ref={rowRef}
      overshootRight={false}
      renderRightActions={() => (
        <View style={styles.actionContainer}>
          <RectButton
            style={[styles.actionButton, { backgroundColor: actionColor }]}
            onPress={() => {
              rowRef.current?.close();
              onActionPress();
            }}
          >
            <Text style={styles.actionLabel}>{actionLabel}</Text>
          </RectButton>
        </View>
      )}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actionContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    width: 96,
  },
  actionButton: {
    width: 88,
    marginVertical: 4,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: {
    color: "white",
    fontWeight: "700",
  },
});

