import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

/**
 * Manages biometric lock on app resume.
 *
 * Flow:
 *  1. On mount, check if the device supports biometrics.
 *  2. If yes and user is authenticated (session exists), lock on next background→foreground transition.
 *  3. Prompt immediately and expose `isLocked` / `unlock` for the UI.
 *
 * The lock only engages when the app comes back from background — not on first
 * launch (the Supabase session check + splash already handles that).
 */
export function useBiometricLock(isAuthenticated: boolean) {
  const [supported,  setSupported]  = useState(false);
  const [isLocked,   setIsLocked]   = useState(false);
  const [authFailed, setAuthFailed] = useState(false);

  const appState  = useRef<AppStateStatus>(AppState.currentState);
  const wasActive = useRef(false);

  // Check hardware + enrolled biometrics on mount
  useEffect(() => {
    (async () => {
      const hasHardware  = await LocalAuthentication.hasHardwareAsync();
      const hasEnrolled  = await LocalAuthentication.isEnrolledAsync();
      setSupported(hasHardware && hasEnrolled);
    })();
  }, []);

  const prompt = useCallback(async () => {
    if (!supported || !isAuthenticated) return;
    setIsLocked(true);
    setAuthFailed(false);

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage:   'Confirm your identity',
      cancelLabel:     'Use password',
      fallbackLabel:   'Use password',
      disableDeviceFallback: false,
    });

    if (result.success) {
      setIsLocked(false);
      setAuthFailed(false);
    } else {
      // Keep locked — user can retry or tap "Use password" to dismiss via logout
      setAuthFailed(true);
    }
  }, [supported, isAuthenticated]);

  // Re-lock when app comes back to foreground from background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      const prev = appState.current;
      appState.current = next;

      // background/inactive → active
      if ((prev === 'background' || prev === 'inactive') && next === 'active') {
        if (wasActive.current && supported && isAuthenticated) {
          prompt();
        }
      }

      if (next === 'active') wasActive.current = true;
    });

    return () => sub.remove();
  }, [supported, isAuthenticated, prompt]);

  return { isLocked, supported, authFailed, prompt, unlock: prompt };
}
