import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { bootstrapSession } from '../src/lib/api-client-setup'; // also runs configureApiClient() as a module side effect
import { queryClient } from '../src/lib/query-client';
import { useSessionStore } from '../src/lib/session-store';
import { usePushNotificationRegistration } from '../src/lib/push-notifications';

export default function RootLayout() {
  const [isReady, setReady] = useState(false);
  const isAuthenticated = useSessionStore((s) => s.status === 'authenticated');

  useEffect(() => {
    bootstrapSession().finally(() => setReady(true));
  }, []);

  usePushNotificationRegistration(isAuthenticated);

  if (!isReady) return null; // splash screen stays up until this resolves

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="product/[slug]" options={{ headerShown: true, title: '' }} />
            <Stack.Screen name="login" options={{ headerShown: true, title: 'Sign in', presentation: 'modal' }} />
            <Stack.Screen name="register" options={{ headerShown: true, title: 'Create account', presentation: 'modal' }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
