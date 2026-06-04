import { test, expect } from 'vitest';
import { getAllLessons, getLesson, getLessonsByTrack, getAdjacent, signatureTip } from '@/lib/lessons';

test('there are 8 beginner lessons, 24 feature modules, 26 power-user modules, and 33 team modules in track order', () => {
  const all = getAllLessons();
  expect(all).toHaveLength(91);
  expect(getLessonsByTrack('beginner').map((l) => l.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  expect(getLessonsByTrack('feature-modules').map((l) => l.slug)).toEqual([
    'agent-loop',
    'context-window',
    'permission-modes',
    'prompt-input',
    'continue-resume',
    'slash-commands',
    'search-and-read',
    'claude-md',
    'built-in-tools',
    'bash-powershell',
    'checkpointing',
    'quickstart-install-login',
    'troubleshoot-install-login',
    'terminal-configuration',
    'keybindings-shortcuts',
    'statusline-usage',
    'fullscreen-rendering',
    'voice-dictation',
    'output-styles',
    'fast-mode',
    'sandbox-environments',
    'dev-containers',
    'runtime-errors-troubleshooting',
    'environment-variables',
  ]);
  expect(getLessonsByTrack('power-user').map((l) => l.slug)).toEqual([
    'custom-slash-commands',
    'skills-on-demand',
    'subagents-isolated-context',
    'hooks-automation',
    'mcp-tool-discovery',
    'plugins-workflows',
    'plugin-distribution',
    'worktrees-isolation',
    'agent-view',
    'agent-teams',
    'dynamic-workflows',
    'goals-completion',
    'scheduled-tasks-routines',
    'vs-code-integration',
    'jetbrains-integration',
    'desktop-workflow',
    'chrome-computer-use',
    'github-actions',
    'gitlab-ci-cd',
    'code-review',
    'slack-remote-control',
    'web-cloud-sessions',
    'channels-events',
    'deep-links',
    'security-guidance-plugin',
    'ultrareview',
  ]);
  expect(getLessonsByTrack('team').map((l) => l.slug)).toEqual([
    'agent-sdk-overview',
    'headless-automation',
    'sdk-sessions',
    'sdk-permissions-user-input',
    'sdk-streaming',
    'structured-outputs',
    'custom-tools-sdk',
    'tool-search-sdk',
    'cost-tracking-sdk',
    'observability-sdk',
    'hosting-session-storage',
    'secure-deployment-sdk',
    'organization-setup',
    'analytics-monitoring',
    'managed-settings-policy',
    'managed-mcp',
    'security-data-usage',
    'network-gateways',
    'github-enterprise-server',
    'amazon-bedrock-provider',
    'google-vertex-ai-provider',
    'microsoft-foundry-provider',
    'claude-platform-on-aws',
    'rollout-kits',
    'sdk-agent-loop',
    'sdk-migration-guide',
    'sdk-plugins',
    'sdk-skills',
    'sdk-slash-commands',
    'sdk-subagents',
    'sdk-todo-lists',
    'sdk-python-reference',
    'whats-new-changelog',
  ]);
});

test('getLesson returns the lesson for a known slug, undefined otherwise', () => {
  expect(getLesson('bash-commands')?.title).toMatch(/bash/i);
  expect(getLesson('nope')).toBeUndefined();
});

test('every lesson has exactly 3 tips and exactly one signature tip', () => {
  for (const lesson of getAllLessons()) {
    expect(lesson.tips).toHaveLength(3);
    expect(lesson.tips.filter((t) => t.kind === 'signature')).toHaveLength(1);
    expect(signatureTip(lesson).kind).toBe('signature');
    expect(lesson.check.options.filter((option) => option.correct)).toHaveLength(1);
    expect(lesson.featureFamily.length).toBeGreaterThan(0);
    expect(lesson.efficiencyHabit.length).toBeGreaterThan(0);
    expect(lesson.docsRefs.length).toBeGreaterThan(0);
    for (const ref of lesson.docsRefs) {
      expect(ref.href).toMatch(/^https:\/\/code\.claude\.com\/docs\/en\/.+\.md$/);
    }
  }
});

test('tip ids are globally unique across all lessons', () => {
  const ids = getAllLessons().flatMap((l) => l.tips.map((t) => t.id));
  expect(new Set(ids).size).toBe(ids.length);
  expect(ids).toHaveLength(273);
});

test('beginner challenge lessons and advanced modules have type-it-yourself terminal challenges', () => {
  expect(getLesson('bash-commands')?.challenge?.accepted.length).toBeGreaterThan(0);
  expect(getLesson('creating-skills')?.challenge?.accepted.length).toBeGreaterThan(0);
  expect(getLesson('creating-subagents')?.challenge?.accepted.length).toBeGreaterThan(0);
  expect(getLesson('effective-prompting')?.challenge).toBeUndefined();
  for (const lesson of [...getLessonsByTrack('power-user'), ...getLessonsByTrack('team')]) {
    expect(lesson.challenge?.accepted.length).toBeGreaterThan(0);
  }
});

test('getAdjacent gives prev/next by order', () => {
  const adj = getAdjacent('bash-commands'); // order 3
  expect(adj.prev?.slug).toBe('effective-prompting');
  expect(adj.next?.slug).toBe('creating-skills');
  expect(getAdjacent('what-is-claude-code').prev).toBeNull();
  expect(getAdjacent('common-mistakes').next).toBeNull();
  expect(getAdjacent('agent-loop').prev).toBeNull();
  expect(getAdjacent('agent-loop').next?.slug).toBe('context-window');
  expect(getAdjacent('permission-modes').next?.slug).toBe('prompt-input');
  expect(getAdjacent('checkpointing').next?.slug).toBe('quickstart-install-login');
  expect(getAdjacent('runtime-errors-troubleshooting').next?.slug).toBe('environment-variables');
  expect(getAdjacent('environment-variables').next).toBeNull();
  expect(getAdjacent('custom-slash-commands').prev).toBeNull();
  expect(getAdjacent('custom-slash-commands').next?.slug).toBe('skills-on-demand');
  expect(getAdjacent('plugin-distribution').next?.slug).toBe('worktrees-isolation');
  expect(getAdjacent('scheduled-tasks-routines').next?.slug).toBe('vs-code-integration');
  expect(getAdjacent('deep-links').next?.slug).toBe('security-guidance-plugin');
  expect(getAdjacent('ultrareview').next).toBeNull();
  expect(getAdjacent('agent-sdk-overview').prev).toBeNull();
  expect(getAdjacent('agent-sdk-overview').next?.slug).toBe('headless-automation');
  expect(getAdjacent('secure-deployment-sdk').next?.slug).toBe('organization-setup');
  expect(getAdjacent('organization-setup').prev?.slug).toBe('secure-deployment-sdk');
  expect(getAdjacent('rollout-kits').next?.slug).toBe('sdk-agent-loop');
  expect(getAdjacent('sdk-agent-loop').prev?.slug).toBe('rollout-kits');
  expect(getAdjacent('sdk-python-reference').next?.slug).toBe('whats-new-changelog');
  expect(getAdjacent('whats-new-changelog').prev?.slug).toBe('sdk-python-reference');
  expect(getAdjacent('whats-new-changelog').next).toBeNull();
});
