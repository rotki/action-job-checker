# action-job-checker

Decides which CI jobs a pull request needs, from the files it changes and the tags in its
latest commit message.

You describe your jobs as **groups** (`frontend`, `backend`, `docs`, ...). Each group lists
the paths that trigger it and, optionally, commit-message tags that force it on or off, other
groups it pulls in, and values to pass on to the job. The action sets one `<name>_tasks`
output per group, which downstream jobs use in their `if:`.

## How a run is decided

The action reads the head commit of the PR and goes through these steps in order:

1. On a `labeled` or `unlabeled` event for any label other than `skip_label`, every group is
   skipped. Adding or removing an unrelated label does not rerun CI.
2. If the PR carries `skip_label`, every group is skipped.
3. If the commit message contains `[skip ci]` or `[ci skip]`, every group is skipped.
4. Otherwise one of these turns groups on:
   - `[run all]` turns every group on.
   - If any group's `run_tag` is in the commit message, exactly the groups whose tag is
     present run, and changed files are not looked at.
   - Otherwise a group runs when one of the PR's changed files matches its `paths`.
5. Groups listed in `implies` of a running group are turned on, recursively.
6. A group whose `skip_tag` is in the commit message is turned off. This overrides everything
   above, including `[run all]` and `implies`.
7. For each running group, the first `environments` entry whose tag is in the commit message
   sets `<name>_environment`.

Tags are written in square brackets anywhere in the commit message: `[run backend]`.

Outside a pull request (a push, a schedule, a manual run) there are no changed files, labels
or commit tags to read, so every group runs.

The run log says why each group ran or was skipped, and the job summary lists the result per
group.

## Inputs

| Input         | Required | Default   | Description                                                                          |
| ------------- | -------- | --------- | ------------------------------------------------------------------------------------ |
| `token`       | yes      |           | Token used to read the PR's files, labels and head commit. `github.token` is enough. |
| `config`      | no       |           | Inline YAML or JSON config. Ignored when `config_path` is set.                       |
| `config_path` | no       |           | Path to a YAML or JSON config file in the checked out repository.                    |
| `skip_label`  | no       | `skip ci` | PR label that skips every group. Matched case-insensitively.                         |

One of `config` and `config_path` is required.

## Outputs

| Output               | Value                                                                           |
| -------------------- | ------------------------------------------------------------------------------- |
| `<name>_tasks`       | `'true'` when the group runs, `''` when it is skipped.                          |
| `<name>_environment` | The `value` of the matching `environments` entry. Not set when nothing matched. |

A skipped group gets an empty string rather than `'false'`, so both
`if: needs.check.outputs.docs_tasks` and `if: needs.check.outputs.docs_tasks == 'true'` work.

## Configuration

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/rotki/action-job-checker/main/schema.json
groups:
  - name: frontend
    paths: [frontend/app]
    run_tag: run frontend
    implies: [e2e]
  - name: e2e
    run_tag: run e2e
  - name: backend
    paths: [rotkehlchen, requirements.txt]
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

`groups` is a non-empty list. Its order only affects the summary table. Each group takes:

| Field          | Required | Description                                                                                                                                             |
| -------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`         | yes      | Unique name matching `^[a-z][a-z0-9_]*$`. The output is `<name>_tasks`.                                                                                 |
| `paths`        | no       | A changed file matches a path when it equals it or sits under it. `./` matches any change. Leave it out for groups triggered only by tags or `implies`. |
| `run_tag`      | no       | Tag, without brackets, that turns the group on.                                                                                                         |
| `skip_tag`     | no       | Tag, without brackets, that turns the group off.                                                                                                        |
| `implies`      | no       | Names of other groups that run whenever this one does.                                                                                                  |
| `environments` | no       | List of `{ tag, value }`. The first tag found sets `<name>_environment` to `value`, if the group runs.                                                  |

The config is validated against [`schema.json`](./schema.json) at runtime. An invalid config
fails the step and names the offending field. Unknown group names in `implies` and duplicate
names fail too.

For editor completion, put the `yaml-language-server` line shown above at the top of the
config file, or at the top of the inline `config` block.

## Usage

```yaml
jobs:
  check:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: read
    outputs:
      frontend_tasks: ${{ steps.checker.outputs.frontend_tasks }}
      backend_tasks: ${{ steps.checker.outputs.backend_tasks }}
      backend_environment: ${{ steps.checker.outputs.backend_environment }}
    steps:
      - uses: rotki/action-job-checker@v6
        id: checker
        with:
          token: ${{ github.token }}
          config: |
            groups:
              - name: frontend
                paths: [frontend]
              - name: backend
                paths: [rotkehlchen]
                environments:
                  - tag: run all py tests
                    value: nightly

  frontend:
    needs: check
    if: needs.check.outputs.frontend_tasks
    runs-on: ubuntu-latest
    steps:
      - run: echo "frontend changed"
```

To keep the config in the repository, check it out first and point `config_path` at it:

```yaml
steps:
  - uses: actions/checkout@v7
    with:
      persist-credentials: false
  - uses: rotki/action-job-checker@v6
    id: checker
    with:
      token: ${{ github.token }}
      config_path: .github/job-checker.yml
```

The inline `config` needs no checkout.

## Migrating from v5

v6 replaces the fixed `frontend_paths`, `backend_paths`, `colibri_paths` and
`documentation_paths` inputs with `config`. The v5 behaviour maps to:

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

Two outputs are renamed: `documentation_tasks` becomes `<group>_tasks` (`docs_tasks` above),
and `test_environment` becomes `<group>_environment` (`backend_environment` above).

## License

[AGPL-3.0](./LICENSE.md) License &copy; 2023- [Rotki Solutions GmbH](https://github.com/rotki)
