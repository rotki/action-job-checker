# rotki/action-job-checker

> An action designed to dynamically enable different jobs of rotki's CI for execution

The job detects if the contents of folders have been modified and then proceeds to run jobs that are required
for this folder.

## Usage

### Basic

You setup the job checker in the following way:

```yaml
check-changes:
  name: Required job check
  runs-on: ubuntu-latest
  outputs:
    colibri_tasks: ${{ steps.checker.outputs.colibri_tasks }}
    backend_tasks: ${{ steps.checker.outputs.backend_tasks }}
    frontend_tasks: ${{ steps.checker.outputs.frontend_tasks }}
    documentation_tasks: ${{ steps.checker.outputs.documentation_tasks }}
  steps:
    - name: Checkout
      uses: actions/checkout@v3
    - name: Run check action
      uses: rotki/action-job-checker@v1
      id: checker
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
        documentation_paths: |
          docs
        backend_paths: |
          rotkehlchen
          requirements.txt
          requirements_dev.txt
          requirements_lint.txt
        frontend_paths: |
          frontend/app
```

You use the output of the job in other jobs to enable disable running after push.

```yaml
lint-frontend:
  name: Frontend lint
  needs: [check-changes]
  if: ${{ needs.check-changes.outputs.frontend_tasks }}
  runs-on: ubuntu-latest
  steps:
    ...
```

#### Outputs

The action has the following outputs:

- **frontend_tasks**: boolean
- **e2e_tasks**: boolean
- **colibri_tasks**: boolean
- **backend_tasks**: boolean
- **documentation_tasks**: boolean
- **test_environment**: string (**''** | **nfts** | **nightly**)

## Commit message support

### General

The action supports the following commit message flags:

- `[run all]` will run all the jobs regardless of the change status of a monitored directory.
- `[skip ci]` or `[ci skip]` will not run any of the jobs regardless of the change status of the monitoring directory.
- `[run e2e]` will run only the e2e test suite
- `[run frontend]` will run only the frontend tasks (including e2e)

### Backend

- `[skip py tests]` will not run the python backend tests regardless of the change status of the monitored directory.
- `[run nft py tests]` will set the `test_environment` output to `nft`.
- `[run all py tests]` will set the `test_environment` output flag to `nightly`
