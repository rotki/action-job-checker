export const PyTag = {
  SKIP_PYTEST: 'skip py tests',
  RUN_PY_NFT: 'run nft py tests',
  RUN_ALL_TEST: 'run all py tests'
} as const

export const Tag = {
  RUN_ALL: 'run all',
  RUN_E2E: 'run e2e',
  RUN_FRONTEND: 'run frontend',
  SKIP_CI: 'skip ci',
  CI_SKIP: 'ci skip'
} as const

// eslint-disable-next-line no-redeclare
type Tag = (typeof Tag)[keyof typeof Tag]
// eslint-disable-next-line no-redeclare
type PyTag = (typeof PyTag)[keyof typeof PyTag]
export type Tags = Tag | PyTag
