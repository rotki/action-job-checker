import type { Config, RunList } from './types';
import { info, setOutput, summary } from '@actions/core';

function getStatus(run: boolean): string {
  return run ? 'Run' : 'Skipped';
}

export async function setActionOutput(config: Config, needsToRun: RunList): Promise<void> {
  const headers: string[] = [];
  const statuses: string[] = [];

  for (const group of config.groups) {
    const outputName = `${group.name}_tasks`;
    const run = needsToRun[group.name];
    if (run) {
      info(`will run ${group.name} job`);
      setOutput(outputName, 'true');
    }
    else {
      setOutput(outputName, '');
    }
    headers.push(`${group.name} job`);
    statuses.push(getStatus(run));
  }

  await summary
    .addTable([
      headers.map(header => ({ data: header, header: true })),
      statuses,
    ])
    .write();
}
