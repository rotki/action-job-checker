import { info, setOutput, summary } from '@actions/core';
import type { RunList } from './types';

const Output = {
  FRONTEND: 'frontend_tasks',
  E2E: 'e2e_tasks',
  BACKEND: 'backend_tasks',
  DOCUMENTATION: 'documentation_tasks',
} as const;

function getStatus(run: boolean): string {
  if (run)
    return 'Run';

  return 'Skipped';
}

export async function setActionOutput(needsToRun: RunList): Promise<void> {
  if (needsToRun.frontend) {
    info(`will run frontend job`);
    setOutput(Output.FRONTEND, true);
  }

  if (needsToRun.backend) {
    info(`will run backend job`);
    setOutput(Output.BACKEND, true);
  }

  if (needsToRun.e2e) {
    info('will run e2e job');
    setOutput(Output.E2E, true);
  }

  if (needsToRun.docs) {
    info(`will run docs job`);
    setOutput(Output.DOCUMENTATION, true);
  }

  await summary
    .addTable([
      [
        { data: 'Frontend', header: true },
        { data: 'Backend', header: true },
        { data: 'E2E', header: true },
        { data: 'Documentation', header: true },
      ],
      [
        getStatus(needsToRun.frontend),
        getStatus(needsToRun.backend),
        getStatus(needsToRun.e2e),
        getStatus(needsToRun.docs),
      ],
    ])
    .write();
}
