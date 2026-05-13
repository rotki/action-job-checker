export const Tag = {
  CI_SKIP: 'ci skip',
  RUN_ALL: 'run all',
  SKIP_CI: 'skip ci',
} as const;

export type Tag = (typeof Tag)[keyof typeof Tag];
