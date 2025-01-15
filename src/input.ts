import * as core from '@actions/core';

export interface IActionInputs {
  readonly colibriPaths: string[];
  readonly backendPaths: string[];
  readonly frontendPaths: string[];
  readonly documentationPaths: string[];
}

export class ActionInputs implements IActionInputs {
  readonly colibriPaths: string[];
  readonly backendPaths: string[];
  readonly frontendPaths: string[];
  readonly documentationPaths: string[];

  constructor() {
    const COLIBRI_PATHS = 'colibri_paths';
    const BACKEND_PATHS = 'backend_paths';
    const FRONTEND_PATHS = 'frontend_paths';
    const DOCUMENTATION_PATHS = 'documentation_paths';

    const options = { required: true };

    this.colibriPaths = this.getInputAsArray(COLIBRI_PATHS, options);
    this.backendPaths = this.getInputAsArray(BACKEND_PATHS, options);
    this.frontendPaths = this.getInputAsArray(FRONTEND_PATHS, options);
    this.documentationPaths = this.getInputAsArray(
      DOCUMENTATION_PATHS,
      options,
    );
  }

  private getInputAsArray = (
    name: string,
    options?: core.InputOptions,
  ): string[] =>
    core
      .getInput(name, options)
      .split('\n')
      .map(s => s.trim())
      .filter(x => x !== '');
}
