import { Tag, Tags } from '../src/tags';
import { IActionInputs } from '../src/input';
import { checkRequiredTasks } from '../src/action';
import { RunList } from '../src/types';

const generateCommit = (tag: Tags | '' = ''): string => {
  const commitTag = tag ? `[${tag}]` : '';
  return `Test commit message
    
   ${commitTag}
    `;
};

const generateInputs = (): IActionInputs => ({
  frontendPaths: [],
  backendPaths: [],
  documentationPaths: [],
});

test('[run e2e] will only run e2e', async () => {
  expect(
    await checkRequiredTasks(generateCommit(Tag.RUN_E2E), generateInputs())
  ).toMatchObject({
    frontend: false,
    e2e: true,
    backend: false,
    docs: false,
  } satisfies RunList);
});

test('[run all] will only run all tasks', async () => {
  expect(
    await checkRequiredTasks(generateCommit(Tag.RUN_ALL), generateInputs())
  ).toMatchObject({
    frontend: true,
    e2e: true,
    backend: true,
    docs: true,
  } satisfies RunList);
});

test('[run frontend] will only run frontend tasks', async () => {
  expect(
    await checkRequiredTasks(generateCommit(Tag.RUN_FRONTEND), generateInputs())
  ).toMatchObject({
    frontend: true,
    e2e: true,
    backend: false,
    docs: false,
  } satisfies RunList);
});

test('[skip ci] will only run nothing', async () => {
  expect(
    await checkRequiredTasks(generateCommit(Tag.SKIP_CI), generateInputs())
  ).toMatchObject({
    frontend: false,
    e2e: false,
    backend: false,
    docs: false,
  } satisfies RunList);
});

test('[ci skip] will only run nothing', async () => {
  expect(
    await checkRequiredTasks(generateCommit(Tag.CI_SKIP), generateInputs())
  ).toMatchObject({
    frontend: false,
    e2e: false,
    backend: false,
    docs: false,
  } satisfies RunList);
});
