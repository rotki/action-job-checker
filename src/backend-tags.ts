import {CommitMessage, RunList} from './types'
import {useCheckForTag} from './commit'
import * as core from '@actions/core'
import {PyTag} from './tags'

const OUTPUT_TEST_ENVIRONMENT = 'test_environment'
const ENV_NFTS = 'nfts'
const ENV_NIGHTLY = 'nightly'

export const usePyTestTagCheck = (
  commitMessage: CommitMessage,
  needsToRun: RunList
): Function => {
  const checkForTag = useCheckForTag(commitMessage)
  return (): void => {
    if (checkForTag(PyTag.SKIP_PYTEST)) {
      core.info(`[${PyTag.SKIP_PYTEST}] detected skipping backend tests`)
      needsToRun.backend = false
    } else {
      if (checkForTag(PyTag.RUN_PY_NFT)) {
        core.setOutput(OUTPUT_TEST_ENVIRONMENT, ENV_NFTS)
        core.info(
          `[${PyTag.RUN_PY_NFT}] => ${OUTPUT_TEST_ENVIRONMENT}=${ENV_NFTS}`
        )
      } else if (checkForTag(PyTag.RUN_ALL_TEST)) {
        core.setOutput(OUTPUT_TEST_ENVIRONMENT, ENV_NIGHTLY)
        core.info(
          `[${PyTag.RUN_ALL_TEST}] => ${OUTPUT_TEST_ENVIRONMENT}=${ENV_NIGHTLY}`
        )
      }
    }
  }
}
