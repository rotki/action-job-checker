import * as core from '@actions/core'
import {changeDetected, checkForChanges} from './changes'
import {ActionInputs} from './input'
import {RunList} from './types'
import {getCommitMessage, useCheckForTag} from './commit'
import {setOutput} from './output'
import {usePyTestTagCheck} from './backend-tags'
import {Tag} from './tags'

async function run(): Promise<void> {
  try {
    const inputs = new ActionInputs()
    const commitMessage = await getCommitMessage()

    const needsToRun: RunList = {
      frontend: false,
      backend: false,
      docs: false
    }

    const checkPyTestTags = usePyTestTagCheck(commitMessage, needsToRun)
    const checkForTag = useCheckForTag(commitMessage)

    if (checkForTag(Tag.RUN_ALL)) {
      needsToRun.frontend = true
      needsToRun.backend = true
      needsToRun.docs = true
      core.info(`[run all] detected, running all tasks`)
    } else if (checkForTag(Tag.SKIP_CI) || checkForTag(Tag.CI_SKIP)) {
      core.info(`[skip ci] or [ci skip] detected, skipping all tasks`)
    } else {
      await checkForChanges(files => {
        if (files === null) {
          needsToRun.frontend = true
          needsToRun.backend = true
          needsToRun.docs = true
        } else {
          core.info(`Checking ${files.length} files of the PR for changes`)
          if (changeDetected(inputs.frontendPaths, files)) {
            needsToRun.frontend = true
          }
          if (changeDetected(inputs.backendPaths, files)) {
            needsToRun.backend = true
          }
          if (changeDetected(inputs.documentationPaths, files)) {
            needsToRun.docs = true
          }
        }
      })
    }

    checkPyTestTags()
    setOutput(needsToRun)
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed('unknown error')
    }
  }
}

run()
