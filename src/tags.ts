export enum PyTag {
  SKIP_PYTEST = 'skip py tests',
  RUN_PY_NFT = 'run nft py tests',
  RUN_ALL_TEST = 'run all py tests'
}

export enum Tag {
  RUN_ALL = 'run all',
  SKIP_CI = 'skip ci',
  CI_SKIP = 'ci skip'
}

export type Tags = Tag | PyTag
