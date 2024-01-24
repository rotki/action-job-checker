import { expect, it } from 'vitest';
import { changeDetected } from '../src/changes';

it('a file matches', () => {
  const monitored = ['rotkehlchen', 'requirements.txt'];
  const changed = ['requirements.txt'];
  expect(changeDetected(monitored, changed)).toBe(true);
});

it('a path matches', () => {
  const monitored = ['rotkehlchen', 'requirements.txt'];
  const changed = ['rotkehlchen/args.py'];
  expect(changeDetected(monitored, changed)).toBe(true);
});

it('nothing matches', () => {
  const monitored = ['rotkehlchen', 'requirements.txt'];
  const changed = ['docs'];
  expect(changeDetected(monitored, changed)).toBe(false);
});
