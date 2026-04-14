# Create Unit Test(s)

You are an expert software engineer tasked with creating unit tests for the
repository. Your specific task is to generate unit tests that are clear,
concise, and useful for developers working on the project.

## Guidelines

Ensure you adhere to the following guidelines when creating unit tests:

- Use a clear and consistent format for the unit tests
- Include a summary of the functionality being tested
- Use descriptive test names that clearly convey their purpose
- Ensure tests cover both the main path of success and edge cases
- Use proper assertions to validate the expected outcomes
- Use `vitest` for writing and running tests
- Place unit tests in the `__tests__` directory
- Use fixtures for any necessary test data, placed in the `__fixtures__`
  directory

## Example

Use the following as an example of how to structure your unit tests:

```typescript
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest'
import * as core from '../__fixtures__/core'
import {
  detectPackageManager,
  detectNodeVersionFile
} from '../__fixtures__/detect'

// Mocks should be declared before the module being tested is imported.
vi.mock('@actions/core', () => core)
vi.mock('../src/detect', () => ({
  detectPackageManager,
  detectNodeVersionFile
}))

// The module being tested should be imported dynamically. This ensures that
// the mocks are used in place of any actual dependencies.
const { run } = await import('../src/main')

describe('main.ts', () => {
  beforeEach(() => {
    detectNodeVersionFile.mockReturnValue(null)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('sets package-manager and lockfile for npm', () => {
    core.getInput
      .mockReturnValueOnce('.')
      .mockReturnValueOnce('npm,yarn,pnpm')
      .mockReturnValueOnce('nvm,nodenv,n')
    detectPackageManager.mockReturnValueOnce('npm')

    run()

    expect(detectPackageManager).toHaveBeenCalledWith('.')
    expect(core.setOutput).toHaveBeenCalledWith('package-manager', 'npm')
    expect(core.setOutput).toHaveBeenCalledWith('lockfile', 'package-lock.json')
  })

  it('fails when detected package manager is not supported', () => {
    core.getInput
      .mockReturnValueOnce('.')
      .mockReturnValueOnce('npm,pnpm')
      .mockReturnValueOnce('nvm,nodenv,n')
    detectPackageManager.mockReturnValueOnce('yarn')

    run()

    expect(core.setFailed).toHaveBeenCalledWith(
      "Detected package manager 'yarn' is not in the supported list: npm, pnpm"
    )
  })
})
```

## Fixtures

Create fixtures using `vi.fn()` typed against the real module signatures, e.g.:

```typescript
import type * as core from '@actions/core'
import { vi } from 'vitest'

export const getInput = vi.fn<typeof core.getInput>()
export const setOutput = vi.fn<typeof core.setOutput>()
export const setFailed = vi.fn<typeof core.setFailed>()
export const warning = vi.fn<typeof core.warning>()
```
