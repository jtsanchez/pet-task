import { Species } from './logic';

export interface PetColors {
  label: string;
  body: string;
  ear: string;
  inner: string;
  /** Two patch colours for patterned coats (e.g. calico). */
  patches?: readonly [string, string];
  /** Restrict this colour to one species. */
  onlyFor?: Species;
}

export type ColorId =
  | 'orange'
  | 'brown'
  | 'yellow'
  | 'grey'
  | 'cream'
  | 'pink'
  | 'blue'
  | 'mint'
  | 'calico';

export const PALETTE: Record<ColorId, PetColors> = {
  orange: { label: 'Orange', body: '#F4A259', ear: '#E48B3C', inner: '#F7C59F' },
  brown: { label: 'Brown', body: '#C8956D', ear: '#7A5236', inner: '#E8C9A8' },
  yellow: { label: 'Yellow', body: '#FFD93D', ear: '#FFB627', inner: '#FFE98A' },
  grey: { label: 'Grey', body: '#A8A8B3', ear: '#7D7D8A', inner: '#D4D4DC' },
  cream: { label: 'Cream', body: '#F3E9D2', ear: '#D9C7A0', inner: '#FFF8EA' },
  pink: { label: 'Pink', body: '#F7A8C4', ear: '#E57FA5', inner: '#FBD3E2' },
  blue: { label: 'Blue', body: '#8EC5FC', ear: '#5DA3E8', inner: '#C6E2FE' },
  mint: { label: 'Mint', body: '#9EDFC1', ear: '#6CC59E', inner: '#CFF1E0' },
  calico: {
    label: 'Calico',
    body: '#FBF6EE',
    ear: '#F2A154',
    inner: '#FFFFFF',
    patches: ['#F2A154', '#3B3534'],
    onlyFor: 'cat',
  },
};

export const COLOR_IDS = Object.keys(PALETTE) as ColorId[];

/** Colours available for a species (calico is cat-only). */
export function colorsFor(species: Species): ColorId[] {
  return COLOR_IDS.filter((id) => {
    const only = PALETTE[id].onlyFor;
    return !only || only === species;
  });
}

export const DEFAULT_COLOR: Record<Species, ColorId> = {
  cat: 'orange',
  dog: 'brown',
  chick: 'yellow',
};

export const SPECIES_LABEL: Record<Species, string> = { cat: 'Cat', dog: 'Dog', chick: 'Chick' };

export function resolveColor(color: string | undefined, species: Species): ColorId {
  return color && colorsFor(species).includes(color as ColorId)
    ? (color as ColorId)
    : DEFAULT_COLOR[species];
}
