export type CommitMessage = string | null

export type RunList = {
  frontend: boolean
  e2e: boolean
  backend: boolean
  docs: boolean
}
