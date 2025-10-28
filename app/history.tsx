import { useEffect, useState } from "react";
import { ScrollView, Text, View, Button } from "react-native";
import { loadHistory, clearHistory, HistoryItem } from "../lib/history";

const fmt = (t: number) => new Date(t).toLocaleString();

export default function HistoryScreen() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  const refresh = async () => setItems(await loadHistory());

  useEffect(() => { refresh(); }, []);

  return (
    <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
      <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"center" }}>
        <Text style={{ fontSize:18, fontWeight:"700" }}>History</Text>
        <Button title="Clear" onPress={async () => { await clearHistory(); await refresh(); }} />
      </View>

      {items.length === 0 ? (
        <Text>No history yet. Run a tool in DNA Tools.</Text>
      ) : items.map(h => (
        <View key={h.id} style={{ borderWidth:1, borderColor:"#ddd", borderRadius:8, padding:12 }}>
          <Text style={{ fontWeight:"600" }}>{h.type.toUpperCase()} • {fmt(h.at)}</Text>
          <Text numberOfLines={1}>Input: {h.input}</Text>
          <Text numberOfLines={1}>Output: {h.output}</Text>
        </View>
      ))}
    </ScrollView>
  );
}