import { describe, expect, it } from 'vitest';
import { parseConfig } from '../src/config';

describe('parseConfig', () => {
  it('parses a minimal valid config', () => {
    const cfg = parseConfig(`
groups:
  - name: backend
    paths:
      - rotkehlchen
`);
    expect(cfg.groups).toHaveLength(1);
    expect(cfg.groups[0]).toMatchObject({
      environments: [],
      implies: [],
      name: 'backend',
      paths: ['rotkehlchen'],
      runTag: undefined,
      skipTag: undefined,
    });
  });

  it('parses run_tag, skip_tag, implies and environments', () => {
    const cfg = parseConfig(`
groups:
  - name: frontend
    paths: [frontend/app]
    run_tag: run frontend
    implies: [e2e]
  - name: e2e
    run_tag: run e2e
  - name: backend
    paths: [rotkehlchen]
    run_tag: run backend
    skip_tag: skip py tests
    environments:
      - tag: run nft py tests
        value: nfts
      - tag: run all py tests
        value: nightly
`);
    expect(cfg.groups.map(g => g.name)).toEqual(['frontend', 'e2e', 'backend']);
    expect(cfg.groups[0].implies).toEqual(['e2e']);
    expect(cfg.groups[2].environments).toEqual([
      { tag: 'run nft py tests', value: 'nfts' },
      { tag: 'run all py tests', value: 'nightly' },
    ]);
    expect(cfg.groups[2].skipTag).toBe('skip py tests');
    expect(cfg.groups[2].runTag).toBe('run backend');
  });

  it('rejects empty groups', () => {
    expect(() => parseConfig('groups: []')).toThrow(/fewer than 1 items/);
  });

  it('rejects duplicate group names', () => {
    expect(() => parseConfig(`
groups:
  - name: a
    paths: [x]
  - name: a
    paths: [y]
`)).toThrow(/duplicate group name: a/);
  });

  it('rejects implies referencing unknown groups', () => {
    expect(() => parseConfig(`
groups:
  - name: a
    paths: [x]
    implies: [missing]
`)).toThrow(/implies unknown group "missing"/);
  });

  it('rejects bad group names', () => {
    expect(() => parseConfig(`
groups:
  - name: With-Dash
    paths: [x]
`)).toThrow(/pattern/);
  });
});
