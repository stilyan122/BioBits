import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import 'react-native-reanimated';
import { ToastProvider } from "../components/Toast";
import { AuthProvider, useAuth } from "../context/AuthContext";
import AuthGate from "../components/AuthGate";
import Logo from "../components/Logo";

export { ErrorBoundary } from 'expo-router';
export const unstable_settings = { initialRouteName: 'index' };

SplashScreen.preventAutoHideAsync();

function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, ready, signOut } = useAuth();

  if (!ready) 
    return null;

  const LinkBtn = ({ href, label, first = false }: { href: any; label: string; first?: boolean }) => {
    const active = pathname === href;
    return (
      <Pressable
        onPress={() => router.push(href)}
        style={[hs.link, !first && hs.linkSpace, active && hs.active]}
        accessibilityRole="button"
      >
        <Text style={[hs.linkText, active && hs.activeText]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={hs.wrap}>
      <Logo size={28} onPress={() => router.push("/")} />
      <View style={hs.row}>
        {user ? (
          <>
            <LinkBtn href="/"        label="Home" first />
            <LinkBtn href="/tools"   label="DNA Tools" />
            <LinkBtn href="/quiz"    label="Quiz" />
            <LinkBtn href="/history" label="History" />
            <Text style={[hs.linkText, hs.linkSpace]}>{user.displayName ?? user.email}</Text>
            <Pressable onPress={signOut} style={[hs.link, hs.linkSpace]}>
              <Text style={hs.linkText}>Logout</Text>
            </Pressable>
          </>
        ) : (
          <>
            <LinkBtn href="/login"    label="Sign in" first />
            <LinkBtn href="/register" label="Register" />
          </>
        )}
      </View>
    </View>
  );
}

const hs = StyleSheet.create({
  wrap: {
    paddingTop: 14, paddingBottom: 10, paddingHorizontal: 16,
    borderBottomWidth: 1, borderColor: '#eee',
    backgroundColor: '#fff',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  brand: { fontSize: 18, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  link: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  linkSpace: { marginLeft: 8 },
  linkText: { fontSize: 14, color: '#444' },
  active: { backgroundColor: '#eef6ff' },
  activeText: { color: '#0b63ce', fontWeight: '700' },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => { if (error) throw error; }, [error]);
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);

  if (!loaded) return null;
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider> 
        <ToastProvider>
          <AuthGate>
            <Stack
              screenOptions={{
                header: ({ route }) => (route.name === "index" ? null : <Header />),
                contentStyle: { backgroundColor: "#fafafa" },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
              <Stack.Screen name="tools" />
              <Stack.Screen name="quiz" />
              <Stack.Screen name="history" />
            </Stack>
          </AuthGate>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}