import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Link, SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useFonts, Jua_400Regular } from '@expo-google-fonts/jua';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    Jua: Jua_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="todos" options={{ title: '할일 목록', headerShown: true }} />
        <Stack.Screen
          name="mypage"
          options={{
            title: '마이페이지', 
            headerShown: true,
            headerTitleAlign: 'center',
            headerShadowVisible: false, 
            headerLeft: () => (
              <Pressable>
                {({ pressed }) => <Ionicons name="menu" size={32} color="black" style={{ opacity: pressed ? 0.5 : 1, marginLeft: 10 }} />}
              </Pressable>
            ),
            headerRight: () => (
              <Link href="/modal" asChild>
                <Pressable>
                  {({ pressed }) => <Ionicons name="person-circle-outline" size={28} color="black" style={{ opacity: pressed ? 0.5 : 1, marginRight: 10 }} />}
                </Pressable>
              </Link>
            ),
            headerTitleStyle: {
              fontFamily: 'Jua',
            },
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
