import { readFile } from 'node:fs/promises';
import process from 'node:process';
import ts from 'typescript';

const LESSONS_URL = new URL('../src/lib/lessons.ts', import.meta.url);
const OFFICIAL_DOC_RE = /^https:\/\/code\.claude\.com\/docs\/en\/.+\.md$/;
const EXPECTED_TRACK_COUNTS = {
  beginner: 8,
  'feature-modules': 24,
  'power-user': 26,
  team: 33,
};
const REQUIRED_BEGINNER_CHALLENGES = new Set(['bash-commands', 'creating-skills', 'creating-subagents']);

const sourceText = await readFile(LESSONS_URL, 'utf8');
const sourceFile = ts.createSourceFile(LESSONS_URL.pathname, sourceText, ts.ScriptTarget.Latest, true);
const lessons = readLessons(sourceFile);
const errors = [];

auditLessonCount(lessons, errors);
auditLessonContract(lessons, errors);
auditChallengeCoverage(lessons, errors);
auditUniqueIds(lessons, errors);
auditCopyCharacters(lessons, errors);

console.log('Claude Code curriculum contract audit');
console.log(`Lessons: ${lessons.length}`);
for (const [track, expected] of Object.entries(EXPECTED_TRACK_COUNTS)) {
  const actual = lessons.filter((lesson) => lesson.track === track).length;
  console.log(`${track}: ${actual} / ${expected}`);
}
console.log(`Docs refs: ${unique(lessons.flatMap((lesson) => lesson.docsRefs.map((ref) => ref.href))).length} unique`);
console.log(`Tips: ${lessons.flatMap((lesson) => lesson.tips).length}`);
console.log(`Challenges: ${lessons.filter((lesson) => lesson.challenge).length}`);
console.log(`Errors: ${errors.length}`);

if (errors.length) {
  console.log('\nContract violations:');
  errors.forEach((error) => console.log(`- ${error}`));
  process.exitCode = 1;
}

function auditLessonCount(allLessons, output) {
  const expectedTotal = Object.values(EXPECTED_TRACK_COUNTS).reduce((sum, count) => sum + count, 0);
  if (allLessons.length !== expectedTotal) {
    output.push(`expected ${expectedTotal} lessons, found ${allLessons.length}`);
  }

  for (const [track, expected] of Object.entries(EXPECTED_TRACK_COUNTS)) {
    const trackLessons = allLessons.filter((lesson) => lesson.track === track);
    if (trackLessons.length !== expected) {
      output.push(`expected ${expected} ${track} lessons, found ${trackLessons.length}`);
    }

    const orders = trackLessons.map((lesson) => lesson.order).sort((a, b) => a - b);
    for (let index = 0; index < orders.length; index += 1) {
      if (orders[index] !== index + 1) {
        output.push(`${track} lessons must be ordered 1..${trackLessons.length}`);
        break;
      }
    }
  }
}

function auditLessonContract(allLessons, output) {
  for (const lesson of allLessons) {
    const label = lesson.slug ?? '<missing slug>';
    requireText(lesson.title, `${label} title`, output);
    requireText(lesson.featureFamily, `${label} featureFamily`, output);
    requireText(lesson.efficiencyHabit, `${label} efficiencyHabit`, output);
    requireText(lesson.context, `${label} context`, output, 20);
    requireText(lesson.concept, `${label} concept`, output, 20);

    if (!Array.isArray(lesson.docsRefs) || lesson.docsRefs.length < 1) {
      output.push(`${label} must reference at least one official doc`);
    } else {
      for (const ref of lesson.docsRefs) {
        requireText(ref.title, `${label} docsRef title`, output);
        if (!OFFICIAL_DOC_RE.test(ref.href ?? '')) output.push(`${label} has non-official docsRef: ${ref.href}`);
      }
    }

    if (!Array.isArray(lesson.session) || lesson.session.length < 1) {
      output.push(`${label} must include a guided session`);
    } else {
      const kinds = new Set(lesson.session.map((line) => line.kind));
      if (!kinds.has('prompt')) output.push(`${label} session must include a learner prompt`);
      if (![...kinds].some((kind) => ['tool', 'reply', 'good', 'out'].includes(kind))) {
        output.push(`${label} session must show a concrete action or result`);
      }
      if (!lesson.session.some((line) => line.kind === 'impact' && Number(line.savedTokens) > 0)) {
        output.push(`${label} session must include a positive impact line`);
      }
    }

    if (!lesson.check || !Array.isArray(lesson.check.options)) {
      output.push(`${label} must include a check`);
    } else if (lesson.check.options.filter((option) => option.correct === true).length !== 1) {
      output.push(`${label} check must have exactly one correct option`);
    }

    if (!Array.isArray(lesson.tips) || lesson.tips.length !== 3) {
      output.push(`${label} must include exactly three token-efficiency tips`);
    } else {
      const signatures = lesson.tips.filter((tip) => tip.kind === 'signature');
      if (signatures.length !== 1) output.push(`${label} must include exactly one signature tip`);
      for (const tip of lesson.tips) {
        requireText(tip.id, `${label} tip id`, output);
        requireText(tip.title, `${label} tip title`, output);
        requireText(tip.detail, `${label} tip detail`, output);
        if (!(Number(tip.savedTokens) > 0)) output.push(`${label} tip ${tip.id} must save positive tokens`);
      }
    }
  }
}

function auditChallengeCoverage(allLessons, output) {
  for (const lesson of allLessons) {
    const challengeRequired =
      REQUIRED_BEGINNER_CHALLENGES.has(lesson.slug) || lesson.track === 'power-user' || lesson.track === 'team';
    if (!challengeRequired) continue;
    if (!lesson.challenge) {
      output.push(`${lesson.slug} must include a type-it-yourself terminal challenge`);
      continue;
    }
    requireText(lesson.challenge.intro, `${lesson.slug} challenge intro`, output);
    requireText(lesson.challenge.prompt, `${lesson.slug} challenge prompt`, output);
    requireText(lesson.challenge.hint, `${lesson.slug} challenge hint`, output);
    requireText(lesson.challenge.incorrect, `${lesson.slug} challenge incorrect feedback`, output);
    if (!Array.isArray(lesson.challenge.accepted) || lesson.challenge.accepted.length < 1) {
      output.push(`${lesson.slug} challenge must accept at least one command`);
    }
    if (!Array.isArray(lesson.challenge.success) || !lesson.challenge.success.some((line) => line.kind === 'impact')) {
      output.push(`${lesson.slug} challenge success must include an impact line`);
    }
  }
}

function auditUniqueIds(allLessons, output) {
  const lessonSlugs = allLessons.map((lesson) => lesson.slug);
  const duplicateSlugs = duplicates(lessonSlugs);
  duplicateSlugs.forEach((slug) => output.push(`duplicate lesson slug: ${slug}`));

  const tipIds = allLessons.flatMap((lesson) => lesson.tips.map((tip) => tip.id));
  const duplicateTips = duplicates(tipIds);
  duplicateTips.forEach((tipId) => output.push(`duplicate tip id: ${tipId}`));
}

function auditCopyCharacters(allLessons, output) {
  for (const lesson of allLessons) {
    const strings = collectStrings(lesson);
    for (const value of strings) {
      if (value.includes('—')) output.push(`${lesson.slug} contains an em dash: ${value}`);
      if (value.includes('--')) output.push(`${lesson.slug} contains double hyphen copy: ${value}`);
    }
  }
}

function requireText(value, label, output, minLength = 1) {
  if (typeof value !== 'string' || value.trim().length < minLength) {
    output.push(`${label} must be at least ${minLength} characters`);
  }
}

function readLessons(file) {
  let lessonsArray;
  visit(file);
  if (!lessonsArray) throw new Error('Could not find LESSONS array in src/lib/lessons.ts');
  return lessonsArray.elements.map((element) => literalValue(element));

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'LESSONS' &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      lessonsArray = node.initializer;
      return;
    }
    ts.forEachChild(node, visit);
  }
}

function literalValue(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map((element) => literalValue(element));
  if (ts.isObjectLiteralExpression(node)) {
    const value = {};
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      value[propertyName(property.name)] = literalValue(property.initializer);
    }
    return value;
  }
  return undefined;
}

function propertyName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
  return name.getText(sourceFile);
}

function collectStrings(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap((item) => collectStrings(item));
  if (value && typeof value === 'object') return Object.values(value).flatMap((item) => collectStrings(item));
  return [];
}

function unique(values) {
  return [...new Set(values)];
}

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated].sort();
}
