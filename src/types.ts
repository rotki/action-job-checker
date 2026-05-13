export type CommitMessage = string | null;

export interface EnvironmentMapping {
  tag: string;
  value: string;
}

export interface GroupConfig {
  name: string;
  paths: string[];
  runTag?: string;
  skipTag?: string;
  implies: string[];
  environments: EnvironmentMapping[];
}

export interface Config {
  groups: GroupConfig[];
}

export type RunList = Record<string, boolean>;
