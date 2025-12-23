import { describe, it, expect } from 'vitest';
import { parseLines, compare, ranges } from './analyze';

describe('parseLines', () => {
  it('parses lines with number and unit', () => {
    const input = 'Hemoglobin: 12.8 g/dL\nWBC: 6.1 10^9/L';
    const out = parseLines(input);
    expect(out).toEqual([
      { term: 'Hemoglobin', value: 12.8, unit: 'g/dL' },
      { term: 'WBC', value: 6.1, unit: '10^9/L' },
    ]);
  });

  it('handles missing value gracefully', () => {
    const out = parseLines('Platelets:');
    expect(out[0]).toMatchObject({ term: 'Platelets', value: undefined });
  });
});

describe('compare', () => {
  it('flags in-range', () => {
    const r = compare('Glucose (Fasting)', 90);
    expect(r.status).toBe('in-range');
    expect(r.typical).toEqual(ranges['Glucose (Fasting)'].typical);
  });
  it('flags low and high correctly', () => {
    expect(compare('Hemoglobin', 10).status).toBe('low');
    expect(compare('Hemoglobin', 17).status).toBe('high');
  });
});
