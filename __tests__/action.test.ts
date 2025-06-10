import type { IActionInputs } from '../src/input';
import type { RunList } from '../src/types';
import { expect, it, vi } from 'vitest';
import { checkRequiredTasks } from '../src/action';
import { hasLabel, isLabelEvent, isSkipLabelChanged } from '../src/labels';
import { Tag, type Tags } from '../src/tags';

vi.mock('@actions/core', () => ({
  getInput: vi.fn().mockImplementation((name) => {
    if (name === 'token')
      return 'mock-token';
    return '';
  }),
  info: vi.fn(),
}));

vi.mock('@actions/github', () => {
  const mockOctokit = {
    paginate: {
      iterator: vi.fn().mockImplementation(function* () {
        // Not yielding anything will cause the check function to be called with null
      }),
    },
    rest: {
      issues: {
        listLabelsOnIssue: vi.fn().mockResolvedValue({
          data: [],
        }),
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
        label: {
          name: '',
        },
        pull_request: {
          number: 123,
        },
      },
      repo: {
        owner: 'mock-owner',
        repo: 'mock-repo',
      },
    },
    getOctokit: vi.fn().mockReturnValue(mockOctokit),
  };
});

vi.mock('../src/labels', () => ({
  hasLabel: vi.fn().mockResolvedValue(false),
  isLabelEvent: vi.fn().mockReturnValue(false),
  isSkipLabelChanged: vi.fn().mockReturnValue(false),
}));

const mockedHasLabel = hasLabel as unknown as ReturnType<typeof vi.fn>;
const mockedIsLabelEvent = isLabelEvent as unknown as ReturnType<typeof vi.fn>;
const mockedIsSkipLabelChanged = isSkipLabelChanged as unknown as ReturnType<typeof vi.fn>;

function generateCommit(tag: Tags | '' = ''): string {
  const commitTag = tag ? `[${tag}]` : '';
  return `Test commit message

   ${commitTag}
    `;
}

function generateInputs(skipLabel = 'skip ci'): IActionInputs {
  return {
    backendPaths: [],
    colibriPaths: [],
    documentationPaths: [],
    frontendPaths: [],
    skipLabel,
  };
}

it('[run e2e] will only run e2e', async () => {
  expect(
    await checkRequiredTasks(generateCommit(Tag.RUN_E2E), generateInputs()),
  ).toMatchObject({
    backend: false,
    colibri: false,
    docs: false,
    e2e: true,
    frontend: false,
  } satisfies RunList);
});

it('[run all] will only run all tasks', async () => {
  expect(
    await checkRequiredTasks(generateCommit(Tag.RUN_ALL), generateInputs()),
  ).toMatchObject({
    backend: true,
    colibri: true,
    docs: true,
    e2e: true,
    frontend: true,
  } satisfies RunList);
});

it('[run frontend] will only run frontend tasks', async () => {
  expect(
    await checkRequiredTasks(
      generateCommit(Tag.RUN_FRONTEND),
      generateInputs(),
    ),
  ).toMatchObject({
    backend: false,
    colibri: false,
    docs: false,
    e2e: true,
    frontend: true,
  } satisfies RunList);
});

it('[skip ci] will only run nothing', async () => {
  expect(
    await checkRequiredTasks(generateCommit(Tag.SKIP_CI), generateInputs()),
  ).toMatchObject({
    backend: false,
    colibri: false,
    docs: false,
    e2e: false,
    frontend: false,
  } satisfies RunList);
});

it('[ci skip] will only run nothing', async () => {
  expect(
    await checkRequiredTasks(generateCommit(Tag.CI_SKIP), generateInputs()),
  ).toMatchObject({
    backend: false,
    colibri: false,
    docs: false,
    e2e: false,
    frontend: false,
  } satisfies RunList);
});

it('pr with skip label will run nothing', async () => {
  mockedHasLabel.mockResolvedValueOnce(true);

  expect(
    await checkRequiredTasks(generateCommit(), generateInputs('custom skip label')),
  ).toMatchObject({
    backend: false,
    colibri: false,
    docs: false,
    e2e: false,
    frontend: false,
  } satisfies RunList);

  expect(mockedHasLabel).toHaveBeenCalledWith('custom skip label');
});

it('label event that is not skip label will run nothing', async () => {
  mockedIsLabelEvent.mockReturnValueOnce(true);
  mockedIsSkipLabelChanged.mockReturnValueOnce(false);

  expect(
    await checkRequiredTasks(generateCommit(), generateInputs('custom skip label')),
  ).toMatchObject({
    backend: false,
    colibri: false,
    docs: false,
    e2e: false,
    frontend: false,
  } satisfies RunList);

  expect(mockedIsLabelEvent).toHaveBeenCalled();
  expect(mockedIsSkipLabelChanged).toHaveBeenCalledWith('custom skip label');
});

it('label event that is skip label will check for changes', async () => {
  mockedIsLabelEvent.mockReturnValueOnce(true);
  mockedIsSkipLabelChanged.mockReturnValueOnce(true);

  vi.mock('../src/changes', () => ({
    changeDetected: vi.fn().mockReturnValue(true),
    checkForChanges: vi.fn().mockImplementation((check) => {
      check(null);
    }),
  }));

  expect(
    await checkRequiredTasks(generateCommit(), generateInputs('custom skip label')),
  ).toMatchObject({
    backend: true,
    colibri: true,
    docs: true,
    e2e: true,
    frontend: true,
  } satisfies RunList);

  expect(mockedIsLabelEvent).toHaveBeenCalled();
  expect(mockedIsSkipLabelChanged).toHaveBeenCalledWith('custom skip label');
});
