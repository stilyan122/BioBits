// Import AsyncStorage to persist small key/value data on device (survives app restarts).
import AsyncStorage from "@react-native-async-storage/async-storage";

// Shape of one saved operation in history
export type HistoryItem = {
  id: string;    // Unique identifier                                  
  type: "clean" | "revcomp" | "transcribe" | "translate";  // What operation produced this entry
  input: string; // Original input sequence                
  output: string; // Resulting output sequence                                    
  at: number; // Timestamp (ms since epoch) when this entry was created                                   
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

  // Prepend and cap at 20 entries
  const list = [item, ...(await loadHistory())].slice(0, 20);

  // Persist updated list
  await AsyncStorage.setItem(KEY, JSON.stringify(list));

  // Return an immediate UI refresh
  return list;
};

// Wipe all saved history by removing the key entirely
export const clearHistory = async () => {
  await AsyncStorage.removeItem(KEY);
};