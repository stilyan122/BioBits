// lib/history.ts
// Persistent history using AsyncStorage (newest first, no cap)

import AsyncStorage from "@react-native-async-storage/async-storage";

export type HistoryType =
  | "clean"
  | "revcomp"
  | "transcribe"
  | "translate"
  | "quiz";

export type HistoryItem = {
  id: string;                           // unique id
  type: HistoryType;                    // operation kind
  input: string;                        // original input (or "" for quiz)
  output: string;                       // result/summary text
  at: number;                           // timestamp (ms since epoch)
  meta?: Record<string, unknown>;       // optional structured data
};

const KEY = "history";

/** Load full history (newest first). */
export const loadHistory = async (): Promise<HistoryItem[]> => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
};

/** Add a generic entry (prepended). No cap. Returns the updated list. */
export const addHistory = async (
  h: Omit<HistoryItem, "id" | "at">
): Promise<HistoryItem[]> => {
  const item: HistoryItem = {
    ...h,
    id:
      (globalThis as any).crypto?.randomUUID?.() ??
      String(Math.random()),
    at: Date.now(),
  };
  const list = await loadHistory();
  const next = [item, ...list]; // prepend, keep ALL
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
};

/** Convenience: log a quiz attempt with structured meta (object-arg API). */
export const addQuizHistory = async (args: {
  score: number;     // correct answers
  total: number;     // total questions
  avgMs?: number;    // average millis per question
  seed?: number;     // (optional) hidden seed used for question generation
}) => {
  const { score, total, avgMs, seed } = args;

  const summary =
    `Quiz: ${score}/${total}` +
    (typeof avgMs === "number" ? ` · avg ${(avgMs / 1000).toFixed(2)}s` : "") +
    (typeof seed === "number" ? ` · seed ${seed}` : "");

  return addHistory({
    type: "quiz",
    input: "",
    output: summary,
    meta: { score, total, avgMs, seed },
  });
};

/** Remove all history. */
export const clearHistory = async () => {
  await AsyncStorage.removeItem(KEY);
};
