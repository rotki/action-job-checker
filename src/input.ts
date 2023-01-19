import * as core from '@actions/core'

export interface IActionInputs {
  readonly backendPaths: string[]
  readonly frontendPaths: string[]
  readonly documentationPaths: string[]
}

export class ActionInputs implements IActionInputs {
  readonly backendPaths: string[]
  readonly frontendPaths: string[]
  readonly documentationPaths: string[]

  constructor() {
    const BACKEND_PATHS = 'backend_paths'
    const FRONTEND_PATHS = 'frontend_paths'
    const DOCUMENTATION_PATHS = 'documentation_paths'

    const options = {required: true}

    this.backendPaths = this.getInputAsArray(BACKEND_PATHS, options)
    this.frontendPaths = this.getInputAsArray(FRONTEND_PATHS, options)
    this.documentationPaths = this.getInputAsArray(DOCUMENTATION_PATHS, options)
  }

  private getInputAsArray = (
    name: string,
    options?: core.InputOptions
  ): string[] =>
    core
      .getInput(name, options)
      .split('\n')
      .map(s => s.trim())
      .filter(x => x !== '')
}
