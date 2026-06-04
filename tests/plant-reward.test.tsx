import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { test, expect, vi } from 'vitest';
import PlantReward from '@/components/impact/PlantReward';
import type { Tip } from '@/lib/types';

const tip: Tip = {
  id: 'plant-test',
  kind: 'signature',
  savedTokens: 3200,
  title: 'Search first',
  detail: 'Search before loading whole files.',
};

function mediaQueryList(matches: boolean) {
  return {
    matches,
    media: '',
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() { return false; },
  };
}

test('plant reward starts animated count-up at zero', () => {
  render(<PlantReward tip={tip} />);

  expect(screen.getByText('0')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /new tip growing into a plant/i })).toHaveClass('impact-plant');
});

test('plant reward renders the final value immediately under reduced motion', () => {
  vi.stubGlobal('matchMedia', () => mediaQueryList(true));

  render(<PlantReward tip={tip} />);

  expect(screen.getByText('3,200')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /new tip growing into a plant/i })).not.toHaveClass('impact-plant');
});

test('plant reward clamps an early animation frame at zero', () => {
  vi.useFakeTimers();
  let frames = 0;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    frames += 1;
    if (frames === 1) cb(performance.now() - 100);
    return frames;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

  render(<PlantReward tip={tip} />);

  act(() => vi.runOnlyPendingTimers());

  expect(screen.queryByText(/^-\d/)).not.toBeInTheDocument();
  expect(screen.getByText('0')).toBeInTheDocument();
  vi.useRealTimers();
});
