// app/quiz.tsx
import * as Haptics from "expo-haptics";
import { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import ProgressBar from "../components/ProgressBar";
import { useToast } from "../components/Toast";
import { addQuizHistory } from "../lib/history";
import { makeQuestions, Question, QuizMode } from "../lib/quiz";

// Small UI atoms
function Pill({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[S.pill, active ? S.pillActive : S.pillIdle]} accessibilityRole="button">
      <Text style={active ? S.pillActiveText : S.pillIdleText}>{label}</Text>
    </Pressable>
  );
}

function PrimaryButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [S.primaryBtn, pressed && { opacity: 0.92 }]} accessibilityRole="button">
      <Text style={S.primaryBtnText}>{title}</Text>
    </Pressable>
  );
}

const MIN_Q = 1;  
const MAX_Q = 200;
const clamp = (v: number, lo = MIN_Q, hi = MAX_Q) => Math.max(lo, Math.min(hi, v));

// For review items
type AnswerRow = {
  prompt: string;
  choices: string[];
  correct: string;
  picked: string;
  ms: number; // time spent on this question
};

export default function QuizScreen() {
  const toast = useToast();

  // Config
  const [mode, setMode] = useState<QuizMode>("codon2aa");
  const [count, setCount] = useState<number>(10);

  // Hidden seed (no UI). We reseed automatically on each Start.
  const [seed, setSeed] = useState<number>(() => Date.now() >>> 0);

  // Flow state
  const [started, setStarted] = useState<boolean>(false);

  // Deterministic questions for current config
  const qs = useMemo(() => makeQuestions(mode, count, seed), [mode, count, seed]);

  // Runtime quiz state
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerRow[]>([]); // NEW: full review data

  // Per-question timer start ms
  const t0 = useRef<number>(Date.now());

  const begin = () => {
    setSeed(Date.now() >>> 0); // fresh questions each start
    setStarted(true);
    setI(0);
    setScore(0);
    setTimes([]);
    setPicked(null);
    setAnswers([]); // reset review
    t0.current = Date.now();
  };

  const onPick = async (choice: string) => {
    if (picked) return; // prevent double taps while showing feedback
    setPicked(choice);

    const dt = Date.now() - t0.current;
    const nextTimes = [...times, dt];
    const correct = choice === qs[i].correct;

    // Haptics
    try {
      await Haptics.notificationAsync(
        correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
      );
    } catch {}

    if (correct) setScore((s) => s + 1);
    setTimes(nextTimes);

    // Add to review list
    setAnswers((prev) => [
      ...prev,
      { prompt: qs[i].prompt, choices: qs[i].choices, correct: qs[i].correct, picked: choice, ms: dt },
    ]);

    setTimeout(async () => {
      if (i + 1 < qs.length) {
        setI(i + 1);
        setPicked(null);
        t0.current = Date.now();
      } else {
        // Finished → jump to results
        setPicked(choice);
        setI(qs.length);

        const total = qs.length;
        const finalScore = correct ? score + 1 : score;
        const avgMs = nextTimes.length
          ? Math.round(nextTimes.reduce((a, b) => a + b, 0) / nextTimes.length)
          : 0;

        await addQuizHistory({ score: finalScore, total, avgMs, seed });
        toast.show("Quiz saved to History");
      }
    }, 400);
  };

  // Results + Review view
  if (started && i >= qs.length) {
    const total = qs.length;
    const avgMs = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

    return (
      <ScrollView contentContainerStyle={S.page}>
        <Text style={S.h1}>Results</Text>
        <Text style={S.p}>Mode: {mode === "codon2aa" ? "Codon → AA" : "AA → Codon"}</Text>
        <Text style={S.p}>Score: {score} / {total}</Text>
        <Text style={S.p}>Avg time/question: {(avgMs / 1000).toFixed(2)} s</Text>

        <View style={{ height: 12 }} />

        {/* Review block */}
        <View style={S.card}>
          <Text style={S.cardTitle}>Review</Text>
          <Text style={S.dim}>{answers.length} questions</Text>

          <View style={{ marginTop: 10 }}>
            {answers.map((a, idx) => {
              const ok = a.picked === a.correct;
              return (
                <View key={idx} style={S.reviewRow}>
                  <View style={S.reviewHead}>
                    <Text style={S.reviewIndex}>{idx + 1}.</Text>
                    <Text style={S.reviewPrompt}>{a.prompt}</Text>
                  </View>

                  <View style={S.tags}>
                    <Tag label={`Your: ${a.picked}`} tone={ok ? "ok" : "warn"} />
                    <Tag label={`Correct: ${a.correct}`} tone="ok" />
                    <Tag label={`${(a.ms / 1000).toFixed(1)}s`} tone="muted" />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 12 }} />
        <View style={{ flexDirection: "row", gap: 12 }}>
          <PrimaryButton
            title="Restart"
            onPress={() => {
              setStarted(false); // back to start; Start will reseed and reset
            }}
          />
          <View style={{ width: 8 }} />
          <PrimaryButton
            title="Change settings"
            onPress={() => {
              setStarted(false);
            }}
          />
        </View>
      </ScrollView>
    );
  }

  // Start screen
  if (!started) {
    const setCountSafe = (v: number) => setCount(clamp(Math.round(v)));

    return (
      <ScrollView contentContainerStyle={S.page}>
        <Text style={S.h1}>Quiz</Text>
        <Text style={S.sub}>
          Test yourself on the genetic code. Choose mode and number of questions, then start.
        </Text>

        <View style={S.card}>
          <Text style={S.cardTitle}>Mode</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            <Pill active={mode === "codon2aa"} label="Codon → AA" onPress={() => setMode("codon2aa")} />
            <View style={{ width: 8 }} />
            <Pill active={mode === "aa2codon"} label="AA → Codon" onPress={() => setMode("aa2codon")} />
          </View>
        </View>

        <View style={S.card}>
          <Text style={S.cardTitle}>Questions</Text>

          {/* Controls row */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Pressable onPress={() => setCountSafe(count - 10)} style={S.stepBtn} accessibilityLabel="minus ten">
              <Text style={S.stepText}>−10</Text>
            </Pressable>

            <Pressable onPress={() => setCountSafe(count - 1)} style={[S.stepBtn, { marginLeft: 8 }]} accessibilityLabel="minus one">
              <Text style={S.stepText}>−1</Text>
            </Pressable>

            {/* Editable numeric input */}
            <TextInput
              value={String(count)}
              onChangeText={(t) => {
                const n = parseInt(t.replace(/[^\d]/g, "") || "0", 10);
                setCountSafe(isNaN(n) ? MIN_Q : n);
              }}
              keyboardType="number-pad"
              selectTextOnFocus
              style={S.countInput}
              accessibilityLabel="question count"
            />

            <Pressable onPress={() => setCountSafe(count + 1)} style={[S.stepBtn, { marginLeft: 8 }]} accessibilityLabel="plus one">
              <Text style={S.stepText}>+1</Text>
            </Pressable>

            <Pressable onPress={() => setCountSafe(count + 10)} style={[S.stepBtn, { marginLeft: 8 }]} accessibilityLabel="plus ten">
              <Text style={S.stepText}>+10</Text>
            </Pressable>
          </View>

          <Text style={S.helpText}>Allowed: {MIN_Q}–{MAX_Q}. Use the box to type any number.</Text>
        </View>

        <View style={{ height: 12 }} />
        <PrimaryButton title="Start Quiz" onPress={begin} />
      </ScrollView>
    );
  }

  // Active question
  const q: Question = qs[i];
  const progress = qs.length ? i / qs.length : 0;

  return (
    <ScrollView contentContainerStyle={S.page}>
      <View style={{ marginBottom: 10 }}>
        <ProgressBar value={progress} />
      </View>

      <Text style={S.dim}>Question {i + 1} / {qs.length}</Text>
      <Text style={S.h2}>{q.prompt}</Text>

      <View style={{ marginTop: 8 }}>
        {q.choices.map((c) => {
          const isPicked = picked === c;
          const isCorrect = c === q.correct;
          const bg = picked ? (isCorrect ? "#d1fadc" : isPicked ? "#ffd6d6" : "#f1f1f1") : "#f1f1f1";

          return (
            <Pressable
              key={c}
              onPress={() => onPick(c)}
              style={{
                padding: 14,
                borderRadius: 10,
                backgroundColor: bg,
                borderWidth: 1,
                borderColor: "#ddd",
                marginBottom: 8,
              }}
              accessibilityRole="button"
              accessibilityLabel={`Option ${c}`}
            >
              <Text style={{ fontSize: 18 }}>{c}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text>Score: {score}</Text>
        <Text>Time: {((Date.now() - t0.current) / 1000).toFixed(1)} s</Text>
      </View>
    </ScrollView>
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
  h1: { fontSize: 24, fontWeight: "800" },
  h2: { fontSize: 20, fontWeight: "700", marginTop: 2 },
  sub: { color: "#475569", marginTop: 6 },
  p: { color: "#0f172a", marginTop: 4 },
  dim: { color: "#64748b" },

  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e7edf6",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "800", marginBottom: 8 },

  pill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1 },
  pillIdle: { backgroundColor: "#f8fafc", borderColor: "#e5e9f2" },
  pillActive: { backgroundColor: "#0b63ce", borderColor: "#0b63ce" },
  pillIdleText: { color: "#0f172a", fontWeight: "700" },
  pillActiveText: { color: "#fff", fontWeight: "700" },

  stepBtn: {
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10,
    borderWidth: 1, borderColor: "#e5e9f2", backgroundColor: "#f8fafc",
  },
  stepText: { fontWeight: "800", color: "#0f172a" },

  countInput: {
    marginHorizontal: 8,
    width: 72,
    height: 40,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#e5e9f2",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
  },

  helpText: { marginTop: 8, color: "#64748b", fontSize: 12 },

  primaryBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#0b63ce",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  reviewRow: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eef2f7",
  },
  reviewHead: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginBottom: 6 },
  reviewIndex: { fontWeight: "800", color: "#0f172a", marginTop: 1 },
  reviewPrompt: { color: "#0f172a", flexShrink: 1 },

  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  tagText: { fontWeight: "700", fontSize: 12 },
});
