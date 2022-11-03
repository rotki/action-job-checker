import {CommitMessage} from './types'
import * as core from '@actions/core'
import * as github from '@actions/github'
import {Tags} from './tags'

export const getCommitMessage = async (): Promise<CommitMessage> => {
  const token = core.getInput('token', {required: true})
  const client = github.getOctokit(token)
  const {context} = github
  if (!context.payload.pull_request) {
    core.info(`Didn't detect a PR`)
    return null
  }
  const {sha} = context.payload.pull_request.head

  const response = await client.rest.git.getCommit({
    ...context.repo,
    commit_sha: sha
  })

  const {message} = response.data
  return message
}

const getRegexFromTag = (tag: Tags): RegExp => new RegExp(`\\[${tag}\\]`, 'gm')

export const useCheckForTag =
  (message: CommitMessage) =>
  (tag: Tags): boolean => {
    return !!message && getRegexFromTag(tag).test(message)
  }
