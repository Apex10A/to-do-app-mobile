import '@/global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { AppSplashScreen } from '@/components/app-splash-screen';
import { ToastProvider } from '@/components/toast';
import { Brand, FontAssets } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

SplashScreen.preventAutoHideAsync();

// ---------------------------------------------------------------------------
// Auth state
// ---------------------------------------------------------------------------
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

function useAuthStatus(): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setStatus(session ? 'authenticated' : 'unauthenticated');
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setStatus(session ? 'authenticated' : 'unauthenticated');
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return status;
}

// ---------------------------------------------------------------------------
// Auth guard
// ---------------------------------------------------------------------------
function AuthGuard({ authStatus }: { authStatus: AuthStatus }) {
  const segments = useSegments();
  const router   = useRouter();

  useEffect(() => {
    if (authStatus === 'loading') return;

    const inAuthGroup = segments[0] === '(auth)';

    if (authStatus === 'unauthenticated' && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (authStatus === 'authenticated' && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [authStatus, segments, router]);

  return null;
}

// ---------------------------------------------------------------------------
// Root layout
// ---------------------------------------------------------------------------
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const authStatus  = useAuthStatus();

  const [fontsLoaded, fontError] = useFonts(FontAssets);
  const [nativeHidden,  setNativeHidden]  = useState(false);
  const [appSplashDone, setAppSplashDone] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().then(() => setNativeHidden(true));
    }
  }, [fontsLoaded, fontError]);

  const handleSplashDone = useCallback(() => setAppSplashDone(true), []);

  const navTheme = colorScheme === 'dark'
    ? { ...DarkTheme,    colors: { ...DarkTheme.colors,    background: Brand.championBlue, card: '#1e1a3a',  border: '#2d2856', primary: Brand.lavenderTonic } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: '#f2effe',          card: '#ffffff',  border: '#ddd6f8', primary: Brand.lavenderTonic } };

  return (
    <ThemeProvider value={navTheme}>
      <ToastProvider>
        <Slot />
        {appSplashDone && <AuthGuard authStatus={authStatus} />}
        {nativeHidden && !appSplashDone && (
          <AppSplashScreen onAnimationComplete={handleSplashDone} />
        )}
      </ToastProvider>
    </ThemeProvider>
  );
}
