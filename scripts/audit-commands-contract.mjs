import { readFile } from 'node:fs/promises';
import process from 'node:process';
import ts from 'typescript';

const COMMANDS_URL = new URL('../src/lib/commands.ts', import.meta.url);
const OFFICIAL_DOC_RE = /^https:\/\/code\.claude\.com\/docs\/en\/.+\.md$/;
const EXPECTED_GROUP_COUNT = 5;
const CATEGORIES = new Set([
  'setup-config',
  'context-session',
  'planning-work',
  'review-ship',
  'recovery-debug',
]);

const sourceText = await readFile(COMMANDS_URL, 'utf8');
const sourceFile = ts.createSourceFile(COMMANDS_URL.pathname, sourceText, ts.ScriptTarget.Latest, true);
const groups = readArray(sourceFile, 'COMMAND_GROUPS');
const errors = [];

auditGroupCount(groups, errors);
auditGroupContract(groups, errors);
auditUniqueSlugs(groups, errors);
auditCopyCharacters(groups, errors);

console.log('Claude Code commands contract audit');
console.log(`Command groups: ${groups.length}`);
console.log(`Commands: ${groups.reduce((sum, g) => sum + (g.commands?.length ?? 0), 0)}`);
console.log(`Docs refs: ${unique(groups.flatMap((g) => (g.docsRefs ?? []).map((ref) => ref.href))).length} unique`);
console.log(`Challenges: ${groups.filter((g) => g.challenge).length}`);
console.log(`Errors: ${errors.length}`);

if (errors.length) {
  console.log('\nContract violations:');
  errors.forEach((error) => console.log(`- ${error}`));
  process.exitCode = 1;
}

function auditGroupCount(allGroups, output) {
  if (allGroups.length !== EXPECTED_GROUP_COUNT) {
    output.push(`expected ${EXPECTED_GROUP_COUNT} command groups, found ${allGroups.length}`);
  }
  const orders = allGroups.map((g) => g.order).sort((a, b) => a - b);
  for (let index = 0; index < orders.length; index += 1) {
    if (orders[index] !== index + 1) {
      output.push(`command groups must be ordered 1..${allGroups.length}`);
      break;
    }
  }
}

function auditGroupContract(allGroups, output) {
  for (const group of allGroups) {
    const label = group.slug ?? '<missing slug>';
    requireText(group.title, `${label} title`, output);
    requireText(group.categoryLabel, `${label} categoryLabel`, output);
    requireText(group.when, `${label} when`, output);
    requireText(group.efficiencyHabit, `${label} efficiencyHabit`, output);
    requireText(group.context, `${label} context`, output, 20);
    requireText(group.concept, `${label} concept`, output, 20);

    if (!CATEGORIES.has(group.category)) output.push(`${label} has unknown category: ${group.category}`);
    if (group.slug !== group.category) output.push(`${label} slug must equal its category`);

    if (!Array.isArray(group.commands) || group.commands.length < 1) {
      output.push(`${label} must list at least one command`);
    } else {
      for (const example of group.commands) {
        if (typeof example.command !== 'string' || !example.command.startsWith('/')) {
          output.push(`${label} command must start with /: ${example.command}`);
        }
        requireText(example.purpose, `${label} command purpose`, output);
        if (example.docsRef && !OFFICIAL_DOC_RE.test(example.docsRef.href ?? '')) {
          output.push(`${label} command docsRef is not official: ${example.docsRef.href}`);
        }
      }
    }

    if (!Array.isArray(group.session) || group.session.length < 1) {
      output.push(`${label} must include a guided session`);
    } else {
      const kinds = new Set(group.session.map((line) => line.kind));
      if (!kinds.has('prompt')) output.push(`${label} session must include a learner prompt`);
      if (![...kinds].some((kind) => ['tool', 'reply', 'good', 'out'].includes(kind))) {
        output.push(`${label} session must show a concrete action or result`);
      }
      const impacts = group.session.filter((line) => line.kind === 'impact' && Number(line.savedTokens) > 0);
      if (impacts.length !== 1) output.push(`${label} session must include exactly one positive impact line`);
    }

    if (!group.challenge) {
      output.push(`${label} must include a type-it-yourself terminal challenge`);
    } else {
      requireText(group.challenge.intro, `${label} challenge intro`, output);
      requireText(group.challenge.prompt, `${label} challenge prompt`, output);
      requireText(group.challenge.hint, `${label} challenge hint`, output);
      requireText(group.challenge.incorrect, `${label} challenge incorrect feedback`, output);
      if (!Array.isArray(group.challenge.accepted) || group.challenge.accepted.length < 1) {
        output.push(`${label} challenge must accept at least one command`);
      }
      if (!Array.isArray(group.challenge.success) || !group.challenge.success.some((line) => line.kind === 'impact')) {
        output.push(`${label} challenge success must include an impact line`);
      }
    }

    if (!group.check || !Array.isArray(group.check.options)) {
      output.push(`${label} must include a check`);
    } else if (group.check.options.filter((option) => option.correct === true).length !== 1) {
      output.push(`${label} check must have exactly one correct option`);
    }

    if (!Array.isArray(group.docsRefs) || group.docsRefs.length < 1) {
      output.push(`${label} must reference at least one official doc`);
    } else {
      for (const ref of group.docsRefs) {
        requireText(ref.title, `${label} docsRef title`, output);
        if (!OFFICIAL_DOC_RE.test(ref.href ?? '')) output.push(`${label} has non-official docsRef: ${ref.href}`);
      }
    }
  }
}

function auditUniqueSlugs(allGroups, output) {
  const dupes = duplicates(allGroups.map((g) => g.slug));
  dupes.forEach((slug) => output.push(`duplicate command group slug: ${slug}`));
}

function auditCopyCharacters(allGroups, output) {
  for (const group of allGroups) {
    for (const value of collectStrings(group)) {
      if (value.includes('—')) output.push(`${group.slug} contains an em dash: ${value}`);
      if (value.includes('--')) output.push(`${group.slug} contains double hyphen copy: ${value}`);
    }
  }
}

function requireText(value, label, output, minLength = 1) {
  if (typeof value !== 'string' || value.trim().length < minLength) {
    output.push(`${label} must be at least ${minLength} characters`);
  }
}

function readArray(file, name) {
  let found;
  visit(file);
  if (!found) throw new Error(`Could not find ${name} array in src/lib/commands.ts`);
  return found.elements.map((element) => literalValue(element));

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === name &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      found = node.initializer;
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
