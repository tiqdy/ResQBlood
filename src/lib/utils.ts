import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { UrgencyLevel, RequestStatus } from '../types';

/**
 * Merges Tailwind CSS classes safely using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a ISO date string to English locale format (e.g. June 6, 2026)
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch (e) {
    return '-';
  }
}

/**
 * Returns the CSS styling classes for each urgency level
 */
export function getUrgencyColor(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'critical':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'urgent':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'normal':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

/**
 * Translates urgency levels to English labels
 */
export function getUrgencyLabel(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'critical':
      return 'Critical';
    case 'urgent':
      return 'Urgent';
    case 'normal':
      return 'Normal';
    default:
      return urgency;
  }
}

/**
 * Returns the CSS styling classes for each request status
 */
export function getStatusColor(status: RequestStatus): string {
  switch (status) {
    case 'open':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'fulfilled':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'cancelled':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

/**
 * Translates request statuses to English labels
 */
export function getStatusLabel(status: RequestStatus): string {
  switch (status) {
    case 'open':
      return 'Open';
    case 'in_progress':
      return 'In Progress';
    case 'fulfilled':
      return 'Fulfilled';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

/**
 * Checks if a donor is eligible to donate (last donated is null or > 90 days ago)
 */
export function isEligibleToDonate(lastDonatedAt: string | null | undefined): boolean {
  if (!lastDonatedAt) return true;
  const days = daysSinceLastDonation(lastDonatedAt);
  if (days === null) return true;
  return days >= 90;
}

/**
 * Calculates days elapsed since the last donation date
 */
export function daysSinceLastDonation(lastDonatedAt: string | null | undefined): number | null {
  if (!lastDonatedAt) return null;
  try {
    const lastDate = new Date(lastDonatedAt);
    if (isNaN(lastDate.getTime())) return null;
    
    const today = new Date();
    // Reset time components for accurate date difference
    today.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - lastDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch (e) {
    return null;
  }
}
