import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import HelixStripe from "../components/HelixStripe";
import NavCard from "../components/NavCard";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  return (
    <ScrollView style={{ backgroundColor: "#f6f8fb" }} contentContainerStyle={S.page}>
      {/* HEADER */}
      <View style={S.header}>
        <Text style={S.brand}>BioBits</Text>

        {user ? (
          <View style={S.headerRight}>
            <Text style={S.user}>Hi, {user.displayName ?? user.email.split("@")[0]}</Text>
            <Pressable style={S.btnGhost} onPress={signOut}>
              <Text style={S.btnGhostText}>Logout</Text>
            </Pressable>
          </View>
        ) : (
          <View style={S.headerRight}>
            <Pressable style={S.btnGhost} onPress={() => router.push("/login")}>
              <Text style={S.btnGhostText}>Login</Text>
            </Pressable>
            <Pressable style={[S.btnGhost, { marginLeft: 10 }]} onPress={() => router.push("/register")}>
              <Text style={S.btnGhostText}>Register</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* HERO */}
      <View style={S.hero}>
        <Text style={S.kicker}>BioBits · Genetics · Tools · Learning</Text>
        <Text style={S.h1}>Precise tools for DNA work & practice</Text>
        <Text style={S.sub}>
          Clean sequences, compute GC%, transcribe/translate, and drill codons with timed quizzes.
          Everything persists locally.
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
        subtitle="Codon → AA and AA → Codon with scoring and average time."
        accent="#2563eb"
        onPress={() => router.push("/quiz" as any)}
      />
      <NavCard
        title="History"
        subtitle="Recent operations and quiz attempts — stored on device."
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

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e7edf6",
  },
  brand: { fontSize: 18, fontWeight: "800", color: "#0b63ce" },
  headerRight: { flexDirection: "row", alignItems: "center" },
  user: { marginRight: 12, color: "#0f172a", fontWeight: "600" },
  btnGhost: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0b63ce",
  },
  btnGhostText: { color: "#0b63ce", fontWeight: "700" },

  // Hero
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

  // Sections
  sectionHeader: { marginTop: 8, marginBottom: 4 },
  sectionTitle: { fontSize: 13, fontWeight: "800", color: "#334155", marginBottom: 6 },
  rule: { height: 1, backgroundColor: "#e7ecf3", width: "100%", marginBottom: 4 },

  // Footer
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
