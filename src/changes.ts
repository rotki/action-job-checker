import { getInput, info } from '@actions/core';
import * as github from '@actions/github';

export async function checkForChanges(check: (files: string[] | null) => void): Promise<void> {
  const token = getInput('token', { required: true });
  const client = github.getOctokit(token);
  const { context } = github;
  if (!context.payload.pull_request) {
    info(`This isn't a PR`);
    check(null);
    return;
  }
  const { number } = context.payload.pull_request;

  for await (const response of client.paginate.iterator(
    client.rest.pulls.listFiles,
    {
      ...context.repo,

      pull_number: number,
    },
  ))
    check(response.data.map(value => value.filename));
}

export function changeDetected(monitored: string[], changed: string[]): boolean {
  for (const raw of monitored) {
    const path = raw.replace(/^(?:\.\/+)+/, '').replace(/\/+$/, '');
    if (path === '' || path === '.')
      return changed.length > 0;
    for (const detected of changed) {
      if (detected === path || detected.startsWith(`${path}/`))
        return true;
    }
  }
  return false;
}
