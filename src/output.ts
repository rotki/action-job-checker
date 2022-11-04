import {RunList} from './types'
import * as core from '@actions/core'

const FRONTEND_TASKS = 'frontend_tasks'
const BACKEND_TASKS = 'backend_tasks'
const DOCUMENTATION_TASKS = 'documentation_tasks'

export const setOutput = (needsToRun: RunList): void => {
  if (needsToRun.frontend) {
    core.info(`will run frontend job`)
    core.setOutput(FRONTEND_TASKS, true)
  }

  if (needsToRun.backend) {
    core.info(`will run backend job`)
    core.setOutput(BACKEND_TASKS, true)
  }

  if (needsToRun.docs) {
    core.info(`will run docs job`)
    core.setOutput(DOCUMENTATION_TASKS, true)
  }
}
