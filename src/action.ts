import { info } from '@actions/core';
import { type IActionInputs } from './input';
import { type RunList } from './types';
import { useCheckForTag } from './commit';
import { Tag } from './tags';
import { changeDetected, checkForChanges } from './changes';

export async function checkRequiredTasks(
  commitMessage: string | null,
  inputs: IActionInputs,
): Promise<RunList> {
  const needsToRun: RunList = {
    frontend: false,
    e2e: false,
    backend: false,
    docs: false,
  };

  const checkForTag = useCheckForTag(commitMessage);

  if (checkForTag(Tag.RUN_ALL)) {
    needsToRun.frontend = true;
    needsToRun.backend = true;
    needsToRun.e2e = true;
    needsToRun.docs = true;
    info(`[${Tag.RUN_ALL}] detected, running all tasks`);
  } else if (checkForTag(Tag.SKIP_CI) || checkForTag(Tag.CI_SKIP)) {
    info(`[${Tag.SKIP_CI}] or [${Tag.CI_SKIP}] detected, skipping all tasks`);
  } else if (checkForTag(Tag.RUN_E2E)) {
    info(`[${Tag.RUN_E2E}] detected, running e2e`);
    needsToRun.e2e = true;
  } else if (checkForTag(Tag.RUN_FRONTEND)) {
    info(`[${Tag.RUN_FRONTEND}] detected, running frontend tasks`);
    needsToRun.e2e = true;
    needsToRun.frontend = true;
  } else {
    await checkForChanges((files) => {
      if (files === null) {
        needsToRun.frontend = true;
        needsToRun.e2e = true;
        needsToRun.backend = true;
        needsToRun.docs = true;
      } else {
        info(`Checking ${files.length} files of the PR for changes`);
        if (changeDetected(inputs.frontendPaths, files)) {
          needsToRun.frontend = true;
          needsToRun.e2e = true;
        }
        if (changeDetected(inputs.backendPaths, files)) {
          needsToRun.backend = true;
        }
        if (changeDetected(inputs.documentationPaths, files)) {
          needsToRun.docs = true;
        }
      }
    });
  }
  return needsToRun;
}
