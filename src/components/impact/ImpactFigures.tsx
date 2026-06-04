import Link from 'next/link';
import type { EcoImpact } from '@/lib/impact';

const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const wholeNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const smallMoney = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

export function formatTokens(tokens: number): string {
  return wholeNumber.format(Math.round(tokens));
}

export function formatCost(value: number): string {
  if (value > 0 && value < 0.01) return smallMoney.format(value);
  return money.format(value);
}

export function formatRange(lo: number, hi: number, unit: string): string {
  const format = hi >= 100 ? wholeNumber : number;
  return `~${format.format(lo)}-${format.format(hi)} ${unit}`;
}

export function ImpactMetricGrid({ costUsd, eco }: { costUsd: number; eco: EcoImpact }) {
  return (
    <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2 sm:grid-cols-4">
      <Metric label="Cost" value={formatCost(costUsd)} tone="text-success" />
      <Metric label="Energy" value={formatRange(eco.whLo, eco.whHi, 'Wh')} tone="text-command" />
      <Metric label="Water" value={formatRange(eco.mlLo, eco.mlHi, 'mL')} tone="text-info" />
      <Metric label="CO2e" value={formatRange(eco.co2Lo, eco.co2Hi, 'g')} tone="text-success" />
    </div>
  );
}

export function MethodologyLink({ className = '' }: { className?: string }) {
  return (
    <Link href="/how-we-calculate" className={`inline-block shrink-0 font-mono text-xs text-info hover:text-ink ${className}`}>
      How we calculate this
    </Link>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-lg border border-line-soft bg-paper px-3 py-2">
      <div className="font-mono text-[0.68rem] text-ink-soft">{label}</div>
      <div className={`mt-1 font-mono text-sm font-semibold tabular-nums ${tone}`}>{value}</div>
    </div>
  );
}
