import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/auth.store';

export default function RootLayout() {
  const { user, loading, loadMe } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // TEMP screenshot auto-login — DO NOT COMMIT
    (async () => {
      await loadMe();
      const s = useAuthStore.getState();
      if (__DEV__ && !s.user) {
        try { await s.login('jesusg.biz11@gmail.com', 'TestPass123!'); } catch {}
      }
    })();
  }, []);

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    if (!user && !inAuth) router.replace('/(auth)/login');
    if (user && inAuth) router.replace('/(app)');
  }, [user, loading, segments]);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
