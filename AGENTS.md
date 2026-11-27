# rotki/action-job-checker

A JavaScript GitHub Action that decides which CI job groups run for a pull request, from the
changed files, commit message tags and labels, and sets a `<name>_tasks` and
`<name>_environment` output per group. rotki runs it from `.github/workflows/rotki_ci.yml` in
`rotki/rotki`, pinned by commit SHA with a version comment
(`rotki/action-job-checker@<sha> # v6.1.1`). The README documents the `@v6` major tag for everyone
else.

This file is the maintenance guide for humans and coding agents. `README.md` covers how a run is
decided, inputs, outputs, the configuration format and usage; `CONTRIBUTING.md` covers the
contributor basics. This guide links there instead of repeating them.

## Toolchain

- Node.js 24 (`.nvmrc`; CI reads its version from there). The action runs on the `node24` runtime
  (`action.yml`), so the two move together.
- pnpm 12, pinned through `packageManager` in `package.json`. `preinstall` refuses other package
  managers.
- TypeScript, bundled with Rollup into a single ESM file. Tests use Vitest. Linting uses
  `@rotki/eslint-config` with the slop rules (`eslint.config.mjs`).
- Husky hooks: `pre-commit` runs lint-staged (ESLint on staged files, Markdown included),
  `commit-msg` runs commitlint.

## Layout

- `action.yml`: inputs (`token`, `config`, `config_path`, `skip_label`), runtime and entry point
  (`dist/index.js`). It declares `outputs: {}` because the outputs are named after the configured
  groups.
- `schema.json`: the JSON schema for the configuration. `src/config.ts` reads it at runtime
  (`dist/../schema.json`) and validates the configuration with ajv, and the README points editors
  at its raw URL on `main`.
- `src/main.ts`, `src/action.ts`: the run and the decision steps the README lists under "How a run
  is decided".
- `src/config.ts`, `src/types.ts`: loading YAML or JSON configuration (with `js-yaml`) and
  validating it.
- `src/changes.ts`, `src/commit.ts`, `src/labels.ts`, `src/tags.ts`, `src/environments.ts`: changed
  files, commit message, labels, `[tag]` parsing and environment mapping.
- `src/input.ts`, `src/output.ts`: reading inputs, and writing outputs and the job summary.
- `tests/*.test.ts`: unit tests per module, with `@actions/core` and `@actions/github` mocked.
- `dist/index.js` and `dist/index.js.map`: the committed bundle that GitHub runs. Never edit it by
  hand.

## Commands

| Command                      | What it does                                                |
| ---------------------------- | ----------------------------------------------------------- |
| `pnpm run build`             | Type check only (`tsc --noEmit`). It does not write `dist/` |
| `pnpm run package`           | Bundle `src/` into `dist/` with Rollup                      |
| `pnpm run lint` / `lint:fix` | ESLint over the repository                                  |
| `pnpm test` / `test:watch`   | Run the tests once / in watch mode                          |
| `pnpm run all`               | Type check, lint, package and test, as CI does              |

CI (`.github/workflows/ci.yml`) runs commitlint, `pnpm run all`, and a `test` job that runs the
action from the working tree (`uses: ./`) three times: with an inline configuration, with a
configuration file, and with an invalid configuration that must fail. `Check dist/`
(`check.yml`) rebuilds the bundle and fails when the committed one differs.

## The committed `dist/`

GitHub runs `dist/index.js` straight from the tagged commit, so `dist/` is part of every change
that touches `src/` or a dependency that gets bundled (`@actions/core`, `@actions/github`, `ajv`,
`js-yaml`):

1. Run `pnpm run all`. It rebuilds `dist/`.
2. Commit the rebuilt `dist/` in the same commit as the change that caused it.

A dependency update that only touches dev tooling can still change the bundle (Rollup, its plugins,
TypeScript), so rebuild after those too. Anything `src/` imports belongs in `dependencies`, even
though Rollup would bundle it from `devDependencies` as well.

## Hard rules

Follow these in every change.

- **Never edit `dist/` by hand.** Rebuild it with `pnpm run package` (or `pnpm run all`) and commit
  it with the change that caused it.
- **Keep `schema.json`, the types and the README in step.** A configuration change updates
  `schema.json`, `src/types.ts`, `src/config.ts`, the configuration section of the README and the
  tests together. `schema.json` is read at runtime from each tagged commit and served to editors
  from `main`, so a change to it is a change to the action's interface.
- **Keep the decision order documented.** A change to how a run is decided updates the numbered
  steps in the README's "How a run is decided" and a test for the new behavior.
- **Do not break workflows that use the action silently.** Removing or renaming an input, an
  output or a configuration field, or skipping a group that used to run, is a major release (see
  Versioning). Running more than before is safer than running less: a skipped group hides
  failures.
- **Keep the runtime and Node in step.** `runs.using` in `action.yml` and `.nvmrc` name the same
  Node major.
- **Do not lower a check to make it pass.** No `eslint-disable`, `@ts-expect-error`, skipped tests
  or zizmor ignores, unless the commit explains why the check is wrong for this case.
- **Do not bypass the git hooks** (`--no-verify`).

## Verify before you finish

A change is done when the checks for it pass locally. Report which commands you ran and their
result; if you skipped one, say so and why.

| You changed                                         | Run                                                                                                       |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Anything                                            | `pnpm run all` (type check, lint, package, test)                                                          |
| `src/`, `schema.json`, `action.yml` or a dependency | `pnpm run all`, then check that `git status dist/` shows the rebuilt bundle and commit it                 |
| Decision logic                                      | A test that fails without your change, and the README steps                                               |
| Configuration format                                | `schema.json`, `src/types.ts`, the README configuration section, and a test with an invalid configuration |
| `.github/workflows/`                                | `actionlint` and `GH_TOKEN=$(gh auth token) zizmor .github/workflows`; pin every action to a commit SHA   |

When a check fails, find the cause. Do not retry until it passes, and do not change a test to match
broken behavior.

## Git and pull requests

On top of `CONTRIBUTING.md`, for agents:

- Branch names: `type/short-description` (`fix/implies-loop`), never an agent-tool prefix such as
  `claude/`.
- End every commit you create or amend with exactly one of each trailer, after a blank line:

  ```text
  LLM-Model: <provider>/<model-id>
  Harness: <harness-name> <version>
  ```

  Use the model selected in the current session, and the version of the harness process that runs
  you, not of a CLI on `PATH` (a desktop app ships its own copy). Walk up the parent processes
  (`ps -o pid=,ppid=,args= -p <pid>`) to the binary and ask it for `--version`. If you cannot
  verify either value, ask before committing.

- No AI `Co-Authored-By` trailers and no "generated with" lines in commits, pull requests or code.
- Do not push to `main`, merge pull requests, create or move tags, or run `pnpm run release` unless
  the maintainer asks for that specific step.

## Recording what you learn

Before you finish, ask whether you hit something the next person would trip over. If you did, first
try to make a tool catch it: a lint rule, a test or a CI check. Write it down only when no tool can,
short and with the fix or the reason, in this file and in the same pull request. Unfinished work
goes to the maintainer as a proposed GitHub issue, never as a to-do list in this file.

## Dependency updates

Renovate lists updates on the Dependency Dashboard issue and opens pull requests only on approval
(`.github/renovate.json5`).

**Prefer one batched update over approving Renovate pull requests one at a time.** Use the
dashboard as the checklist, and do a maintenance pass by hand when updates have piled up and before
a release. A batch is a single branch and pull request, so the lockfile and `dist/` are rebuilt
once and CI and review run once. Renovate notices the merged versions and clears those dashboard
entries by itself. Tick a single dashboard box only for an update that cannot wait, such as a fix
for a security advisory.

### Policy

- **7-day release-age cooldown** in both `.github/renovate.json5` and `pnpm-workspace.yaml`.
  `@rotki/eslint-config` and `@rotki/eslint-plugin` are excluded.
- **Node and pnpm follow the runtime.** `@types/node` and `node` stay on 24.x and pnpm on 12.x.
  Moving to a new Node major also changes `runs.using` in `action.yml`, which is a major release.
- **TypeScript stays below 7.** typescript-eslint and `@rollup/plugin-typescript` need the
  TypeScript 6 JavaScript API. Renovate enforces this.
- **Overrides:** `pnpm-workspace.yaml` overrides `katex` (under `micromark-extension-math`) and
  `tinypool` (under `oxfmt`) for security advisories. Both come in through `@rotki/eslint-config`.
  Check on each pass whether the parents have caught up, and remove an override once they have.
- **`ajv` and `js-yaml` decide what configuration is accepted.** A major of either can change
  validation or parsing; run the tests and check the CI `test` job's invalid-configuration case.
- GitHub Actions are pinned by commit SHA with the version in a trailing comment.

### Procedure

1. Start from an up to date `main` on a branch such as `chore/deps-update`.
2. Gather the state: `pnpm audit`, `pnpm outdated`, and the dashboard
   (`gh issue list -R rotki/action-job-checker --search "Dependency Dashboard in:title"`).
3. Check publish dates (`npm view <package> "time[<version>]"`) and skip anything younger than 7
   days.
4. Bump with `pnpm add -E` (runtime) and `pnpm add -D -E` (dev), keeping both `@commitlint/*`
   packages on the same version. Update pnpm with `corepack use pnpm@<version>` and action pins
   with `gh api repos/<owner>/<repo>/commits/<tag> -q .sha`.
5. Refresh vulnerable transitive packages with `pnpm update --depth Infinity <package> ...`, and
   trace what remains with `pnpm why`.
6. Run `pnpm run all` and commit the rebuilt `dist/`.
7. Commit in parts: `ci: update github actions` for workflow pins, and `chore(deps): update
dependencies` (or `fix(deps):` for a bundled dependency) for the rest, with `dist/`.

## Workflow changes

Check any change under `.github/workflows/`, including pin bumps, with both tools:

- [actionlint](https://github.com/rhysd/actionlint) checks that workflows are valid: syntax,
  expressions, references, action inputs, and `run:` scripts through shellcheck. Run `actionlint`
  from the repository root.
- [zizmor](https://docs.zizmor.sh/) checks workflow security. Run it with a token so the online
  audits (impostor commits, pin and comment mismatches, known-vulnerable actions) run too:

  ```sh
  GH_TOKEN=$(gh auth token) zizmor .github/workflows
  ```

The current baseline, all expected:

- **actionlint:** 8 `property "<name>_tasks" is not defined` (and `_environment`) errors in the
  `test` job of `ci.yml`. actionlint checks `steps.<id>.outputs` of a `uses: ./` step against
  `action.yml`, which cannot list outputs named after configured groups.
- **zizmor:** 3 low `self-repository` findings, one per `uses: ./` step in the `test` job.

A change must not add findings beyond this baseline. Keep the existing patterns: `permissions: {}`
at the top level with per-job grants, `persist-credentials: false` on checkout, SHA pins with a
version comment, and expressions that carry outside input passed to `run:` through `env:`.

## Releasing

Follow "Releases" in `CONTRIBUTING.md`: `pnpm run release` (`bumpp --no-push`) bumps `package.json`,
commits `chore: release vX.Y.Z` and tags it, and pushing a `v*.*` tag runs
`.github/workflows/release.yml`, which creates the GitHub release with `changelogithub`. It names
the previous `vX.Y.Z` tag itself, so a major tag already on the release commit cannot confuse it.
Nothing is published to npm.

After pushing the version tag:

1. Move the major tag to the same commit, so `@vN` users get the release:

   ```sh
   git tag -f vN vX.Y.Z
   git push -f origin vN
   ```

   This force-pushes a tag. Only ever move the major tag of the release line you just published,
   and only forward. Never move it across a major version.

2. Verify: `gh release view vX.Y.Z -R rotki/action-job-checker`, and that `vN` and `vX.Y.Z` point
   at the same commit (`git rev-list -n1 vN` and `git rev-list -n1 vX.Y.Z`).

   If the release is missing, read the `release` run's log and fix the cause. To publish the
   notes for a tag that is already pushed, run `changelogithub` yourself with the previous release
   and the repository named, since `origin` can be a fork. For example:

   ```sh
   GITHUB_TOKEN=$(gh auth token) npx changelogithub@14.0.0 --github rotki/action-job-checker \
     --from v6.1.1 --to v6.1.2
   ```

3. Update the consumer: change the `rotki/action-job-checker@<sha> # vX.Y.Z` reference in
   `rotki/rotki`'s `.github/workflows/rotki_ci.yml` to the new commit and version (Renovate in that
   repository may propose it). Every rotki pull request runs it, so check the next rotki CI run.

### Versioning

Semantic versioning, applied to what workflows that use the action see:

- **Patch:** bug fixes and dependency updates that do not change which groups run.
- **Minor:** new optional inputs, new configuration fields, and new tags.
- **Major:** removed or renamed inputs, outputs or configuration fields, a changed decision rule
  that makes a group run or skip where it did not before, and a new Node runtime in `action.yml`.
  A major starts a new `vN` tag and a "Migrating from vN" section in the README, like the existing
  one for v5.

## Repository settings

These live in GitHub, not in the repository. Keep this list current when they change.

- `main` is protected: 1 approving review, and the `license/cla`, `build`, `test`, `commit-lint`
  and `check-dist` checks must pass. `Check dist/` runs on every change, Markdown-only ones
  included, so the required check is never left waiting.
- `CODEOWNERS` assigns everything to `@rotki/maintainers`, which has write access.
- The workflows use only the built-in `GITHUB_TOKEN`. There are no environments or repository
  secrets.
