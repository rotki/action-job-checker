import { setFailed } from '@actions/core';
import { checkRequiredTasks } from './action';
import { usePyTestTagCheck } from './backend-tags';
import { getCommitMessage } from './commit';
import { ActionInputs } from './input';
import { setActionOutput } from './output';

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
