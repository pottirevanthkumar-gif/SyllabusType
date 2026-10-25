import type { PassageType } from '../types';

export const TYPE_META: Record<PassageType, { color: string; bg: string; border: string; label: string }> = {
  Definition: { color: 'text-ink-700', bg: 'bg-ink-100', border: 'border-ink-200', label: 'Definition' },
  Formula: { color: 'text-teal-700', bg: 'bg-teal-100', border: 'border-teal-200', label: 'Formula' },
  Code: { color: 'text-ink-800', bg: 'bg-ink-900/5', border: 'border-ink-200', label: 'Code' },
  'Short Answer': { color: 'text-ink-600', bg: 'bg-ink-50', border: 'border-ink-200', label: 'Short Answer' },
};

export const ALL_TYPES: PassageType[] = ['Definition', 'Formula', 'Code', 'Short Answer'];

export const STATUS_FLOW: Record<string, string | null> = {
  Draft: 'In Review',
  'In Review': 'Approved',
  Approved: null,
  Archived: null,
};
