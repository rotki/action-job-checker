import {RunList} from './types'
import * as core from '@actions/core'

const Output = {
  FRONTEND: 'frontend_tasks',
  E2E: 'e2e_tasks',
  BACKEND: 'backend_tasks',
  DOCUMENTATION: 'documentation_tasks'
} as const

export const setOutput = (needsToRun: RunList): void => {
  if (needsToRun.frontend) {
    core.info(`will run frontend job`)
    core.setOutput(Output.FRONTEND, true)
  }

  if (needsToRun.e2e) {
    core.info('will run e2e job')
    core.setOutput(Output.E2E, true)
  }

  if (needsToRun.backend) {
    core.info(`will run backend job`)
    core.setOutput(Output.BACKEND, true)
  }

  if (needsToRun.docs) {
    core.info(`will run docs job`)
    core.setOutput(Output.DOCUMENTATION, true)
  }
}
