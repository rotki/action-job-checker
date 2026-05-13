import type { CommitMessage } from './types';
import { getInput, info } from '@actions/core';
import * as github from '@actions/github';

export async function getCommitMessage(): Promise<CommitMessage> {
  const token = getInput('token', { required: true });
  const client = github.getOctokit(token);
  const { context } = github;
  if (!context.payload.pull_request) {
    info(`Didn't detect a PR`);
    return null;
  }
  const { sha } = context.payload.pull_request.head;

  const response = await client.rest.git.getCommit({
    ...context.repo,

    commit_sha: sha,
  });

  const { message } = response.data;
  return message;
}

function escapeRegex(tag: string): string {
  return tag.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&');
}

const getRegexFromTag = (tag: string): RegExp => new RegExp(`\\[${escapeRegex(tag)}\\]`, 'gm');

export function useCheckForTag(message: CommitMessage) {
  return (tag: string): boolean =>
    !!message && getRegexFromTag(tag).test(message);
}
