import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

import { Fonts, Radius, Spacing } from '@/constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

// ---------------------------------------------------------------------------
// Single toast item
// ---------------------------------------------------------------------------
function ToastItem({
  message,
  type,
  onDone,
}: {
  message: string;
  type: ToastType;
  onDone: () => void;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity,     { toValue: 1,  duration: 250, useNativeDriver: true }),
        Animated.timing(translateY,  { toValue: 0,  duration: 250, useNativeDriver: true }),
      ]),
      Animated.delay(2800),
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 0,  duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -12, duration: 250, useNativeDriver: true }),
      ]),
    ]).start(({ finished }) => { if (finished) onDone(); });
  }, [opacity, translateY, onDone]);

  const bg =
    type === 'success' ? '#1a3a2a' :
    type === 'error'   ? '#3a1a1a' :
                         '#1e1a3a';

  const borderColor =
    type === 'success' ? '#5fbf8a' :
    type === 'error'   ? '#f07070' :
                         '#c8befa';

  const textColor =
    type === 'success' ? '#5fbf8a' :
    type === 'error'   ? '#f07070' :
                         '#c8befa';

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: bg, borderColor, opacity, transform: [{ translateY }] },
      ]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert">
      <Text style={[styles.toastText, { color: textColor }]} numberOfLines={3}>
        {type === 'success' ? '✓  ' : type === 'error' ? '✕  ' : 'ℹ  '}{message}
      </Text>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Provider — wrap your root layout with this
// ---------------------------------------------------------------------------
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const counter = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++counter.current;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(t => (
        <ToastItem key={t.id} message={t.message} type={t.type} onDone={() => remove(t.id)} />
      ))}
    </ToastContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: Spacing.three,
    right: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  toastText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
});
