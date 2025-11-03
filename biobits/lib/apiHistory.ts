// lib/apiHistory.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./config";

const AUTH_KEY = "auth:user";

// Return only the raw token (string) or null
async function getAuthToken(): Promise<string | null> {
  const raw = await AsyncStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    const { token } = JSON.parse(raw);
    return typeof token === "string" && token.length > 0 ? token : null;
  } catch {
    return null;
  }
}

// Build a Headers instance safely (no union types)
async function buildJsonHeaders(): Promise<Headers> {
  const h = new Headers();
  h.set("Content-Type", "application/json");
  const token = await getAuthToken();
  if (token) h.set("Authorization", `Bearer ${token}`);
  return h;
}

// Fire-and-forget; silently no-op if not logged in (no Authorization header)
export async function pushDnaHistory(op: {
  type: "clean" | "revcomp" | "transcribe" | "translate";
  input?: string;
  output?: string;
  metaJson?: string;
}) {
  try {
    const headers = await buildJsonHeaders();
    // If no token, Headers won't contain Authorization → let it silently skip
    if (!headers.has("Authorization")) return;

    await fetch(`${API_URL}/api/history/dna`, {
      method: "POST",
      headers,
      body: JSON.stringify(op),
    });
  } catch {
    // ignore network errors for background sync
  }
}

export async function pushQuizHistory(q: {
  score: number;
  total: number;
  avgMs: number;
  kind?: string;
}) {
  try {
    const headers = await buildJsonHeaders();
    if (!headers.has("Authorization")) return;

    await fetch(`${API_URL}/api/history/quiz`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        score: q.score,
        total: q.total,
        avgMs: q.avgMs,
        kind: q.kind ?? "codon-to-aa",
      }),
    });
  } catch {
    // ignore network errors for background sync
  }
}