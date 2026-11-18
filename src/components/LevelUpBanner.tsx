import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';

interface Props {
  level: number;
  /** Bumped each time a level-up should be shown; 0 = never shown. */
  triggerKey: number;
}

const SPARKLES = ['✨', '⭐', '🎉', '⭐', '✨'];

/** A pop-in "LEVEL UP!" card shown over the pet, then fades away. */
export function LevelUpBanner({ level, triggerKey }: Props) {
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (triggerKey === 0) return;
    anim.setValue(0);
    const run = Animated.sequence([
      Animated.spring(anim, { toValue: 1, friction: 4, tension: 90, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(anim, { toValue: 2, duration: 400, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]);
    run.start();
    return () => run.stop();
  }, [anim, triggerKey]);

  // Fully transparent at rest (anim 0) and after fading out (anim 2).
  if (triggerKey === 0) return null;

  const scale = anim.interpolate({ inputRange: [0, 1, 2], outputRange: [0.3, 1, 1.15] });
  const opacity = anim.interpolate({ inputRange: [0, 0.3, 1, 2], outputRange: [0, 1, 1, 0] });
  const rise = anim.interpolate({ inputRange: [0, 1, 2], outputRange: [20, 0, -20] });

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Animated.View style={[styles.card, { opacity, transform: [{ scale }, { translateY: rise }] }]}>
        <Text style={styles.sparkles}>{SPARKLES.join(' ')}</Text>
        <Text style={styles.title}>LEVEL UP!</Text>
        <Text style={styles.level}>Lv {level}</Text>
      </Animated.View>
    </View>
  );
}

/** The "Lv N" badge; pulses gold when the level goes up. */
export function LevelBadge({ level, triggerKey }: Props) {
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (triggerKey === 0) return;
    pulse.setValue(0);
    const run = Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(pulse, { toValue: 0, friction: 3, tension: 80, useNativeDriver: true }),
    ]);
    run.start();
    return () => run.stop();
  }, [pulse, triggerKey]);

  const t = useTheme();
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
  return (
    <Animated.View style={[styles.badge, { backgroundColor: t.primaryBg, transform: [{ scale }] }]}>
      <Text style={[styles.badgeText, { color: t.primaryText }]}>Lv {level}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  badgeText: { fontWeight: '800', fontSize: 16 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  card: {
    backgroundColor: '#2D2A32',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 34,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD93D',
    shadowColor: '#FFB627',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  sparkles: { fontSize: 18, marginBottom: 4 },
  title: { color: '#FFD93D', fontSize: 34, fontWeight: '900', letterSpacing: 2 },
  level: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 2 },
});
