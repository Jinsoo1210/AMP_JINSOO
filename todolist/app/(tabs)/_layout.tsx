import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Link, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
export const unstable_settings = {
  // Set the initial route to the login screen.
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false, // 기본적으로 헤더를 숨깁니다.
          headerBackTitle: '뒤로', // 뒤로 가기 버튼의 기본 텍스트를 '뒤로'로 설정합니다.
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} /> {/* 모달은 일반적으로 헤더에 뒤로 가기 버튼을 표시하지 않습니다. */}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
