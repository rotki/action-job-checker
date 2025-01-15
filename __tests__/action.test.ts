import { expect, it } from 'vitest';
import { Tag, type Tags } from '../src/tags';
import { checkRequiredTasks } from '../src/action';
import type { IActionInputs } from '../src/input';
import type { RunList } from '../src/types';

function generateCommit(tag: Tags | '' = ''): string {
  const commitTag = tag ? `[${tag}]` : '';
  return `Test commit message
    
   ${commitTag}
    `;
}

function generateInputs(): IActionInputs {
  return {
    backendPaths: [],
    colibriPaths: [],
    documentationPaths: [],
    frontendPaths: [],
  };
}

it('[run e2e] will only run e2e', async () => {
  expect(
    await checkRequiredTasks(generateCommit(Tag.RUN_E2E), generateInputs()),
  ).toMatchObject({
    backend: false,
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
    docs: false,
    e2e: false,
    frontend: false,
  } satisfies RunList);
});
