import type { BloodType } from '../types';

export const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const BLOOD_TYPE_COLORS: Record<BloodType, { bg: string; text: string; border: string }> = {
  'A+': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'A-': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  'B+': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'B-': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'AB+': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'AB-': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'O+': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'O-': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
};
