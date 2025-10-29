// app/_layout.tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import 'react-native-reanimated';
import { ToastProvider } from "../components/Toast";

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = { initialRouteName: 'index' };

SplashScreen.preventAutoHideAsync();

/** Inline header used across the app — no separate component/file */
function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const LinkBtn = ({ href, label, first = false }: { href: string; label: string; first?: boolean }) => {
    const active = pathname === href;
    return (
      <Pressable
        onPress={() => router.push(href as any)}
        style={[hs.link, !first && hs.linkSpace, active && hs.active]}
        accessibilityRole="button"
      >
        <Text style={[hs.linkText, active && hs.activeText]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={hs.wrap}>
      <Text style={hs.brand}>BioBits</Text>
      <View style={hs.row}>
        <LinkBtn href="/"       label="Home" first />
        <LinkBtn href="/tools"  label="DNA Tools" />
        <LinkBtn href="/quiz"   label="Quiz" />
        {/* Delete the next line if you DON'T have app/history.tsx */}
        <LinkBtn href="/history" label="History" />
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
  row: { flexDirection: 'row', alignItems: 'center' },
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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ToastProvider>
        <Stack
          screenOptions={{
            header: () => <Header />, 
            contentStyle: { backgroundColor: '#fafafa' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="tools" />
          <Stack.Screen name="quiz" />
          <Stack.Screen name="history" />
        </Stack>
      </ToastProvider>
    </ThemeProvider>
  );
}
