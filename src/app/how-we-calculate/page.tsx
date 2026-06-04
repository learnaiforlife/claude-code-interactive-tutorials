import Link from 'next/link';
import { IMPACT_ECO, IMPACT_PRICING } from '@/lib/impact';

export default function HowWeCalculate() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-[calc(100vh-2.6rem)] bg-paper px-6 py-14 text-ink">
      <article className="mx-auto max-w-3xl">
        <Link href="/" className="font-mono text-xs text-info hover:text-ink">
          Back to track
        </Link>
        <h1 className="mt-6 text-balance text-3xl font-bold tracking-tight">How we calculate impact</h1>
        <p className="mt-4 max-w-[68ch] leading-relaxed text-ink-soft">
          These numbers are estimates for teaching, not metered data from your Claude Code session.
          Cost is exact for the stated pricing assumption. Environmental figures are shown as ranges
          because model size, hardware, data center cooling, grid mix, and prompt shape all vary.
        </p>

        <section className="mt-10 border-t border-line-soft pt-7">
          <h2 className="text-xl font-semibold tracking-tight">Cost</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            We price saved tokens as avoided standard Claude Sonnet input/context tokens at{' '}
            <span className="font-mono text-ink">${IMPACT_PRICING.usdPerMillionTokens} / million tokens</span>.
            The beginner lessons mostly save repeated context, history, file dumps, and tool schemas, so input
            pricing is the conservative assumption. Output-heavy savings would cost more.
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            Source:{' '}
            <a className="text-info hover:text-ink" href="https://platform.claude.com/docs/en/about-claude/pricing">
              Anthropic Claude API pricing
            </a>
          </p>
        </section>

        <section className="mt-8 border-t border-line-soft pt-7">
          <h2 className="text-xl font-semibold tracking-tight">Environmental ranges</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            We convert saved tokens into query-equivalents using{' '}
            <span className="font-mono text-ink">{IMPACT_ECO.assumedTokensPerQuery.toLocaleString()} tokens = 1 query</span>.
            Then we apply prompt-level ranges: energy{' '}
            <span className="font-mono text-ink">{IMPACT_ECO.whPerQueryLo}-{IMPACT_ECO.whPerQueryHi} Wh</span>,
            water <span className="font-mono text-ink">{IMPACT_ECO.mlPerQueryLo}-{IMPACT_ECO.mlPerQueryHi} mL</span>,
            and CO2e <span className="font-mono text-ink">{IMPACT_ECO.co2GPerQueryLo}-{IMPACT_ECO.co2GPerQueryHi} g</span>.
          </p>
          <p className="mt-3 leading-relaxed text-ink-soft">
            The low end tracks recent disclosed median text-prompt estimates. The high end leaves room for
            larger coding-agent turns and broader accounting. We widen instead of pretending every token has
            the same physical footprint.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            <li>
              <a className="text-info hover:text-ink" href="https://www.datacenterdynamics.com/en/news/sam-altman-chatgpt-queries-consume-034-watt-hours-of-electricity-and-0000085-gallons-of-water/">
                Data Center Dynamics on OpenAI query energy and water figures
              </a>
            </li>
            <li>
              <a className="text-info hover:text-ink" href="https://www.ainews.com/p/google-reveals-energy-and-water-use-of-gemini-ai-prompts">
                AI News summary of Google Gemini prompt energy, water, and CO2e figures
              </a>
            </li>
            <li>
              <a className="text-info hover:text-ink" href="https://synapsesocial.com/papers/69c229a5aeb5a845df0d4659">
                Synapse Social paper on marginal energy and water cost of AI inference
              </a>
            </li>
            <li>
              <a className="text-info hover:text-ink" href="https://www.epa.gov/egrid">
                EPA eGRID electricity emissions database for grid-carbon context
              </a>
            </li>
          </ul>
        </section>

        <section className="mt-8 border-t border-line-soft pt-7">
          <h2 className="text-xl font-semibold tracking-tight">Cascade</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            Per use shows one habit once. Daily habit multiplies by 2,500 uses per year. Team of 20 multiplies
            by 50,000 uses per year. The point is not that every team behaves exactly this way. The point is
            that small prompt habits become real budgets when repeated.
          </p>
        </section>
      </article>
    </main>
  );
}
