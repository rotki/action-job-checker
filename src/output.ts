import { info, setOutput } from '@actions/core';
import { type RunList } from './types';

const Output = {
  FRONTEND: 'frontend_tasks',
  E2E: 'e2e_tasks',
  BACKEND: 'backend_tasks',
  DOCUMENTATION: 'documentation_tasks',
} as const;

export const setActionOutput = (needsToRun: RunList): void => {
  if (needsToRun.frontend) {
    info(`will run frontend job`);
    setOutput(Output.FRONTEND, true);
  }

  if (needsToRun.e2e) {
    info('will run e2e job');
    setOutput(Output.E2E, true);
  }

  if (needsToRun.backend) {
    info(`will run backend job`);
    setOutput(Output.BACKEND, true);
  }

  if (needsToRun.docs) {
    info(`will run docs job`);
    setOutput(Output.DOCUMENTATION, true);
  }
};
