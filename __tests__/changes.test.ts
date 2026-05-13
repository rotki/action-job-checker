import { describe, expect, it } from 'vitest';
import { changeDetected } from '../src/changes';

describe('changeDetected', () => {
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

  it('"./" matches any change', () => {
    expect(changeDetected(['./'], ['src/foo.ts'])).toBe(true);
    expect(changeDetected(['.'], ['README.md'])).toBe(true);
    expect(changeDetected(['./'], [])).toBe(false);
  });

  it('strips leading "./" from monitored paths', () => {
    expect(changeDetected(['./src'], ['src/foo.ts'])).toBe(true);
    expect(changeDetected(['./src'], ['other/foo.ts'])).toBe(false);
  });

  it('prefix requires a path boundary', () => {
    expect(changeDetected(['src'], ['srcOther/foo.ts'])).toBe(false);
    expect(changeDetected(['src'], ['src/foo.ts'])).toBe(true);
  });

  it('no match against empty file list', () => {
    expect(changeDetected(['src'], [])).toBe(false);
    expect(changeDetected([], ['src/foo.ts'])).toBe(false);
    expect(changeDetected([], [])).toBe(false);
  });

  it('trailing slash on monitored path is normalized', () => {
    expect(changeDetected(['src/'], ['src/foo.ts'])).toBe(true);
    expect(changeDetected(['src//'], ['src/foo.ts'])).toBe(true);
    expect(changeDetected(['src/'], ['srcOther/foo.ts'])).toBe(false);
  });

  it('handles multiple leading "./" segments without overreaching', () => {
    expect(changeDetected(['.//src'], ['src/foo.ts'])).toBe(true);
    expect(changeDetected(['./'], ['anything.txt'])).toBe(true);
  });

  it('does not treat ".." as match-all (no path traversal escape)', () => {
    expect(changeDetected(['..'], ['src/foo.ts'])).toBe(false);
    expect(changeDetected(['../etc'], ['etc/passwd'])).toBe(false);
  });

  it('substring without path boundary does not match', () => {
    expect(changeDetected(['doc'], ['docs/readme.md'])).toBe(false);
    expect(changeDetected(['src/a'], ['src/abc.ts'])).toBe(false);
    expect(changeDetected(['src/a'], ['src/a/file.ts'])).toBe(true);
    expect(changeDetected(['src/a'], ['src/a'])).toBe(true);
  });

  it('is case-sensitive', () => {
    expect(changeDetected(['Src'], ['src/foo.ts'])).toBe(false);
    expect(changeDetected(['src'], ['SRC/foo.ts'])).toBe(false);
  });

  it('handles pathological inputs without catastrophic backtracking', () => {
    const longDotSlashes = `${'./'.repeat(10000)}src`;
    const start = Date.now();
    expect(changeDetected([longDotSlashes], ['src/foo.ts'])).toBe(true);
    expect(Date.now() - start).toBeLessThan(1000);
  });

  it('does not crash on unusual but valid string inputs', () => {
    expect(changeDetected([' '], ['src/foo.ts'])).toBe(false);
    expect(changeDetected(['src'], [' src/foo.ts'])).toBe(false);
    expect(changeDetected(['src\0evil'], ['src/foo.ts'])).toBe(false);
  });
});
