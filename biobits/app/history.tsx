import * as Clipboard from "expo-clipboard";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useToast } from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import { clearHistory, HistoryItem, loadHistory } from "../lib/history";

type Filter = "all" | "clean" | "revcomp" | "transcribe" | "translate" | "quiz";

const TYPE_LABEL: Record<HistoryItem["type"], string> = {
  clean: "Clean",
  revcomp: "Rev-comp",
  transcribe: "Transcribe",
  translate: "Translate",
  quiz: "Quiz",
};

const TYPE_COLOR: Record<HistoryItem["type"], string> = {
  clean: "#0ea5e9",
  revcomp: "#10b981",
  transcribe: "#6366f1",
  translate: "#f59e0b",
  quiz: "#ef4444",
};

function Badge({ type }: { type: HistoryItem["type"] }) {
  const c = TYPE_COLOR[type];
  return (
    <View style={[S.badge, { borderColor: c + "33", backgroundColor: c + "18" }]}>
      <View style={[S.dot, { backgroundColor: c }]} />
      <Text style={[S.badgeText, { color: c }]}>{TYPE_LABEL[type]}</Text>
    </View>
  );
}

function fmtDate(ts: number) {
  const d = new Date(ts);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function MonoBlock({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <View style={S.monoBlock}>
      <View style={S.monoHead}>
        <Text style={S.monoLabel}>{label}</Text>
        <Pressable onPress={onCopy} style={S.ghostBtn}>
          <Text style={S.ghostBtnText}>Copy</Text>
        </Pressable>
      </View>
      <Text selectable style={S.monoText}>
        {value}
      </Text>
    </View>
  );
}

export default function HistoryScreen() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const toast = useToast();

  const { user, ready } = useAuth();

  const reload = useCallback(async () => {
    const list = await loadHistory();
    setItems(list);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const counts = useMemo(
    () => ({
      all: items.length,
      clean: items.filter((i) => i.type === "clean").length,
      revcomp: items.filter((i) => i.type === "revcomp").length,
      transcribe: items.filter((i) => i.type === "transcribe").length,
      translate: items.filter((i) => i.type === "translate").length,
      quiz: items.filter((i) => i.type === "quiz").length,
    }),
    [items]
  );

  const filtered = useMemo(() => {
    switch (filter) {
      case "clean":
        return items.filter((i) => i.type === "clean");
      case "revcomp":
        return items.filter((i) => i.type === "revcomp");
      case "transcribe":
        return items.filter((i) => i.type === "transcribe");
      case "translate":
        return items.filter((i) => i.type === "translate");
      case "quiz":
        return items.filter((i) => i.type === "quiz");
      default:
        return items;
    }
  }, [items, filter]);

  const copy = async (text: string, label = "Copied!") => {
    await Clipboard.setStringAsync(text);
    if (Platform.OS === "web") {
    }
    toast.show(label);
  };

  const onClearAll = async () => {
    await clearHistory();
    setItems([]);
    toast.show("History cleared");
  };

  if (!ready) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f6f8fb" }}>
      <Text style={{ color: "#64748b" }}>Checking auth…</Text>
    </View>
  );
}

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f6f8fb", padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Not signed in</Text>
        <Text style={{ color: "#94a3b8", marginTop: 4 }}>Go to /login to sign in.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: "#f6f8fb" }} contentContainerStyle={S.page}>
      <View style={S.header}>
        <Text style={S.h1}>History</Text>
        <Text style={S.sub}>View your DNA operations and quiz results. Stored locally on your device.</Text>

        <View style={S.filterRow}>
          <FilterPill label={`All (${counts.all})`} active={filter === "all"} onPress={() => setFilter("all")} />
          <FilterPill label={`Clean (${counts.clean})`} active={filter === "clean"} onPress={() => setFilter("clean")} />
          <FilterPill label={`Rev-comp (${counts.revcomp})`} active={filter === "revcomp"} onPress={() => setFilter("revcomp")} />
          <FilterPill
            label={`Transcribe (${counts.transcribe})`}
            active={filter === "transcribe"}
            onPress={() => setFilter("transcribe")}
          />
          <FilterPill
            label={`Translate (${counts.translate})`}
            active={filter === "translate"}
            onPress={() => setFilter("translate")}
          />
          <FilterPill label={`Quizzes (${counts.quiz})`} active={filter === "quiz"} onPress={() => setFilter("quiz")} />
        </View>

        <View style={{ marginTop: 10, alignItems: "flex-end" }}>
          <Pressable onPress={onClearAll} style={S.clearBtn}>
            <Text style={S.clearBtnText}>Clear all</Text>
          </Pressable>
        </View>
      </View>

      {filtered.length === 0 ? (
        <View style={S.empty}>
          <Text style={S.emptyTitle}>No entries for this filter</Text>
          <Text style={S.emptyText}>Run a DNA operation or finish a quiz.</Text>
        </View>
      ) : null}

      {filtered.map((it) => (
        <View key={it.id} style={S.card}>
          <View style={S.cardHead}>
            <Badge type={it.type} />
            <Text style={S.ts}>{fmtDate(it.at)}</Text>
          </View>

            <MonoBlock label="Input" value={it.input ?? ""} onCopy={() => copy(it.input ?? "", "Copied!")} />
            <MonoBlock label="Output" value={it.output ?? ""} onCopy={() => copy(it.output ?? "", "Copied!")} />
        </View>
      ))}

      <View style={{ height: 16 }} />
    </ScrollView>
  );
}

function FilterPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[S.pill, active ? S.pillActive : S.pillIdle]}>
      <Text style={active ? S.pillActiveText : S.pillIdleText}>{label}</Text>
    </Pressable>
  );
}

const S = StyleSheet.create({
  page: { padding: 16, paddingBottom: 24 },

  header: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e7edf6",
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  h1: { fontSize: 22, fontWeight: "800", color: "#0f172a", marginBottom: 6 },
  sub: { color: "#475569" },

  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 12,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  pillIdle: { backgroundColor: "#f8fafc", borderColor: "#e5e9f2" },
  pillActive: { backgroundColor: "#0b63ce", borderColor: "#0b63ce" },
  pillIdleText: { color: "#0f172a", fontWeight: "700" },
  pillActiveText: { color: "#fff", fontWeight: "700" },

  clearBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fee2e2",
    backgroundColor: "#fef2f2",
  },
  clearBtnText: { color: "#b91c1c", fontWeight: "800" },

  empty: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e7edf6",
    padding: 18,
    marginTop: 12,
    alignItems: "center",
  },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 4 },
  emptyText: { color: "#64748b" },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e7edf6",
    padding: 14,
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  ts: { color: "#64748b", fontSize: 12 },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 999, marginRight: 6 },
  badgeText: { fontSize: 12, fontWeight: "800" },

  monoBlock: { marginTop: 8 },
  monoHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  monoLabel: { fontSize: 12, color: "#64748b", fontWeight: "800" },
  monoText: {
    borderWidth: 1,
    borderColor: "#e5e9f2",
    backgroundColor: "#fbfdff",
    padding: 10,
    borderRadius: 10,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
    color: "#111827",
  },

  ghostBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e9f2",
    backgroundColor: "#f8fafc",
  },
  ghostBtnText: { color: "#0f172a", fontWeight: "700" },
});