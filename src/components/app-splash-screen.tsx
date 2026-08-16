import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Image, StyleSheet, View } from 'react-native';

import { Brand, Fonts } from '@/constants/theme';

const { width } = Dimensions.get('window');
const LOGO_SIZE = width * 0.35;

interface AppSplashScreenProps {
  /** Called when the exit animation completes — use this to unmount the splash */
  onAnimationComplete: () => void;
}

/**
 * In-app animated splash screen.
 *
 * Sequence:
 *  1. Logo scales + fades in  (600 ms)
 *  2. Hold for 400 ms
 *  3. Tagline fades in        (400 ms)
 *  4. Hold for 500 ms
 *  5. Entire screen fades out (500 ms) → onAnimationComplete fires
 */
export function AppSplashScreen({ onAnimationComplete }: AppSplashScreenProps) {
  const logoScale   = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  // Shimmer sweep across the logo
  const shimmerX = useRef(new Animated.Value(-LOGO_SIZE)).current;

  useEffect(() => {
    // Shimmer loop (runs in parallel with the main sequence)
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerX, {
          toValue: LOGO_SIZE * 1.5,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.delay(800),
      ]),
    );

    // Main entrance + exit sequence
    const sequence = Animated.sequence([
      // 1. Logo entrance
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      // 2. Brief hold
      Animated.delay(400),
      // 3. Tagline fade in
      Animated.timing(tagOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // 4. Hold
      Animated.delay(600),
      // 5. Whole screen fades out
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 500,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    shimmerLoop.start();
    sequence.start(({ finished }) => {
      if (finished) {
        shimmerLoop.stop();
        onAnimationComplete();
      }
    });

    return () => {
      shimmerLoop.stop();
      sequence.stop();
    };
  }, [logoScale, logoOpacity, tagOpacity, screenOpacity, shimmerX, onAnimationComplete]);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      {/* Subtle radial glow behind the logo */}
      <View style={styles.glow} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoWrapper,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}>
        <Image
          source={require('../../assets/images/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="App logo"
        />

        {/* Shimmer overlay */}
        <Animated.View
          style={[
            styles.shimmer,
            { transform: [{ translateX: shimmerX }, { rotate: '25deg' }] },
          ]}
          pointerEvents="none"
        />
      </Animated.View>

      {/* App name */}
      <Animated.Text style={[styles.appName, { opacity: logoOpacity }]}>
        TodoApp
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
        Stay organised, stay ahead.
      </Animated.Text>

      {/* Bottom pill indicator */}
      <Animated.View style={[styles.pill, { opacity: tagOpacity }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Brand.championBlue,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },

  // Soft radial glow
  glow: {
    position: 'absolute',
    width: LOGO_SIZE * 2.4,
    height: LOGO_SIZE * 2.4,
    borderRadius: LOGO_SIZE * 1.2,
    backgroundColor: Brand.lavenderTonic,
    opacity: 0.08,
  },

  // Logo container (needed for shimmer clipping)
  logoWrapper: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: LOGO_SIZE * 0.22,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },

  // Shimmer streak
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: LOGO_SIZE * 0.35,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  // App name
  appName: {
    marginTop: 28,
    fontFamily: Fonts.bold,
    fontSize: 32,
    letterSpacing: 1,
    color: Brand.lavenderTonic,
  },

  // Tagline
  tagline: {
    marginTop: 10,
    fontFamily: Fonts.light,
    fontSize: 14,
    letterSpacing: 0.6,
    color: 'rgba(200,190,250,0.65)',
  },

  // Bottom decorative pill
  pill: {
    position: 'absolute',
    bottom: 52,
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Brand.lavenderTonic,
    opacity: 0.5,
  },
});
