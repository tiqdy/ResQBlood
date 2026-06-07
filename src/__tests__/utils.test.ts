import { describe, it, expect } from 'vitest';
import { 
  isEligibleToDonate, 
  getUrgencyLabel, 
  getStatusLabel, 
  formatDate 
} from '../lib/utils';

describe('ResQBlood Utility Helpers', () => {
  describe('isEligibleToDonate', () => {
    it('returns true when lastDonatedAt is null', () => {
      expect(isEligibleToDonate(null)).toBe(true);
      expect(isEligibleToDonate(undefined)).toBe(true);
    });

    it('returns true when lastDonatedAt is more than 90 days ago', () => {
      const ninetyFiveDaysAgo = new Date();
      ninetyFiveDaysAgo.setDate(ninetyFiveDaysAgo.getDate() - 95);
      const dateString = ninetyFiveDaysAgo.toISOString().split('T')[0];
      
      expect(isEligibleToDonate(dateString)).toBe(true);
    });

    it('returns false when lastDonatedAt is less than 90 days ago', () => {
      const eightyDaysAgo = new Date();
      eightyDaysAgo.setDate(eightyDaysAgo.getDate() - 80);
      const dateString = eightyDaysAgo.toISOString().split('T')[0];
      
      expect(isEligibleToDonate(dateString)).toBe(false);
    });
  });

  describe('getUrgencyLabel', () => {
    it('translates urgency values correctly to English', () => {
      expect(getUrgencyLabel('critical')).toBe('Critical');
      expect(getUrgencyLabel('urgent')).toBe('Urgent');
      expect(getUrgencyLabel('normal')).toBe('Normal');
    });
  });

  describe('getStatusLabel', () => {
    it('translates request status values correctly to English', () => {
      expect(getStatusLabel('open')).toBe('Open');
      expect(getStatusLabel('in_progress')).toBe('In Progress');
      expect(getStatusLabel('fulfilled')).toBe('Fulfilled');
      expect(getStatusLabel('cancelled')).toBe('Cancelled');
    });
  });

  describe('formatDate', () => {
    it('formats ISO dates correctly into English format', () => {
      expect(formatDate('2024-01-15')).toBe('January 15, 2024');
    });

    it('returns hyphens for invalid or null dates', () => {
      expect(formatDate(null)).toBe('-');
      expect(formatDate('invalid-date')).toBe('-');
    });
  });
});
