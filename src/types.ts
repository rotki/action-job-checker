export type CommitMessage = string | null;

export interface RunList {
  frontend: boolean;
  e2e: boolean;
  backend: boolean;
  docs: boolean;
}
