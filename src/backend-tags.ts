import { info, setOutput } from '@actions/core';
import { type CommitMessage, type RunList } from './types';
import { useCheckForTag } from './commit';
import { PyTag } from './tags';

const OUTPUT_TEST_ENVIRONMENT = 'test_environment';
const ENV_NFTS = 'nfts';
const ENV_NIGHTLY = 'nightly';

export const usePyTestTagCheck = (
  commitMessage: CommitMessage,
  needsToRun: RunList,
): (() => void) => {
  const checkForTag = useCheckForTag(commitMessage);
  return (): void => {
    if (checkForTag(PyTag.SKIP_PYTEST)) {
      info(`[${PyTag.SKIP_PYTEST}] detected skipping backend tests`);
      needsToRun.backend = false;
    } else if (checkForTag(PyTag.RUN_PY_NFT)) {
      setOutput(OUTPUT_TEST_ENVIRONMENT, ENV_NFTS);
      info(`[${PyTag.RUN_PY_NFT}] => ${OUTPUT_TEST_ENVIRONMENT}=${ENV_NFTS}`);
    } else if (checkForTag(PyTag.RUN_ALL_TEST)) {
      setOutput(OUTPUT_TEST_ENVIRONMENT, ENV_NIGHTLY);
      info(
        `[${PyTag.RUN_ALL_TEST}] => ${OUTPUT_TEST_ENVIRONMENT}=${ENV_NIGHTLY}`,
      );
    }
  };
};
