import { describe, it, expect } from 'vitest';
import { BLOOD_TYPES } from '../constants/bloodTypes';

describe('ResQBlood Constants', () => {
  it('has correct blood types array length', () => {
    expect(BLOOD_TYPES).toHaveLength(8);
  });

  it('contains all 8 standard blood types', () => {
    const expected = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    expected.forEach(type => {
      expect(BLOOD_TYPES).toContain(type);
    });
  });
});
