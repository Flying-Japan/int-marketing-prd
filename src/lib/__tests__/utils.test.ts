import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('deduplicates conflicting tailwind classes', () => {
    // tailwind-merge keeps the last conflicting class
    const result = cn('text-sm', 'text-lg');
    expect(result).toBe('text-lg');
  });
});
