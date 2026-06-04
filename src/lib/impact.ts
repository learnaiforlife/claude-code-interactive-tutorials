import type { Progress, Tip } from './types';
import { getAllLessons } from './lessons';

export type CascadeMode = 'per-use' | 'daily-habit' | 'team';

export interface EcoImpact {
  whLo: number;
  whHi: number;
  mlLo: number;
  mlHi: number;
  co2Lo: number;
  co2Hi: number;
}

export interface Impact {
  tokens: number;
  costUsd: number;
  eco: EcoImpact;
}

export const IMPACT_PRICING = {
  model: 'Claude Sonnet standard input/context tokens',
  usdPerMillionTokens: 3,
} as const;

/*
  Eco figures are intentionally broad. We convert saved tokens to "query-equivalents"
  at 1,000 tokens/query, then apply public prompt-level estimates:
  - energy: 0.24 Wh to 1.5 Wh/query
  - water: 0.26 mL to 4.3 mL/query
  - CO2e: 0.03 g to 0.60 g/query
*/
export const IMPACT_ECO = {
  assumedTokensPerQuery: 1000,
  whPerQueryLo: 0.24,
  whPerQueryHi: 1.5,
  mlPerQueryLo: 0.26,
  mlPerQueryHi: 4.3,
  co2GPerQueryLo: 0.03,
  co2GPerQueryHi: 0.6,
} as const;

export const CASCADES: Array<{ mode: CascadeMode; label: string; factor: number }> = [
  { mode: 'per-use', label: 'Per use', factor: 1 },
  { mode: 'daily-habit', label: 'Daily habit', factor: 2500 },
  { mode: 'team', label: 'Team of 20', factor: 50000 },
];

export function cascadeFactor(mode: CascadeMode): number {
  return CASCADES.find((c) => c.mode === mode)?.factor ?? 1;
}

export function tokensToCost(tokens: number, mode: CascadeMode = 'per-use'): number {
  return (tokens * cascadeFactor(mode) * IMPACT_PRICING.usdPerMillionTokens) / 1_000_000;
}

export function tokensToEco(tokens: number, mode: CascadeMode = 'per-use'): EcoImpact {
  const queryEquivalents = (tokens * cascadeFactor(mode)) / IMPACT_ECO.assumedTokensPerQuery;
  return {
    whLo: queryEquivalents * IMPACT_ECO.whPerQueryLo,
    whHi: queryEquivalents * IMPACT_ECO.whPerQueryHi,
    mlLo: queryEquivalents * IMPACT_ECO.mlPerQueryLo,
    mlHi: queryEquivalents * IMPACT_ECO.mlPerQueryHi,
    co2Lo: queryEquivalents * IMPACT_ECO.co2GPerQueryLo,
    co2Hi: queryEquivalents * IMPACT_ECO.co2GPerQueryHi,
  };
}

export function calculateImpact(tokens: number, mode: CascadeMode = 'per-use'): Impact {
  const scaledTokens = tokens * cascadeFactor(mode);
  return {
    tokens: scaledTokens,
    costUsd: tokensToCost(tokens, mode),
    eco: tokensToEco(tokens, mode),
  };
}

export function bankedTipsIn(progress: Progress): Tip[] {
  const lessons = getAllLessons();
  return lessons.flatMap((lesson) => {
    const banked = progress.bankedTips[lesson.slug] ?? [];
    return lesson.tips.filter((tip) => banked.includes(tip.id));
  });
}

export function bankedSavedTokensIn(progress: Progress): number {
  return bankedTipsIn(progress).reduce((sum, tip) => sum + tip.savedTokens, 0);
}

