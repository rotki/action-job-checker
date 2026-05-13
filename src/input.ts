import type { Config } from './types';
import * as core from '@actions/core';
import { loadConfigFromFile, parseConfig } from './config';

export interface IActionInputs {
  readonly config: Config;
  readonly skipLabel: string;
}

export class ActionInputs implements IActionInputs {
  readonly config: Config;
  readonly skipLabel: string;

  constructor() {
    const configPath = core.getInput('config_path', { required: false }).trim();
    const inlineConfig = core.getInput('config', { required: false });

    if (configPath !== '') {
      this.config = loadConfigFromFile(configPath);
    }
    else if (inlineConfig.trim() !== '') {
      this.config = parseConfig(inlineConfig);
    }
    else {
      throw new Error('either `config` or `config_path` must be provided');
    }

    this.skipLabel = core.getInput('skip_label', { required: false }) || 'skip ci';
  }
}
