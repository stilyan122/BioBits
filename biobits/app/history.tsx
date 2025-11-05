// app/history.tsx
import * as Clipboard from "expo-clipboard";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useToast } from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import { getDnaLogs, getQuizLogs, DnaLogItem, QuizLogItem } from "../lib/historyApi";

type Filter = "all" | "clean" | "revcomp" | "transcribe" | "translate" | "quiz";

/** UI-row union so we can render a single list */
type Row =
  | {
      kind: "dna";
      key: string;             // unique react key
      at: number;              // epoch ms
      type: "clean" | "revcomp" | "transcribe" | "translate";
      input?: string | null;
      output?: string | null;
    }
  | {
      kind: "quiz";
      key: string;             // unique react key
      at: number;              // epoch ms
      score: number;
      total: number;
      avgMs: number;
      mode?: string | null;    // API 'kind' -> UI 'mode'
    };

const TYPE_LABEL: Record<Exclude<Row, {kind: "quiz"}>["type"], string> = {
  clean: "Clean",
  revcomp: "Rev-comp",
  transcribe: "Transcribe",
  translate: "Translate",
};

const TYPE_COLOR: Record<Exclude<Row, {kind: "quiz"}>["type"] | "quiz", string> = {
  clean: "#0ea5e9",
  revcomp: "#10b981",
  transcribe: "#6366f1",
  translate: "#f59e0b",
  quiz: "#ef4444",
};

function Badge({ tone, label }: { tone: keyof typeof TYPE_COLOR; label: string }) {
  const c = TYPE_COLOR[tone];
  return (
    <View style={[S.badge, { borderColor: c + "33", backgroundColor: c + "18" }]}>
      <View style={[S.dot, { backgroundColor: c }]} />
      <Text style={[S.badgeText, { color: c }]}>{label}</Text>
    </View>
  );
}

function fmtDate(ts: number) {
  const d = new Date(ts);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function MonoBlock({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <View style={S.monoBlock}>
      <View style={S.monoHead}>
        <Text style={S.monoLabel}>{label}</Text>
        <Pressable onPress={onCopy} style={S.ghostBtn}><Text style={S.ghostBtnText}>Copy</Text></Pressable>
      </View>
      <Text selectable style={S.monoText}>{value}</Text>
    </View>
  );
}

export default function HistoryScreen() {
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const toast = useToast();
  const { user, ready } = useAuth();

  const load = useCallback(async () => {
    // Fetch both lists
    const [dnaList, quizList] = await Promise.all([getDnaLogs(), getQuizLogs()]);

    // Normalize with **unique** keys
    const dnaRows: Row[] = (dnaList as DnaLogItem[]).map(it => ({
      kind: "dna",
      key: `dna-${it.id}`, // <-- unique across kinds
      at: new Date(it.createdAt).getTime(),
      type: it.type,
      input: it.input ?? "",
      output: it.output ?? "",
    }));

    const quizRows: Row[] = (quizList as QuizLogItem[]).map(it => ({
      kind: "quiz",
      key: `quiz-${it.id}`, // <-- unique across kinds
      at: new Date(it.createdAt).getTime(),
      score: it.score,
      total: it.total,
      avgMs: it.avgMs,
      mode: it.kind ?? null,
    }));

    // Merge & sort desc by time
    const merged = [...dnaRows, ...quizRows].sort((a, b) => b.at - a.at);
    setRows(merged);
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const counts = useMemo(() => {
    const c = { all: rows.length, clean: 0, revcomp: 0, transcribe: 0, translate: 0, quiz: 0 };
    for (const r of rows) {
      if (r.kind === "quiz") c.quiz++;
      else c[r.type]++;
    }
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    if (filter === "quiz") return rows.filter(r => r.kind === "quiz");
    return rows.filter(r => r.kind === "dna" && r.type === filter);
  }, [rows, filter]);

  const copy = async (text: string, label = "Copied!") => {
    await Clipboard.setStringAsync(text);
    toast.show(label);
  };

  if (!ready) {
    return <Center><Text style={{ color: "#64748b" }}>Checking auth…</Text></Center>;
  }
  if (!user) {
    return (
      <Center pad>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Not signed in</Text>
        <Text style={{ color: "#94a3b8", marginTop: 4 }}>Go to /login to sign in.</Text>
      </Center>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: "#f6f8fb" }} contentContainerStyle={S.page}>
      <View style={S.header}>
        <Text style={S.h1}>History</Text>
        <Text style={S.sub}>Your DNA operations and quiz results (stored in the BioBits DB).</Text>

        <View style={S.filterRow}>
          <FilterPill label={`All (${counts.all})`} active={filter === "all"} onPress={() => setFilter("all")} />
          <FilterPill label={`Clean (${counts.clean})`} active={filter === "clean"} onPress={() => setFilter("clean")} />
          <FilterPill label={`Rev-comp (${counts.revcomp})`} active={filter === "revcomp"} onPress={() => setFilter("revcomp")} />
          <FilterPill label={`Transcribe (${counts.transcribe})`} active={filter === "transcribe"} onPress={() => setFilter("transcribe")} />
          <FilterPill label={`Translate (${counts.translate})`} active={filter === "translate"} onPress={() => setFilter("translate")} />
          <FilterPill label={`Quizzes (${counts.quiz})`} active={filter === "quiz"} onPress={() => setFilter("quiz")} />
        </View>
      </View>

      {filtered.length === 0 ? (
        <View style={S.empty}>
          <Text style={S.emptyTitle}>No entries for this filter</Text>
          <Text style={S.emptyText}>Run a DNA operation or finish a quiz.</Text>
        </View>
      ) : null}

      {filtered.map((r) => {
        if (r.kind === "dna") {
          return (
            <View key={r.key} style={S.card}>
              <View style={S.cardHead}>
                <Badge tone={r.type} label={TYPE_LABEL[r.type]} />
                <Text style={S.ts}>{fmtDate(r.at)}</Text>
              </View>
              <MonoBlock label="Input"  value={r.input ?? ""}  onCopy={() => copy(r.input ?? "", "Copied input")} />
              <MonoBlock label="Output" value={r.output ?? ""} onCopy={() => copy(r.output ?? "", "Copied output")} />
            </View>
          );
        }

        // quiz row
        return (
          <View key={r.key} style={S.card}>
            <View style={S.cardHead}>
              <Badge tone="quiz" label="Quiz" />
              <Text style={S.ts}>{fmtDate(r.at)}</Text>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              <Tag label={`Score: ${r.score}/${r.total}`} tone="ok" />
              <Tag label={`Avg: ${(r.avgMs / 1000).toFixed(2)}s`} tone="muted" />
              {r.mode ? <Tag label={`Mode: ${r.mode}`} tone="muted" /> : null}
            </View>
          </View>
        );
      })}

      <View style={{ height: 16 }} />
    </ScrollView>
  );
}

function Center({ children, pad = false }: { children: React.ReactNode; pad?: boolean }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f6f8fb", padding: pad ? 16 : 0 }}>
      {children}
    </View>
  );
}

function FilterPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[S.pill, active ? S.pillActive : S.pillIdle]}>
      <Text style={active ? S.pillActiveText : S.pillIdleText}>{label}</Text>
    </Pressable>
  );
}

function Tag({ label, tone }: { label: string; tone: "ok" | "warn" | "muted" }) {
  const palette =
    tone === "ok"
      ? { fg: "#065f46", bg: "#d1fae5", br: "#a7f3d0" }
      : tone === "warn"
      ? { fg: "#7c2d12", bg: "#ffedd5", br: "#fed7aa" }
      : { fg: "#334155", bg: "#e2e8f0", br: "#cbd5e1" };
  return (
    <View style={[S.tag, { backgroundColor: palette.bg, borderColor: palette.br }]}>
      <Text style={[S.tagText, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

const S = StyleSheet.create({
  page: { padding: 16, paddingBottom: 24 },

  ghostBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e9f2",
    backgroundColor: "#f8fafc",
  },
  ghostBtnText: {
    color: "#0f172a",
    fontWeight: "700",
  },

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

  filterRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", marginTop: 12 },
  pill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, marginRight: 8, marginBottom: 8 },
  pillIdle: { backgroundColor: "#f8fafc", borderColor: "#e5e9f2" },
  pillActive: { backgroundColor: "#0b63ce", borderColor: "#0b63ce" },
  pillIdleText: { color: "#0f172a", fontWeight: "700" },
  pillActiveText: { color: "#fff", fontWeight: "700" },

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

  badge: { flexDirection: "row", alignItems: "center", paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1 },
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

  tag: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999, borderWidth: 1 },
  tagText: { fontWeight: "700", fontSize: 12 },
});