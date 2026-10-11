import {
  Smile, Leaf, HeartHandshake, PartyPopper, CloudRain,
  Wind, Waves, Flame, Sunrise, CloudFog,
  type LucideIcon,
} from 'lucide-react';
import type { MoodDef, MoodId } from '../types/journal';

export const MOODS: MoodDef[] = [
  { id: 'happy',       label: 'Happy',       bg: '#FDEFC9', fg: '#8A6516' },
  { id: 'peaceful',    label: 'Peaceful',    bg: '#DCEBD5', fg: '#4A6B3E' },
  { id: 'grateful',    label: 'Grateful',    bg: '#F9DADD', fg: '#9B4651' },
  { id: 'excited',     label: 'Excited',     bg: '#FBDCC8', fg: '#9A5230' },
  { id: 'sad',         label: 'Sad',         bg: '#D9E4F2', fg: '#43628A' },
  { id: 'anxious',     label: 'Anxious',     bg: '#E8DEF5', fg: '#6B4E97' },
  { id: 'overwhelmed', label: 'Overwhelmed', bg: '#D6EBEA', fg: '#3F7371' },
  { id: 'angry',       label: 'Angry',       bg: '#F6D3D0', fg: '#A04139' },
  { id: 'hopeful',     label: 'Hopeful',     bg: '#E5EFC9', fg: '#667A2C' },
  { id: 'numb',        label: 'Numb',        bg: '#E6E3E8', fg: '#6A6472' },
];

export const MOOD_ICONS: Record<MoodId, LucideIcon> = {
  happy: Smile,
  peaceful: Leaf,
  grateful: HeartHandshake,
  excited: PartyPopper,
  sad: CloudRain,
  anxious: Wind,
  overwhelmed: Waves,
  angry: Flame,
  hopeful: Sunrise,
  numb: CloudFog,
};

export const getMood = (id: MoodId | null | undefined): MoodDef | null =>
  id ? MOODS.find((m) => m.id === id) ?? null : null;
