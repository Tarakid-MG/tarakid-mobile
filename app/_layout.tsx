import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { ExitKidModeModal } from "../src/components/kid-mode/ExitKidModeModal";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { KidModeProvider, useKidMode } from "../src/context/KidModeContext";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <KidModeProvider>
        <NavigationContent />
      </KidModeProvider>
    </AuthProvider>
  );
}

function NavigationContent() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();
  const { isKidMode } = useKidMode();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated) {
      if (isKidMode) {
        // Enforce Kid Mode lock-down
        if (inTabsGroup || inAuthGroup) {
          router.replace("/kid-dashboard");
        }
      } else {
        // Regular mode - redirect away from kid screens
        const isOnKidScreen =
          segments.length > 0 &&
          (segments[0] === "kid-dashboard" || segments[0] === "lessons");

        if (inAuthGroup || isOnKidScreen) {
          router.replace("/(tabs)");
        }
      }
    }
  }, [isAuthenticated, segments, isLoading, isKidMode]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="kid-dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="lessons" options={{ headerShown: false }} />
      </Stack>
      <ExitKidModeModal />
    </ThemeProvider>
  );
}
