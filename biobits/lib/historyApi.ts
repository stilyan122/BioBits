// lib/historyApi.ts
import { api } from "./api";
import { routes } from "./routes";

// ---- Types that match your ASP.NET models (camelCase via System.Text.Json) ----
export type DnaLogPayload = {
  type: "clean" | "revcomp" | "transcribe" | "translate";
  input?: string | null;
  output?: string | null;
  metaJson?: string | null;
};

export type DnaLogItem = {
  id: number;
  userId: string;
  createdAt: string;          // ISO string from API
  type: DnaLogPayload["type"];
  input?: string | null;
  output?: string | null;
  metaJson?: string | null;
};

export type QuizLogPayload = {
  score: number;
  total: number;
  avgMs: number;
  kind?: string | null;
};

export type QuizLogItem = {
  id: number;
  userId: string;
  createdAt: string;          // ISO string
  score: number;
  total: number;
  avgMs: number;
  kind?: string | null;
};

// ---- DNA logs ----
export function postDnaLog(p: DnaLogPayload) {
  const payload = {
    type: p.type,
    input: p.input ?? null,
    output: p.output ?? null,
    metaJson: p.metaJson ?? null,
  };
  return api.post(routes.historyDna, payload);
}

export async function getDnaLogs(): Promise<DnaLogItem[]> {
  const { data } = await api.get(routes.historyDna);
  return data as DnaLogItem[];
}

// ---- Quiz logs ----
export function postQuizLog(p: QuizLogPayload) {
  const payload = {
    score: p.score,
    total: p.total,
    avgMs: p.avgMs,
    kind: p.kind ?? null,
  };
  return api.post(routes.historyQuiz, payload);
}

export async function getQuizLogs(): Promise<QuizLogItem[]> {
  const { data } = await api.get(routes.historyQuiz);
  return data as QuizLogItem[];
}
