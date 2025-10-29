// components/NavCard.tsx
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function NavCard({
  title,
  subtitle,
  onPress,
  accent = "#3b82f6", // blue by default
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
  accent?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "#e6eefc" }}
      style={({ pressed }) => [
        s.card,
        { borderLeftColor: accent },
        pressed && s.cardPressed,
      ]}
    >
      <View style={s.cardHeaderRow}>
        <View
          style={[
            s.pill,
            { backgroundColor: `${accent}18`, borderColor: `${accent}33` },
          ]}
        >
          <Text style={[s.pillText, { color: accent }]}>Open</Text>
        </View>
      </View>
      <Text style={s.cardTitle}>{title}</Text>
      <Text style={s.cardText}>{subtitle}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e9eef6",
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.96,
    transform: [{ scale: 0.997 }],
  },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  pill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: { fontSize: 11, fontWeight: "700" },
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a", marginBottom: 2 },
  cardText: { color: "#4b5563" },
});