import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import HelixStripe from "../components/HelixStripe"; // your component (now upgraded)
import NavCard from "../components/NavCard"; // your component

export default function Home() {
  const router = useRouter();

  return (
    <ScrollView style={{ backgroundColor: "#f6f8fb" }} contentContainerStyle={S.page}>
      {/* HERO */}
      <View style={S.hero}>
        <Text style={S.kicker}>BioBits · Genetics · Tools · Learning</Text>
        <Text style={S.h1}>Precise tools for DNA work & practice</Text>
        <Text style={S.sub}>
          Clean sequences, compute GC%, transcribe/translate, and drill codons with timed quizzes. Everything persists locally.
        </Text>

        <View style={S.helixWrap}>
          <HelixStripe width={360} height={84} turns={5} stroke={3} />
        </View>
      </View>

      {/* SECTION */}
      <View style={S.sectionHeader}>
        <Text style={S.sectionTitle}>Get started</Text>
        <View style={S.rule} />
      </View>

      <NavCard
        title="DNA Tools"
        subtitle="Clean, reverse-complement, transcribe, translate, and compute GC%."
        accent="#059669"
        onPress={() => router.push("/tools" as any)}
      />
      <NavCard
        title="Quizzes"
        subtitle="Codon -> AA and AA -> Codon with scoring and average time."
        accent="#2563eb"
        onPress={() => router.push("/quiz" as any)}
      />
      <NavCard
        title="History"
        subtitle="Recent operations and quiz attempts - stored on device."
        accent="#7c3aed"
        onPress={() => router.push("/history" as any)}
      />

      <View style={S.footer}>
        <Text style={S.footnote}>Built with Expo · TypeScript · React Native</Text>
      </View>
    </ScrollView>
  );
}

const S = StyleSheet.create({
  page: { padding: 16, paddingBottom: 32 },
  hero: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e7edf6",
    padding: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  kicker: { fontSize: 12, fontWeight: "700", color: "#0b63ce", marginBottom: 6 },
  h1: { fontSize: 24, fontWeight: "800", color: "#0f172a", marginBottom: 6 },
  sub: { color: "#475569", lineHeight: 20 },
  helixWrap: { marginTop: 12, alignItems: "center" },

  sectionHeader: { marginTop: 8, marginBottom: 4 },
  sectionTitle: { fontSize: 13, fontWeight: "800", color: "#334155", marginBottom: 6 },
  rule: { height: 1, backgroundColor: "#e7ecf3", width: "100%", marginBottom: 4 },

  footer: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#f2f6ff",
    borderWidth: 1,
    borderColor: "#e6ecff",
  },
  footnote: { color: "#637899" },
});