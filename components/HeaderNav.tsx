import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const LINKS = [
  { href: "/",      label: "Home" },
  { href: "/tools", label: "DNA Tools" },
  { href: "/quiz",  label: "Quiz" },
  { href: "/history", label: "History" }, 
];

export default function HeaderNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={S.wrap}>
      <Text style={S.brand}>BioBits</Text>
      <View style={S.row}>
        {LINKS.map((item, i) => {
          const active = pathname === item.href;
          return (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href as any)}
              accessibilityRole="button"
              style={[S.link, i > 0 && S.linkSpace, active && S.active]}
            >
              <Text style={[S.linkText, active && S.activeText]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  wrap: {
    paddingTop: 14, paddingBottom: 10, paddingHorizontal: 16,
    borderBottomWidth: 1, borderColor: "#eee",
    backgroundColor: "#fff",
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  brand: { fontSize: 18, fontWeight: "800" },
  row: { flexDirection: "row", alignItems: "center" },
  link: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  linkSpace: { marginLeft: 8 },
  linkText: { fontSize: 14, color: "#444" },
  active: { backgroundColor: "#eef6ff" },
  activeText: { color: "#0b63ce", fontWeight: "700" },
});