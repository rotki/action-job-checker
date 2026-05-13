import type { IActionInputs } from '../src/input';
import type { Config, RunList } from '../src/types';
import { describe, expect, it, vi } from 'vitest';
import { checkRequiredTasks } from '../src/action';
import { hasLabel, isLabelEvent, isSkipLabelChanged } from '../src/labels';
import { Tag } from '../src/tags';

vi.mock('@actions/core', () => ({
  getInput: vi.fn().mockImplementation((name) => {
    if (name === 'token')
      return 'mock-token';
    return '';
  }),
  info: vi.fn(),
  setOutput: vi.fn(),
}));

vi.mock('@actions/github', () => {
  const mockOctokit = {
    paginate: {
      iterator: vi.fn().mockImplementation(function* () {}),
    },
    rest: {
      issues: {
        listLabelsOnIssue: vi.fn().mockResolvedValue({ data: [] }),
      },
      pulls: {
        listFiles: vi.fn(),
      },
    },
  };

  return {
    context: {
      payload: {
        action: '',
        label: { name: '' },
        pull_request: { number: 123 },
      },
      repo: { owner: 'mock-owner', repo: 'mock-repo' },
    },
    getOctokit: vi.fn().mockReturnValue(mockOctokit),
  };
});

vi.mock('../src/changes', () => ({
  changeDetected: vi.fn().mockReturnValue(false),
  checkForChanges: vi.fn().mockImplementation(async (check: (files: string[] | null) => void) => {
    check(null);
  }),
}));

vi.mock('../src/labels', () => ({
  hasLabel: vi.fn().mockResolvedValue(false),
  isLabelEvent: vi.fn().mockReturnValue(false),
  isSkipLabelChanged: vi.fn().mockReturnValue(false),
}));

const mockedHasLabel = vi.mocked(hasLabel);
const mockedIsLabelEvent = vi.mocked(isLabelEvent);
const mockedIsSkipLabelChanged = vi.mocked(isSkipLabelChanged);

function generateCommit(tag: string | '' = ''): string {
  const commitTag = tag ? `[${tag}]` : '';
  return `Test commit message\n\n   ${commitTag}\n    `;
}

const config: Config = {
  groups: [
    { environments: [], implies: ['e2e'], name: 'frontend', paths: ['frontend/app'], runTag: 'run frontend' },
    { environments: [], implies: [], name: 'e2e', paths: [], runTag: 'run e2e' },
    {
      environments: [
        { tag: 'run nft py tests', value: 'nfts' },
        { tag: 'run all py tests', value: 'nightly' },
      ],
      implies: [],
      name: 'backend',
      paths: ['rotkehlchen'],
      runTag: 'run backend',
      skipTag: 'skip py tests',
    },
    { environments: [], implies: [], name: 'docs', paths: ['docs'] },
  ],
};

function inputs(skipLabel = 'skip ci'): IActionInputs {
  return { config, skipLabel };
}

describe('checkRequiredTasks', () => {
  it('[run all] runs every group', async () => {
    expect(await checkRequiredTasks(generateCommit(Tag.RUN_ALL), inputs())).toMatchObject<RunList>({
      backend: true,
      docs: true,
      e2e: true,
      frontend: true,
    });
  });

  it('[skip ci] runs nothing', async () => {
    expect(await checkRequiredTasks(generateCommit(Tag.SKIP_CI), inputs())).toMatchObject<RunList>({
      backend: false,
      docs: false,
      e2e: false,
      frontend: false,
    });
  });

  it('[ci skip] runs nothing', async () => {
    expect(await checkRequiredTasks(generateCommit(Tag.CI_SKIP), inputs())).toMatchObject<RunList>({
      backend: false,
      docs: false,
      e2e: false,
      frontend: false,
    });
  });

  it('group run_tag triggers only that group', async () => {
    expect(await checkRequiredTasks(generateCommit('run e2e'), inputs())).toMatchObject<RunList>({
      backend: false,
      docs: false,
      e2e: true,
      frontend: false,
    });
  });

  it('group run_tag applies implies', async () => {
    expect(await checkRequiredTasks(generateCommit('run frontend'), inputs())).toMatchObject<RunList>({
      backend: false,
      docs: false,
      e2e: true,
      frontend: true,
    });
  });

  it('custom run_tag for backend runs only backend', async () => {
    expect(await checkRequiredTasks(generateCommit('run backend'), inputs())).toMatchObject<RunList>({
      backend: true,
      docs: false,
      e2e: false,
      frontend: false,
    });
  });

  it('pr with skip label runs nothing', async () => {
    mockedHasLabel.mockResolvedValueOnce(true);
    expect(await checkRequiredTasks(generateCommit(), inputs('custom skip'))).toMatchObject<RunList>({
      backend: false,
      docs: false,
      e2e: false,
      frontend: false,
    });
    expect(mockedHasLabel).toHaveBeenCalledWith('custom skip');
  });

  it('label event that is not skip label runs nothing', async () => {
    mockedIsLabelEvent.mockReturnValueOnce(true);
    mockedIsSkipLabelChanged.mockReturnValueOnce(false);
    expect(await checkRequiredTasks(generateCommit(), inputs())).toMatchObject<RunList>({
      backend: false,
      docs: false,
      e2e: false,
      frontend: false,
    });
  });

  it('label event for skip label proceeds to change detection (no PR files => run all)', async () => {
    mockedIsLabelEvent.mockReturnValueOnce(true);
    mockedIsSkipLabelChanged.mockReturnValueOnce(true);
    expect(await checkRequiredTasks(generateCommit(), inputs())).toMatchObject<RunList>({
      backend: true,
      docs: true,
      e2e: true,
      frontend: true,
    });
  });

  it('skip_tag turns off a group that would otherwise run', async () => {
    expect(
      await checkRequiredTasks(`${generateCommit('skip py tests')}\n[run all]`, inputs()),
    ).toMatchObject<RunList>({
      backend: false,
      docs: true,
      e2e: true,
      frontend: true,
    });
  });
});
