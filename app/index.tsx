import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Home() {
  const router = useRouter();

  return (
    <View style={S.page}>
      {/* Hero (just text now) */}
      <View style={S.hero}>
        <Text style={S.h1}>BioBits</Text>
        <Text style={S.sub}>Pocket genetics toolkit · learn by doing</Text>
      </View>

      {/* Cards (tap to navigate) */}
      <View style={S.grid}>
        <Pressable style={[S.card, S.cardSpace]} onPress={() => router.push("/tools" as any)}>
          <Text style={S.cardTitle}>DNA Tools</Text>
          <Text style={S.cardText}>Clean, rev-comp, transcribe, translate, GC%</Text>
        </Pressable>

        <Pressable style={[S.card, S.cardSpace]} onPress={() => router.push("/quiz" as any)}>
          <Text style={S.cardTitle}>Quizzes</Text>
          <Text style={S.cardText}>Codon→AA and AA→Codon with timing & score</Text>
        </Pressable>

        <Pressable style={[S.card, S.cardSpace]} onPress={() => router.push("/history" as any)}>
          <Text style={S.cardTitle}>History</Text>
          <Text style={S.cardText}>Recent ops & quiz results (persistent)</Text>
        </Pressable>
      </View>

      <View style={S.strip}>
        <Text style={S.stripText}>Built with Expo · TypeScript · React Native</Text>
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  page: { flex: 1, padding: 16 },
  hero: {
    padding: 20, borderRadius: 16, backgroundColor: "#e8f0ff",
    borderWidth: 1, borderColor: "#dbe7ff", marginBottom: 16,
  },
  h1: { fontSize: 28, fontWeight: "800", marginBottom: 6 },
  sub: { color: "#555" },
  grid: { marginTop: 0 },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: "#eee",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardSpace: { marginTop: 12 },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  cardText: { color: "#666" },
  strip: {
    marginTop: "auto", padding: 12, alignItems: "center",
    borderRadius: 12, backgroundColor: "#f2f6ff",
    borderWidth: 1, borderColor: "#e6ecff",
  },
  stripText: { color: "#637899" },
});