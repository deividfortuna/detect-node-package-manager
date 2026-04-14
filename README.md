# Detect Node Package Manager

![CI](https://github.com/deividfortuna/detect-node-package-manager/actions/workflows/ci.yml/badge.svg)
![Lint](https://github.com/deividfortuna/detect-node-package-manager/actions/workflows/linter.yml/badge.svg)
![Check dist/](https://github.com/deividfortuna/detect-node-package-manager/actions/workflows/check-dist.yml/badge.svg)
![CodeQL](https://github.com/deividfortuna/detect-node-package-manager/actions/workflows/codeql-analysis.yml/badge.svg)
![Coverage](./badges/coverage.svg)

A GitHub Action that detects the Node.js package manager (`npm`, `yarn`, or
`pnpm`) and version manager (`nvm`, `nodenv`, or `n`) used by a project, based
on lockfiles and version files present in the repository.

Useful as a building block in reusable workflows that need to adapt to the
package manager a project uses — for example, to decide which install command to
run or which cache key to use with
[`actions/setup-node`](https://github.com/actions/setup-node).

## Features

- Detects `npm`, `yarn`, and `pnpm` from the presence of their lockfiles.
- Detects the Node.js version file used by `nvm` (`.nvmrc`), `nodenv`
  (`.node-version`), or `n` (`.n-node-version`).
- Returns the path to the lockfile, ready to be fed into the
  `cache-dependency-path` input of `actions/setup-node`.
- Fails the workflow if the detected manager is not in the allow list.

## Usage

```yaml
steps:
  - uses: actions/checkout@v4

  - name: Detect package manager
    id: detect
    uses: deividfortuna/detect-node-package-manager@v1

  - uses: actions/setup-node@v4
    with:
      node-version-file: ${{ steps.detect.outputs.node-version-file }}
      cache: ${{ steps.detect.outputs.package-manager }}
      cache-dependency-path: ${{ steps.detect.outputs.lockfile }}

  - name: Install dependencies
    env:
      PACKAGE_MANAGER: ${{ steps.detect.outputs.package-manager }}
    run: $PACKAGE_MANAGER install
```

### Running in a subdirectory

```yaml
- uses: deividfortuna/detect-node-package-manager@v1
  id: detect
  with:
    working-directory: ./packages/app
```

### Restricting which managers are allowed

```yaml
- uses: deividfortuna/detect-node-package-manager@v1
  id: detect
  with:
    supported-package-managers: npm,pnpm
    supported-node-version-managers: nvm
```

## Inputs

| Name                              | Description                                                                                   | Default         |
| --------------------------------- | --------------------------------------------------------------------------------------------- | --------------- |
| `working-directory`               | Directory to search for package manager lockfiles and Node.js version files.                  | `.`             |
| `supported-package-managers`      | Comma-separated list of allowed package managers. Valid values: `npm`, `yarn`, `pnpm`.        | `npm,yarn,pnpm` |
| `supported-node-version-managers` | Comma-separated list of allowed Node.js version managers. Valid values: `nvm`, `nodenv`, `n`. | `nvm,nodenv,n`  |

If the detected package manager or Node.js version manager is not in the
corresponding allow list, the action fails the workflow step.

## Outputs

| Name                   | Description                                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| `package-manager`      | The detected package manager: `npm`, `yarn`, or `pnpm`.                                                    |
| `lockfile`             | Path to the detected lockfile, relative to the repository root (e.g. `package-lock.json`).                 |
| `node-version-manager` | The detected Node.js version manager: `nvm`, `nodenv`, or `n`. Empty string if no version file is found.   |
| `node-version-file`    | Path to the detected Node.js version file (e.g. `.nvmrc`, `.node-version`). Empty string if none is found. |

## Detection rules

### Package managers

The first match wins, checked in this order:

| Package manager | Lockfile            |
| --------------- | ------------------- |
| `npm`           | `package-lock.json` |
| `yarn`          | `yarn.lock`         |
| `pnpm`          | `pnpm-lock.yaml`    |

If no lockfile is found, the action fails.

### Node.js version managers

| Version manager | Version file      |
| --------------- | ----------------- |
| `nvm`           | `.nvmrc`          |
| `nodenv`        | `.node-version`   |
| `n`             | `.n-node-version` |

If no version file is found, the action emits a warning and sets both
`node-version-manager` and `node-version-file` outputs to empty strings.

## Security posture

- **All dependencies pinned to exact versions.** No `^` or `~` ranges in
  `package.json` — every direct dependency resolves to a single, known version.
- **No floating tags.** Versions are pinned literals, not moving targets, so
  builds are reproducible and a new upstream release cannot silently enter the
  dependency tree.
- **Dependabot cooldown.** Updates are held for 5 days after a release before a
  PR is opened (see [`.github/dependabot.yml`](./.github/dependabot.yml)),
  giving the ecosystem time to surface compromised or broken releases before
  they land here.
- **Signed commits required.** All commits to `main` must carry a verified
  signature, so every change in the history is attributable to a known author.

## License

[MIT](./LICENSE)
