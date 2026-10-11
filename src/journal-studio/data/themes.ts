import type { PageThemeId } from '../types/journal';

export interface PageTheme {
  id: PageThemeId;
  label: string;
  /** swatch colour for the picker */
  swatch: string;
}

export const PAGE_THEMES: PageTheme[] = [
  { id: 'cream',    label: 'Plain cream',  swatch: '#FFFCF5' },
  { id: 'lined',    label: 'Ruled',        swatch: '#FFFCF5' },
  { id: 'dotted',   label: 'Dotted',       swatch: '#FFFCF5' },
  { id: 'grid',     label: 'Grid',         swatch: '#FFFCF5' },
  { id: 'blush',    label: 'Blush',        swatch: '#FDEDEE' },
  { id: 'lavender', label: 'Lavender',     swatch: '#F1ECFA' },
  { id: 'sage',     label: 'Sage',         swatch: '#EBF1E4' },
];
