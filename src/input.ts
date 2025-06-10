import * as core from '@actions/core';

export interface IActionInputs {
  readonly colibriPaths: string[];
  readonly backendPaths: string[];
  readonly frontendPaths: string[];
  readonly documentationPaths: string[];
  readonly skipLabel: string;
}

export class ActionInputs implements IActionInputs {
  readonly colibriPaths: string[];
  readonly backendPaths: string[];
  readonly frontendPaths: string[];
  readonly documentationPaths: string[];
  readonly skipLabel: string;

  constructor() {
    const COLIBRI_PATHS = 'colibri_paths';
    const BACKEND_PATHS = 'backend_paths';
    const FRONTEND_PATHS = 'frontend_paths';
    const DOCUMENTATION_PATHS = 'documentation_paths';
    const SKIP_LABEL = 'skip_label';

    const options = { required: true };

    this.colibriPaths = this.getInputAsArray(COLIBRI_PATHS, { required: false }) ?? [];
    this.backendPaths = this.getInputAsArray(BACKEND_PATHS, options);
    this.frontendPaths = this.getInputAsArray(FRONTEND_PATHS, options);
    this.documentationPaths = this.getInputAsArray(
      DOCUMENTATION_PATHS,
      options,
    );
    this.skipLabel = core.getInput(SKIP_LABEL, { required: false }) || 'skip ci';
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
