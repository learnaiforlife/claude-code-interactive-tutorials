import { describe, expect, test } from 'vitest';
import {
  bankedSavedTokensIn,
  calculateImpact,
  cascadeFactor,
  tokensToCost,
  tokensToEco,
} from '@/lib/impact';

describe('impact math', () => {
  test('prices saved tokens from the configured Sonnet input-token rate', () => {
    expect(tokensToCost(1_000_000)).toBe(3);
    expect(tokensToCost(2_000, 'daily-habit')).toBe(15);
  });

  test('returns honest eco ranges and applies cascade factors', () => {
    expect(cascadeFactor('team')).toBe(50000);
    expect(tokensToEco(1000)).toEqual({
      whLo: 0.24,
      whHi: 1.5,
      mlLo: 0.26,
      mlHi: 4.3,
      co2Lo: 0.03,
      co2Hi: 0.6,
    });
    expect(tokensToEco(1000, 'daily-habit').whLo).toBe(600);
  });

  test('combines scaled tokens, exact cost and eco ranges', () => {
    expect(calculateImpact(2000, 'team')).toMatchObject({
      tokens: 100_000_000,
      costUsd: 300,
      eco: { whLo: 24_000, whHi: 150_000 },
    });
  });

  test('sums saved tokens for all banked tips in progress', () => {
    expect(
      bankedSavedTokensIn({
        bankedTips: {
          'what-is-claude-code': ['l1-litmus', 'l1-context-cost'],
          'bash-commands': ['l3-grep'],
        },
      }),
    ).toBe(6400);
  });
});

