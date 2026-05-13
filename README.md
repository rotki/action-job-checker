# rotki/action-job-checker

> A GitHub Action that detects which CI jobs need to run for a pull request, based on the files that changed and on commit-message tags.

You declare a set of **groups** (e.g. `frontend`, `backend`, `docs`). For each group you list the paths that should trigger it, optional commit-message tags that force it on or off, optional implications between groups, and optional environment mappings. The action emits `<name>_tasks` and (when configured) `<name>_environment` outputs you can wire into downstream jobs.

## Usage

You can provide the config inline, or point at a file in the repo (file takes precedence if both are set):

```yaml
check-changes:
  name: Required job check
  runs-on: ubuntu-latest
  outputs:
    frontend_tasks: ${{ steps.checker.outputs.frontend_tasks }}
    backend_tasks: ${{ steps.checker.outputs.backend_tasks }}
    e2e_tasks: ${{ steps.checker.outputs.e2e_tasks }}
    docs_tasks: ${{ steps.checker.outputs.docs_tasks }}
    backend_environment: ${{ steps.checker.outputs.backend_environment }}
  steps:
    - uses: actions/checkout@v4
    - uses: rotki/action-job-checker@v6
      id: checker
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
        skip_label: skip ci
        config: |
          # yaml-language-server: $schema=https://raw.githubusercontent.com/rotki/action-job-checker/main/schema.json
          groups:
            - name: frontend
              paths: [frontend/app]
              run_tag: run frontend
              implies: [e2e]
            - name: e2e
              run_tag: run e2e
            - name: backend
              paths:
                - rotkehlchen
                - requirements.txt
                - requirements_dev.txt
              run_tag: run backend
              skip_tag: skip py tests
              environments:
                - tag: run nft py tests
                  value: nfts
                - tag: run all py tests
                  value: nightly
            - name: docs
              paths: [docs]
```

Or via a file:

```yaml
- uses: rotki/action-job-checker@v6
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    config_path: .github/job-checker.yml
```

Then gate downstream jobs on the outputs:

```yaml
lint-frontend:
  needs: [check-changes]
  if: ${{ needs.check-changes.outputs.frontend_tasks == 'true' }}
  runs-on: ubuntu-latest
  steps:
    - ...
```

## Configuration

### Top-level

| Field    | Required | Description                                                    |
| -------- | -------- | -------------------------------------------------------------- |
| `groups` | yes      | Non-empty list of groups. Order is only used in summary output |

### Per group

| Field          | Required | Description                                                                                                                                          |
| -------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`         | yes      | Unique slug matching `^[a-z][a-z0-9_]*$`. Becomes output `<name>_tasks`                                                                              |
| `paths`        | no       | Paths that trigger the group when any changed file equals or starts with one of them. Omit/empty if the group is only triggered by `run_tag`/implies |
| `run_tag`      | no       | Commit-message tag (without brackets) that forces this group on. When any group's `run_tag` fires, path detection is skipped                         |
| `skip_tag`     | no       | Commit-message tag that forces this group off after detection (overrides everything, including `[run all]`)                                          |
| `implies`      | no       | Other groups that also turn on when this one does. Recursive                                                                                         |
| `environments` | no       | List of `{ tag, value }` entries. The first matching tag (when the group is going to run) sets `<name>_environment` to `value`                       |

### Action-level commit tags (built-in, always available)

| Tag         | Effect                                                       |
| ----------- | ------------------------------------------------------------ |
| `[run all]` | Force every group on (still subject to `skip_tag` overrides) |
| `[skip ci]` | Skip everything                                              |
| `[ci skip]` | Skip everything                                              |

### Skip label

Setting the `skip_label` input (default `skip ci`) gives PR authors an alternative to commit tags: applying that label to the PR skips all groups.

## Schema and editor support

The repo ships a [JSON Schema](./schema.json) at `https://raw.githubusercontent.com/rotki/action-job-checker/main/schema.json`. Two ways to wire it up:

**Inline `config` input** — add the `yaml-language-server` directive on the first line of the YAML block (see example above). Most editors with the YAML extension pick it up.

**Config file** — at the top of `.github/job-checker.yml`:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/rotki/action-job-checker/main/schema.json
groups:
  ...
```

The same schema is enforced at runtime by the action; invalid configs fail with a structured error pointing at the offending field.

## Outputs

Outputs are determined by your config:

- `<name>_tasks` (`'true' | 'false'`) — one per group
- `<name>_environment` (string) — for groups that declare `environments` and whose matching tag is present in the commit message

## Migrating from v5

v5 hard-coded `frontend_paths`, `backend_paths`, `colibri_paths`, `documentation_paths` and a `test_environment` output for Python testing. v6 replaces them with the single `config`/`config_path` input. Mapping:

v5:

```yaml
with:
  frontend_paths: |
    frontend/app
  backend_paths: |
    rotkehlchen
  colibri_paths: |
    colibri
  documentation_paths: |
    docs
```

v6:

```yaml
with:
  config: |
    groups:
      - name: frontend
        paths: [frontend/app]
        run_tag: run frontend
        implies: [e2e]
      - name: e2e
        run_tag: run e2e
      - name: backend
        paths: [rotkehlchen]
        skip_tag: skip py tests
        environments:
          - tag: run nft py tests
            value: nfts
          - tag: run all py tests
            value: nightly
      - name: colibri
        paths: [colibri]
      - name: docs
        paths: [docs]
```

Downstream output names change:

- `documentation_tasks` → `docs_tasks` (or whatever you name the group)
- `test_environment` → `backend_environment` (or `<group>_environment` for whichever group declares the mapping)
