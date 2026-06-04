import { readFile } from 'node:fs/promises';
import process from 'node:process';

const INDEX_URL = 'https://code.claude.com/docs/llms.txt';
const DOC_URL_PATTERN = /https:\/\/code\.claude\.com\/docs\/en\/[^\s)]+\.md/g;
const LESSON_REF_PATTERN = /href:\s*'([^']+)'/g;

async function main() {
  const [indexResponse, lessonSource] = await Promise.all([
    fetch(INDEX_URL),
    readFile(new URL('../src/lib/lessons.ts', import.meta.url), 'utf8'),
  ]);

  if (!indexResponse.ok) {
    throw new Error(`Failed to fetch ${INDEX_URL}: ${indexResponse.status} ${indexResponse.statusText}`);
  }

  const indexText = await indexResponse.text();
  const liveUrls = uniqueMatches(indexText, DOC_URL_PATTERN);
  const lessonUrls = uniqueMatches(lessonSource, LESSON_REF_PATTERN, 1);
  const missing = liveUrls.filter((url) => !lessonUrls.includes(url));
  const stale = lessonUrls.filter((url) => !liveUrls.includes(url));

  console.log(`Claude Code docs coverage audit`);
  console.log(`Live docs index: ${liveUrls.length} unique pages`);
  console.log(`Lesson docsRefs: ${lessonUrls.length} unique pages`);
  console.log(`Missing from lessons: ${missing.length}`);
  console.log(`Stale lesson refs: ${stale.length}`);

  if (missing.length) {
    console.log(`\nMissing official docs:`);
    missing.forEach((url) => console.log(`- ${url}`));
  }

  if (stale.length) {
    console.log(`\nStale lesson refs:`);
    stale.forEach((url) => console.log(`- ${url}`));
  }

  if (missing.length || stale.length) {
    process.exitCode = 1;
  }
}

function uniqueMatches(text, pattern, group = 0) {
  return [...new Set([...text.matchAll(pattern)].map((match) => match[group]))].sort();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
