// Import AsyncStorage to persist small key/value data on device (survives app restarts).
import AsyncStorage from "@react-native-async-storage/async-storage";

// Max number of items to keep (keeps storage small + fast)
const MAX_HISTORY = 20;

// Shape of one saved operation in history
export type HistoryItem = {
  id: string;    
  type:
    | "clean"
    | "revcomp"
    | "transcribe"
    | "translate"
    | "quiz";    
  input: string;  
  output: string; 
  at: number;    
};

// Single storage key under which the entire history list is stored (JSON stringified).
const KEY = "history";

// Load the full history list from storage.
export const loadHistory = async (): Promise<HistoryItem[]> => {
  try {
    // Read raw JSON string (or null)
    const raw = await AsyncStorage.getItem(KEY);

    // Parse to array if present
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    // On error, fall back to empty list
    return [];
  }
};

// Add one item to the front of the history
export const addHistory = async (h: Omit<HistoryItem, "id" | "at">) => {
  const item: HistoryItem = {
    ...h, // type/input/output come from caller
    id: crypto.randomUUID?.() ?? String(Math.random()), // Generate unique ID
    at: Date.now(), // Current time in ms
  };

  // Prepend and cap at MAX_HISTORY entries
  const list = [item, ...(await loadHistory())].slice(0, MAX_HISTORY);

  // Persist updated list
  await AsyncStorage.setItem(KEY, JSON.stringify(list));

  // Return an immediate UI refresh
  return list;
};

// Wipe all saved history by removing the key entirely
export const clearHistory = async () => {
  await AsyncStorage.removeItem(KEY);
};

// Convenience helper: save a quiz attempt (score + avg time)
export const addQuizHistory = async (score: number, total: number, avgMs: number) => {
  const input = `${total} Qs`;                        
  const secs = (avgMs / 1000).toFixed(2);              
  const output = `${score}/${total} • ${secs} s avg`;  
  return addHistory({ type: "quiz", input, output });
};
