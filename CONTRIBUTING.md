# Contribution Guide

Thank you for considering contributing to `action-job-checker`! We welcome all kinds of contributions, from code to documentation, and everything in between. This guide will help you get started with contributing to our project.

## Prerequisites

Before you start contributing make sure you have the following tools installed:

- **Node.js** 24, the version in `.nvmrc`. For ease of setup we recommend the usage of [`nvm`](https://github.com/nvm-sh/nvm) (`nvm use`).
- **pnpm** 12 as the package manager. The exact version is set by `packageManager` in `package.json`. The simplest way to get it is:

  `corepack enable`

Maintainers and coding agents should also read [AGENTS.md](./AGENTS.md), which covers the committed `dist/`, the configuration schema, dependency updates, workflow checks and releases in detail.

## Getting Started

Before you start contributing, make sure you read our contribution guide to understand what we expect from a contribution.

### Managing Dependencies

Proper dependency management is crucial for maintaining a healthy codebase. Please refer to the section on dependencies for more details.

**[Dependencies Guide](https://docs.rotki.com/contribution-guides/vue-typescript.html#dependencies)**

This section outlines how to add, update, and manage dependencies in our project. Understanding and following these rules will help us avoid common pitfalls associated with dependencies.

## Commit Style

We use Conventional Commits as our commit style to ensure consistent and descriptive commit messages. This helps in automatically generating changelogs, determining the nature of changes (major, minor, patch), and for generally keeping our project's history clean and readable.

### Conventional Commits

A specification for adding human and machine-readable meaning to commit messages. The commit message should be structured as follows:

```text
<type>[optional scope]: <description>

[optional body]
[optional footer(s)]
```

**Types**:

- `feat`: Introduces a new feature.
- `fix`: Patches a bug in the codebase.
- `docs`: Documentation-only changes.
- `chore`: Maintenance tasks like tooling updates, dependencies, etc.
- `test`: Adding or modifying test cases.
- `refactor`: Code refactoring without behavior changes.
- `ci`: Modifications to CI configuration files and scripts.

#### Reverting and Breaking Changes

- If your commit reverts a previous commit, add `revert: ` before the type. E.g., `revert: feat(pencil): add 'graphiteWidth' option`.
- Breaking changes should start with `feat!` or `fix!`.

**Examples**:

```text
feat: add support for new configuration
fix: properly validate directory names
feat!: change input and output format
```

### Changelog Generation

Ensure that any changes that should be included in the change log are properly prefixed with `feat:` or `fix:`.
By following these guidelines, you will help ensure that our project remains maintainable and understandable for everyone involved.

## Testing

All changes must be accompanied by appropriate unit tests. This ensures that new features work as expected and that bugs are fixed without introducing regressions.

- **Unit Tests**: We use **Vitest** for unit testing. Unit tests should cover individual functions or components to ensure they work as intended in isolation.

Before submitting a pull request, please ensure:

- Your changes are fully covered by unit tests.
- All tests pass successfully.

This helps maintain the overall health and stability of the codebase.

You can run the tests using:

```bash
pnpm run test
```

If you want to run the tests in watch mode, use:

```bash
pnpm run test:watch
```

## Linting

We use `@rotki/eslint-config` for linting to ensure code quality and consistency. Please make sure your code adheres to the project's linting rules before submitting a pull request.

### Running Linting

To run the linter, use the following command:

```sh
pnpm run lint
```

### Fixing Linting Issues

If you encounter any linting issues, you can attempt to auto-fix them using:

```sh
pnpm run lint:fix
```

Ensure that your code passes all linting checks before submitting your pull request. Proper linting helps maintain readability and reduces potential errors in the codebase.

### Making a Pull Request

The ci checks if the build JavaScript during a pull request matches
the one that is in the `dist` directory.

The distributable in the `dist` directory is what is used to run the
action and should be updated for a pull request to pass.

To make sure that the commit is at a prime state, you can use:

```bash
pnpm run all
```

This will run the linter the test suite and will build the action.

## Releases

We use `bumpp` to handle versioning for our releases, following Semantic Versioning principles. The release process involves updating the version and pushing a tag to trigger the release flow.

### Semantic Versioning

We follow [Semantic Versioning](https://semver.org/) to label our releases. The version number is of the format `MAJOR.MINOR.PATCH`:

- **MAJOR**: Incompatible API changes
- **MINOR**: Added functionality in a backwards-compatible manner
- **PATCH**: Backwards-compatible bug fixes

### Steps for Releasing

1. **Update Version**: Use `bumpp` to update the project version.

   ```sh
   pnpm run release
   ```

   Follow the prompts to select the appropriate version bump (e.g., patch, minor, major) based on the nature of the changes. This bumps `package.json`, commits `chore: release vX.Y.Z` and creates the tag locally without pushing.

2. **Push Tag**: Push the release commit and the tag to `rotki/action-job-checker`. The tag triggers the release workflow, which creates the GitHub release with generated notes.

   ```sh
   git push origin main --follow-tags
   ```

3. **Move the major tag**: Point the major tag at the same commit, so consumers of `@vN` get the release. For example, after releasing `v6.1.2`:

   ```sh
   git tag -f v6 v6.1.2
   git push -f origin v6
   ```

> [!WARNING]
>
> Moving a tag is a force push. Only move the major tag of the release line you just published,
> and only forward. A new major release starts a new major tag instead.

See the Releasing section of [AGENTS.md](./AGENTS.md) for verification steps, updating the rotki
workflow that pins this action, and how versions are chosen.

> [!NOTE]
>
> Avoid breaking changes in minor or patch releases, since consumers of the major tag pick those up
> automatically.

## Contact

If you have any questions or need assistance, feel free to reach out to the [maintainers](https://discord.rotki.com) or open an issue on our repository.

Happy coding!
