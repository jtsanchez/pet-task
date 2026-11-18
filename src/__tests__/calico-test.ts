import { describe, expect, it } from '@jest/globals';
import { EYES, EYE_CLEARANCE, calicoPattern } from '../calico';

const LIGHT = '#F2A154';
const DARK = '#3B3534';

describe('calicoPattern', () => {
  it('is stable for the same seed and differs between seeds', () => {
    expect(calicoPattern(123, LIGHT, DARK)).toEqual(calicoPattern(123, LIGHT, DARK));
    expect(calicoPattern(123, LIGHT, DARK)).not.toEqual(calicoPattern(456, LIGHT, DARK));
  });

  it('always uses both colours and never covers the eyes with dark patches', () => {
    for (let seed = 1; seed <= 500; seed++) {
      const { blobs } = calicoPattern(seed, LIGHT, DARK);
      expect(blobs.some((b) => b.color === LIGHT)).toBe(true);
      for (const b of blobs.filter((x) => x.color === DARK)) {
        for (const e of EYES) {
          expect(Math.hypot(b.cx - e.x, b.cy - e.y)).toBeGreaterThanOrEqual(Math.max(b.rx, b.ry) + EYE_CLEARANCE);
        }
      }
    }
  });
});
