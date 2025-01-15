export type CommitMessage = string | null;

export interface RunList {
  frontend: boolean;
  colibri: boolean;
  e2e: boolean;
  backend: boolean;
  docs: boolean;
}
