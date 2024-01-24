import { setFailed } from '@actions/core';
import { ActionInputs } from './input';
import { getCommitMessage } from './commit';
import { setActionOutput } from './output';
import { usePyTestTagCheck } from './backend-tags';
import { checkRequiredTasks } from './action';

async function run(): Promise<void> {
  try {
    const inputs = new ActionInputs();
    const commitMessage = await getCommitMessage();
    const needsToRun = await checkRequiredTasks(commitMessage, inputs);
    const checkPyTestTags = usePyTestTagCheck(commitMessage, needsToRun);
    checkPyTestTags();
    await setActionOutput(needsToRun);
  }
  catch (error) {
    if (error instanceof Error)
      setFailed(error.message);
    else
      setFailed('unknown error');
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises, unicorn/prefer-top-level-await
run();
