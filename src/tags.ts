export const PyTag = {
  RUN_ALL_TEST: 'run all py tests',
  RUN_PY_NFT: 'run nft py tests',
  SKIP_PYTEST: 'skip py tests',
} as const;

export const Tag = {
  CI_SKIP: 'ci skip',
  RUN_ALL: 'run all',
  RUN_E2E: 'run e2e',
  RUN_FRONTEND: 'run frontend',
  SKIP_CI: 'skip ci',
} as const;

type Tag = (typeof Tag)[keyof typeof Tag];

type PyTag = (typeof PyTag)[keyof typeof PyTag];

export type Tags = Tag | PyTag;
