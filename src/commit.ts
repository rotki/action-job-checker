import { getInput, info } from '@actions/core';
import * as github from '@actions/github';
import type { CommitMessage } from './types';
import type { Tags } from './tags';

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

const getRegexFromTag = (tag: Tags): RegExp => new RegExp(`\\[${tag}\\]`, 'gm');

export function useCheckForTag(message: CommitMessage) {
  return (tag: Tags): boolean =>
    !!message && getRegexFromTag(tag).test(message);
}
