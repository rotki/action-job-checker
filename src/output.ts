import { info, setOutput, summary } from '@actions/core';
import type { RunList } from './types';

interface Job {
  description: string;
  key: keyof RunList;
  output: typeof Output[keyof typeof Output];
}

const Output = {
  BACKEND: 'backend_tasks',
  COLIBRI: 'colibri_tasks',
  DOCUMENTATION: 'documentation_tasks',
  E2E: 'e2e_tasks',
  FRONTEND: 'frontend_tasks',
} as const;

const jobs: Job[] = [
  { description: 'frontend job', key: 'frontend', output: Output.FRONTEND },
  { description: 'backend job', key: 'backend', output: Output.BACKEND },
  { description: 'e2e job', key: 'e2e', output: Output.E2E },
  { description: 'docs job', key: 'docs', output: Output.DOCUMENTATION },
  { description: 'colibri job', key: 'colibri', output: Output.COLIBRI },
] as const;

function getStatus(run: boolean): string {
  if (run)
    return 'Run';

  return 'Skipped';
}

export async function setActionOutput(needsToRun: RunList): Promise<void> {
  const summaryHeaders: string[] = [];
  const summaryDescription: string[] = [];

  for (const job of jobs) {
    if (needsToRun[job.key]) {
      info(`will run ${job.description}`);
      setOutput(job.output, true);
    }
    summaryHeaders.push(job.description);
    summaryDescription.push(getStatus(needsToRun[job.key]));
  }

  await summary
    .addTable([
      summaryHeaders.map(header => ({ data: header, header: true })),
      summaryDescription,
    ])
    .write();
}
