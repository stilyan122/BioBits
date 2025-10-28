// Imports which load the vector icon, font metadata so icons render correctly.

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/components/useColorScheme';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// This tells Expo not to hide the splash automactically - we'll hide it manually
// once the fonts are loaded.
SplashScreen.preventAutoHideAsync();

// Waits for fonts. 
export default function RootLayout() {
  // Asynchronously loads custom fonts.
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // If there was an error loading the fonts, throw it.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // When loaded becomes true, it hides the splash screen.
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Renders the root layout navigation.
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  // This helper returns the current color scheme (light or dark or system).
  const colorScheme = useColorScheme();

  // We pass the scheme to the ThemeProvider to get dark/light colors for headers, backgrounds, etc.
  
  // Stack is from the expo-router and defines a stack navigator at the root.
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
