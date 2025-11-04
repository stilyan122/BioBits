import { useRouter, type Href } from "expo-router";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import HelixStripe from "../components/HelixStripe";
import NavCard from "../components/NavCard";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

export default function Home() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const name =
    user?.displayName ||
    (typeof user?.email === "string" ? user.email.split("@")[0] : undefined) ||
    "User";

  const roles = Array.isArray(user?.roles) ? user!.roles : [];

    const go = (path: Href, requiresAuth = false) => {
    if (requiresAuth && !user) {
      router.push("/login" as Href);
      return;
    }
    router.push(path);
  };

  return (
    <ScrollView style={{ backgroundColor: "#f6f8fb" }} contentContainerStyle={S.page}>
      <View style={S.header}>
        <Logo size={28} onPress={() => router.push("/")} />

        {user ? (
          <View style={S.headerRight}>
            <View style={{ alignItems: "flex-end", marginRight: 12 }}>
              <Text style={S.user}>Hi, {name}</Text>
              {roles.length > 0 && (
                <View style={S.roleRow}>
                  {roles.map((r) => (
                    <View key={r} style={S.roleBadge}>
                      <Text style={S.roleText}>{r}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <Pressable
              style={S.btnGhost}
              onPress={async () => {
                await signOut();
                router.replace("/login");
              }}
            >
              <Text style={S.btnGhostText}>Logout</Text>
            </Pressable>
          </View>
        ) : (
          <View style={S.headerRight}>
            <Pressable style={S.btnGhost} onPress={() => router.push("/login")}>
              <Text style={S.btnGhostText}>Login</Text>
            </Pressable>
            <Pressable
              style={[S.btnGhost, { marginLeft: 10 }]}
              onPress={() => router.push("/register")}
            >
              <Text style={S.btnGhostText}>Register</Text>
            </Pressable>
          </View>
        )}
      </View>

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

      <View style={S.sectionHeader}>
        <Text style={S.sectionTitle}>Get started</Text>
        <View style={S.rule} />
      </View>

      <NavCard
        title="DNA Tools"
        subtitle="Clean, reverse-complement, transcribe, translate, and compute GC%."
        accent="#059669"
        onPress={() => go("/tools", true)}  
      />
      <NavCard
        title="Quizzes"
        subtitle="Codon → AA and AA → Codon with scoring and average time."
        accent="#2563eb"
        onPress={() => go("/quiz", true)}   
      />
      <NavCard
        title="History"
        subtitle={user ? "Your recent ops and quiz attempts." : "Sign in to see your history."}
        accent="#7c3aed"
        onPress={() => go("/history", true)} 
      />

      {!user && (
        <View style={S.cta}>
          <Text style={S.ctaText}>
            You’re not signed in. Login to unlock tools, quizzes, and history.
          </Text>
          <View style={{ flexDirection: "row", marginTop: 8 }}>
            <Pressable style={[S.btnPrimary]} onPress={() => router.push("/login")}>
              <Text style={S.btnPrimaryText}>Sign in</Text>
            </Pressable>
            <Pressable
              style={[S.btnGhost, { marginLeft: 8 }]}
              onPress={() => router.push("/register")}
            >
              <Text style={S.btnGhostText}>Create account</Text>
            </Pressable>
          </View>
        </View>
      )}

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
  user: { color: "#0f172a", fontWeight: "600" },
  roleRow: { flexDirection: "row", marginTop: 4, flexWrap: "wrap" },
  roleBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e6ecff",
    backgroundColor: "#f2f6ff",
    marginLeft: 6,
  },
  roleText: { fontSize: 11, fontWeight: "800", color: "#0b63ce" },

  btnGhost: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0b63ce",
    alignItems: "center",
    justifyContent: "center",
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

  // CTA when logged out
  cta: {
    marginTop: 12,
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e7edf6",
  },
  ctaText: { color: "#334155" },
  btnPrimary: {
    backgroundColor: "#0b63ce",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  btnPrimaryText: { color: "#fff", fontWeight: "800" },

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
