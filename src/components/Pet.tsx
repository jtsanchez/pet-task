import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { calicoPattern, CalicoPattern } from '../calico';
import { Mood, Species } from '../logic';
import { ColorId, DEFAULT_COLOR, PALETTE } from '../palette';
import { useTheme } from '../theme';

const INK = '#333';

interface Props {
  species: Species;
  mood: Mood;
  color?: ColorId;
  /** Seed for patterned coats (calico), so each pet's pattern is unique but stable. */
  seed?: number;
  /** Bumped to trigger a celebration bounce. */
  celebrateKey?: number;
  size?: number;
}

export function Pet({ species, mood, color, seed = 1, celebrateKey = 0, size = 180 }: Props) {
  const theme = useTheme();
  const [idle] = useState(() => new Animated.Value(0));
  const [bounce] = useState(() => new Animated.Value(0));

  // Gentle idle "breathing"; slower when sad.
  useEffect(() => {
    const duration = mood === 'sad' ? 2200 : 1200;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(idle, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(idle, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [idle, mood]);

  useEffect(() => {
    if (celebrateKey === 0) return;
    bounce.setValue(0);
    Animated.sequence([
      Animated.timing(bounce, { toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(bounce, { toValue: 0, friction: 3, tension: 120, useNativeDriver: true }),
    ]).start();
  }, [bounce, celebrateKey]);

  const scale = idle.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const jump = bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.22] });

  const c = PALETTE[color ?? DEFAULT_COLOR[species]];
  const s = size;
  const pattern = useMemo(
    () => (c.patches ? calicoPattern(seed, c.patches[0], c.patches[1]) : null),
    [c.patches, seed],
  );

  return (
    <View style={{ width: s * 1.3, height: s * 1.2, alignItems: 'center', justifyContent: 'flex-end' }}>
      <Animated.View style={{ transform: [{ translateY: jump }, { scale }], alignItems: 'center' }}>
        {/* Ears / tuft sit behind the head */}
        {species === 'cat' && (
          <>
            <Triangle color={pattern?.ears[0] ?? c.body} size={s * 0.3} style={{ position: 'absolute', top: -s * 0.12, left: s * 0.08, transform: [{ rotate: '-15deg' }] }} />
            <Triangle color={pattern?.ears[1] ?? c.body} size={s * 0.3} style={{ position: 'absolute', top: -s * 0.12, right: s * 0.08, transform: [{ rotate: '15deg' }] }} />
          </>
        )}
        {species === 'chick' && (
          <View style={{ position: 'absolute', top: -s * 0.1, flexDirection: 'row' }}>
            {[-25, 0, 25].map((deg) => (
              <View
                key={deg}
                style={{
                  width: s * 0.045,
                  height: deg === 0 ? s * 0.17 : s * 0.13,
                  borderRadius: s * 0.025,
                  marginHorizontal: s * 0.006,
                  backgroundColor: c.ear,
                  transform: [{ rotate: `${deg}deg` }],
                }}
              />
            ))}
          </View>
        )}

        <View style={{ width: s, height: s, borderRadius: s / 2, backgroundColor: c.body, alignItems: 'center' }}>
          {pattern && <CoatPatches pattern={pattern} size={s} />}
          {species === 'dog' && (
            <>
              <View style={[styles.abs, { top: '8%', borderRadius: s * 0.22, backgroundColor: c.ear, width: s * 0.28, height: s * 0.5, left: -s * 0.1, transform: [{ rotate: mood === 'sad' ? '20deg' : '10deg' }] }]} />
              <View style={[styles.abs, { top: '8%', borderRadius: s * 0.22, backgroundColor: c.ear, width: s * 0.28, height: s * 0.5, right: -s * 0.1, transform: [{ rotate: mood === 'sad' ? '-20deg' : '-10deg' }] }]} />
              <View style={[styles.abs, { bottom: s * 0.1, width: s * 0.55, height: s * 0.4, borderRadius: s * 0.25, backgroundColor: c.inner }]} />
            </>
          )}

          <Face species={species} mood={mood} size={s} />
        </View>
      </Animated.View>
      <View style={{ width: s * 0.8, height: s * 0.07, borderRadius: s, backgroundColor: theme.petShadow, marginTop: s * 0.035 }} />
    </View>
  );
}

/** Patterned coat (calico), clipped to the round head. Dark patches avoid the eyes. */
export function CoatPatches({ pattern, size: s }: { pattern: CalicoPattern; size: number }) {
  return (
    <View style={[styles.abs, { top: 0, left: 0, width: s, height: s, borderRadius: s / 2, overflow: 'hidden' }]}>
      {pattern.blobs.map((b, i) => (
        <View
          key={i}
          style={[
            styles.abs,
            {
              left: (b.cx - b.rx) * s,
              top: (b.cy - b.ry) * s,
              width: b.rx * 2 * s,
              height: b.ry * 2 * s,
              borderRadius: Math.max(b.rx, b.ry) * s,
              backgroundColor: b.color,
              transform: [{ rotate: `${b.rotate}deg` }],
            },
          ]}
        />
      ))}
    </View>
  );
}

function Face({ species, mood, size: s }: { species: Species; mood: Mood; size: number }) {
  const eye = s * 0.09;
  const stroke = Math.max(1.5, s * 0.017);
  return (
    <View style={{ position: 'absolute', top: s * 0.32, width: s, alignItems: 'center' }}>
      {/* Eyes */}
      <View style={{ flexDirection: 'row', width: s * 0.5, justifyContent: 'space-between' }}>
        {[0, 1].map((i) => (
          <View key={i} style={{ alignItems: 'center' }}>
            {mood === 'sad' && (
              <View style={{ width: eye * 1.4, height: stroke, borderRadius: stroke, backgroundColor: INK, marginBottom: s * 0.022, transform: [{ rotate: i === 0 ? '-20deg' : '20deg' }] }} />
            )}
            {mood === 'happy' ? (
              // Closed, smiling "^" eyes
              <View style={{ width: eye * 1.3, height: eye * 0.7, borderTopLeftRadius: eye, borderTopRightRadius: eye, borderWidth: stroke, borderBottomWidth: 0, borderColor: INK }} />
            ) : (
              <View style={{ width: eye, height: eye, borderRadius: eye / 2, backgroundColor: INK }} />
            )}
            {mood === 'sad' && i === 1 && (
              <View style={[styles.abs, { top: '100%', width: eye * 0.6, height: eye * 0.9, backgroundColor: '#6EC6FF', borderRadius: eye * 0.5, borderTopLeftRadius: 0 }]} />
            )}
          </View>
        ))}
      </View>

      {/* Nose / beak */}
      {species === 'chick' ? (
        <Triangle color="#FF8C42" size={s * 0.14} style={{ marginTop: s * 0.04, transform: [{ rotate: '180deg' }] }} />
      ) : (
        <View style={{ marginTop: s * 0.05, width: s * 0.09, height: s * 0.06, borderRadius: s * 0.04, backgroundColor: species === 'dog' ? INK : '#E36588' }} />
      )}

      <Mouth mood={mood} width={s * 0.2} stroke={stroke} gap={s * 0.045} />

      {/* Whiskers for the cat */}
      {species === 'cat' && (
        <View style={[styles.abs, { top: s * 0.15, width: s * 0.95, flexDirection: 'row', justifyContent: 'space-between' }]}>
          {[1, -1].map((side) => (
            <View key={side}>
              {[1, -1].map((tilt) => (
                <View
                  key={tilt}
                  style={{
                    width: s * 0.19,
                    height: Math.max(1, s * 0.011),
                    backgroundColor: '#5A3E2B',
                    marginVertical: s * 0.022,
                    transform: [{ rotate: `${8 * side * tilt}deg` }],
                  }}
                />
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Rosy cheeks when happy, scaled to the pet's size */}
      {mood === 'happy' && (
        <View style={[styles.abs, { top: s * 0.12, flexDirection: 'row', width: s * 0.66, justifyContent: 'space-between' }]}>
          {[0, 1].map((i) => (
            <View key={i} style={{ width: s * 0.1, height: s * 0.055, borderRadius: s * 0.03, backgroundColor: 'rgba(255, 105, 135, 0.4)' }} />
          ))}
        </View>
      )}
    </View>
  );
}

function Mouth({ mood, width, stroke, gap }: { mood: Mood; width: number; stroke: number; gap: number }) {
  const h = width / 2;
  if (mood === 'neutral') {
    return <View style={{ marginTop: gap, width: width * 0.7, height: stroke, borderRadius: stroke, backgroundColor: INK }} />;
  }
  const happy = mood === 'happy';
  return (
    <View
      style={{
        marginTop: happy ? stroke : gap * 1.2,
        width,
        height: h,
        borderColor: INK,
        borderWidth: stroke,
        ...(happy
          ? { borderTopWidth: 0, borderBottomLeftRadius: h, borderBottomRightRadius: h }
          : { borderBottomWidth: 0, borderTopLeftRadius: h, borderTopRightRadius: h }),
      }}
    />
  );
}

function Triangle({ color, size, style }: { color: string; size: number; style?: object }) {
  return (
    <View
      style={[
        {
          width: 0,
          height: 0,
          borderLeftWidth: size / 2,
          borderRightWidth: size / 2,
          borderBottomWidth: size,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
});
