import type { Config, RunList } from '../src/types';
import { setOutput } from '@actions/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setActionOutput } from '../src/output';

vi.mock('@actions/core', () => ({
  info: vi.fn(),
  setOutput: vi.fn(),
  summary: {
    addTable: vi.fn().mockReturnThis(),
    write: vi.fn().mockResolvedValue(undefined),
  },
}));

const mockedSetOutput = vi.mocked(setOutput);

const config: Config = {
  groups: [
    { environments: [], implies: [], name: 'frontend', paths: ['frontend'] },
    { environments: [], implies: [], name: 'backend', paths: ['rotkehlchen'] },
  ],
};

describe('setActionOutput', () => {
  beforeEach(() => {
    mockedSetOutput.mockClear();
  });

  // eslint-disable-next-line no-template-curly-in-string
  it('emits the string "true" for running groups so if-expressions are truthy', async () => {
    const needsToRun: RunList = { backend: false, frontend: true };

    await setActionOutput(config, needsToRun);

    expect(mockedSetOutput).toHaveBeenCalledWith('frontend_tasks', 'true');
  });

  it('emits an empty string (not "false") for skipped groups so if-expressions are falsy', async () => {
    const needsToRun: RunList = { backend: false, frontend: false };

    await setActionOutput(config, needsToRun);

    // GitHub Actions stringifies booleans, and the string "false" is truthy in
    // `if: ${{ X }}` expressions. Outputs for skipped groups must be empty.
    expect(mockedSetOutput).not.toHaveBeenCalledWith('frontend_tasks', false);
    expect(mockedSetOutput).not.toHaveBeenCalledWith('frontend_tasks', 'false');
    expect(mockedSetOutput).toHaveBeenCalledWith('frontend_tasks', '');
    expect(mockedSetOutput).toHaveBeenCalledWith('backend_tasks', '');
  });
});
