import {CommitMessage, RunList} from './types'
import {useCheckForTag} from './commit'
import * as core from '@actions/core'
import {PyTag} from './tags'

const ENV_VAR_TEST_ENVIRONMENT = 'TEST_ENVIRONMENT'
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
        core.exportVariable(ENV_VAR_TEST_ENVIRONMENT, ENV_NFTS)
      } else if (checkForTag(PyTag.RUN_ALL_TEST)) {
        core.exportVariable(ENV_VAR_TEST_ENVIRONMENT, ENV_NIGHTLY)
      }
    }
  }
}
