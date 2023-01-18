import * as core from '@actions/core'
import {ActionInputs} from './input'
import {getCommitMessage} from './commit'
import {setOutput} from './output'
import {usePyTestTagCheck} from './backend-tags'
import {checkRequiredTasks} from './action'

async function run(): Promise<void> {
  try {
    const inputs = new ActionInputs()
    const commitMessage = await getCommitMessage()
    const needsToRun = await checkRequiredTasks(commitMessage, inputs)
    const checkPyTestTags = usePyTestTagCheck(commitMessage, needsToRun)
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
