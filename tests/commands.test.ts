import { test, expect } from 'vitest';
import {
  COMMAND_GROUPS,
  getAllCommandGroups,
  getCommandGroup,
  getAdjacentGroup,
  commandCount,
} from '@/lib/commands';

const OFFICIAL_DOC_RE = /^https:\/\/code\.claude\.com\/docs\/en\/.+\.md$/;

test('there are 5 command groups ordered 1..5 with unique slugs', () => {
  const all = getAllCommandGroups();
  expect(all).toHaveLength(5);
  expect(all.map((g) => g.order)).toEqual([1, 2, 3, 4, 5]);
  expect(new Set(all.map((g) => g.slug)).size).toBe(5);
  for (const g of all) expect(g.slug).toBe(g.category);
});

test('commandCount sums every command across groups', () => {
  const manual = COMMAND_GROUPS.reduce((sum, g) => sum + g.commands.length, 0);
  expect(commandCount()).toBe(manual);
  expect(commandCount()).toBeGreaterThanOrEqual(20);
});

test('every group satisfies the learning contract', () => {
  for (const g of getAllCommandGroups()) {
    expect(g.context.length).toBeGreaterThanOrEqual(20);
    expect(g.concept.length).toBeGreaterThanOrEqual(20);
    expect(g.efficiencyHabit.trim().length).toBeGreaterThan(0);

    expect(g.commands.length).toBeGreaterThanOrEqual(1);
    for (const c of g.commands) expect(c.command.startsWith('/')).toBe(true);

    const impacts = g.session.filter((line) => line.kind === 'impact' && (line.savedTokens ?? 0) > 0);
    expect(impacts).toHaveLength(1);
    expect(g.session.some((line) => line.kind === 'prompt')).toBe(true);

    expect(g.challenge.accepted.length).toBeGreaterThanOrEqual(1);
    expect(g.challenge.success.some((line) => line.kind === 'impact')).toBe(true);

    expect(g.check.options.filter((o) => o.correct).length).toBe(1);

    expect(g.docsRefs.length).toBeGreaterThanOrEqual(1);
    for (const ref of g.docsRefs) expect(ref.href).toMatch(OFFICIAL_DOC_RE);
  }
});

test('accessors resolve hits, misses, and adjacency', () => {
  expect(getCommandGroup('setup-config')?.title).toMatch(/configure/i);
  expect(getCommandGroup('nope')).toBeUndefined();
  expect(getAdjacentGroup('setup-config').prev).toBeNull();
  expect(getAdjacentGroup('setup-config').next?.slug).toBe('context-session');
  expect(getAdjacentGroup('recovery-debug').next).toBeNull();
});
