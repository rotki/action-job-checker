import * as core from '@actions/core'
import * as github from '@actions/github'

export const checkForChanges = async (
  check: (files: string[] | null) => void
): Promise<void> => {
  const token = core.getInput('token', {required: true})
  const client = github.getOctokit(token)
  const {context} = github
  if (!context.payload.pull_request) {
    core.info(`This isn't a PR`)
    check(null)
    return
  }
  const {number} = context.payload.pull_request

  for await (const response of client.paginate.iterator(
    client.rest.pulls.listFiles,
    {
      ...context.repo,
      pull_number: number
    }
  )) {
    check(response.data.map(value => value.filename))
  }
}

export const changeDetected = (
  monitored: string[],
  changed: string[]
): boolean => {
  for (const path of monitored) {
    for (const detected of changed) {
      if (detected.startsWith(path) || detected === path) {
        return true
      }
    }
  }
  return false
}
