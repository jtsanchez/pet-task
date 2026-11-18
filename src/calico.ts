/**
 * Seeded, natural-looking calico coat patterns.
 * All coordinates are fractions of the head size (0..1, head centre = 0.5, 0.5).
 */

export interface PatchBlob {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotate: number; // degrees
  color: string;
}

export interface CalicoPattern {
  blobs: PatchBlob[];
  /** Left and right ear colours; null = plain body colour. */
  ears: [string | null, string | null];
}

/** Small deterministic PRNG so a given seed always draws the same cat. */
export function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}

/** Eye centres in head-fraction coordinates (see Face in Pet.tsx). */
export const EYES = [
  { x: 0.295, y: 0.365 },
  { x: 0.705, y: 0.365 },
];
/** Dark patches keep at least this distance from an eye centre so the face stays readable. */
export const EYE_CLEARANCE = 0.1;

export function calicoPattern(seed: number, light: string, dark: string): CalicoPattern {
  const rand = mulberry32(seed);
  const between = (a: number, b: number) => a + rand() * (b - a);

  const blobs: PatchBlob[] = [];
  const patchCount = 3 + Math.floor(rand() * 3); // 3–5 patches
  const startAngle = rand() * Math.PI * 2;
  // Make sure both colours appear, in a random order.
  const firstIsDark = rand() < 0.5;

  for (let p = 0; p < patchCount; p++) {
    const color = (p % 2 === 0) === firstIsDark ? dark : light;
    // Spread patches around the head, hugging the edge, with jitter.
    const angle = startAngle + (p * Math.PI * 2) / patchCount + between(-0.45, 0.45);
    const dist = between(0.28, 0.5);
    const cx = 0.5 + Math.cos(angle) * dist;
    const cy = 0.5 + Math.sin(angle) * dist;
    const size = between(0.1, 0.19);
    const pieces = 3 + Math.floor(rand() * 4); // 3–6 overlapping ovals per patch

    for (let i = 0; i < pieces; i++) {
      const blob: PatchBlob = {
        cx: cx + between(-size, size) * 0.9,
        cy: cy + between(-size, size) * 0.75,
        rx: size * between(0.45, 1),
        ry: size * between(0.35, 0.85),
        rotate: between(0, 180),
        color,
      };
      if (color === dark && overlapsEyes(blob)) continue;
      blobs.push(blob);
    }
  }

  // A couple of small speckles for extra randomness.
  const speckles = Math.floor(rand() * 3);
  for (let i = 0; i < speckles; i++) {
    const blob: PatchBlob = {
      cx: between(0.12, 0.88),
      cy: between(0.12, 0.88),
      rx: between(0.03, 0.055),
      ry: between(0.025, 0.045),
      rotate: between(0, 180),
      color: rand() < 0.5 ? light : dark,
    };
    if (blob.color === dark && overlapsEyes(blob)) continue;
    blobs.push(blob);
  }

  const earChoices = [light, dark, null] as const;
  const ear = () => earChoices[Math.floor(rand() * earChoices.length)];
  return { blobs, ears: [ear(), ear()] };
}

function overlapsEyes(b: PatchBlob): boolean {
  const reach = Math.max(b.rx, b.ry);
  return EYES.some((e) => Math.hypot(b.cx - e.x, b.cy - e.y) < reach + EYE_CLEARANCE);
}
