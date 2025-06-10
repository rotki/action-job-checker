import { getInput, info } from '@actions/core';
import * as github from '@actions/github';

export async function hasLabel(labelName: string): Promise<boolean> {
  const token = getInput('token', { required: true });
  const client = github.getOctokit(token);
  const { context } = github;

  if (!context.payload.pull_request) {
    info(`This isn't a PR, skipping label check`);
    return false;
  }

  const { number } = context.payload.pull_request;

  try {
    const { data: labels } = await client.rest.issues.listLabelsOnIssue({
      ...context.repo,
      issue_number: number,
    });

    const hasMatchingLabel = labels.some(label => label.name.toLowerCase() === labelName.toLowerCase());

    if (hasMatchingLabel) {
      info(`PR has label "${labelName}", all tasks will be skipped`);
    }

    return hasMatchingLabel;
  }
  catch (error) {
    info(`Error checking for label: ${String(error)}`);
    return false;
  }
}

export function isLabelEvent(): boolean {
  const { context } = github;
  return context.payload.action === 'labeled' || context.payload.action === 'unlabeled';
}

export function isSkipLabelChanged(skipLabel: string): boolean {
  const { context } = github;
  if (!context.payload.label) {
    return false;
  }
  return context.payload.label.name.toLowerCase() === skipLabel.toLowerCase();
}
