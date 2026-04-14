import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest'
import * as core from '../__fixtures__/core'
import {
  detectPackageManager,
  detectNodeVersionFile
} from '../__fixtures__/detect'

vi.mock('@actions/core', () => core)
vi.mock('../src/detect', () => ({
  detectPackageManager,
  detectNodeVersionFile
}))

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

  it('includes the working directory in the lockfile output', () => {
    core.getInput
      .mockReturnValueOnce('packages/app')
      .mockReturnValueOnce('npm,yarn,pnpm')
      .mockReturnValueOnce('nvm,nodenv,n')
    detectPackageManager.mockReturnValueOnce('npm')

    run()

    expect(core.setOutput).toHaveBeenCalledWith(
      'lockfile',
      'packages/app/package-lock.json'
    )
  })

  it('sets package-manager and lockfile for yarn', () => {
    core.getInput
      .mockReturnValueOnce('.')
      .mockReturnValueOnce('npm,yarn,pnpm')
      .mockReturnValueOnce('nvm,nodenv,n')
    detectPackageManager.mockReturnValueOnce('yarn')

    run()

    expect(core.setOutput).toHaveBeenCalledWith('package-manager', 'yarn')
    expect(core.setOutput).toHaveBeenCalledWith('lockfile', 'yarn.lock')
  })

  it('sets package-manager and lockfile for pnpm', () => {
    core.getInput
      .mockReturnValueOnce('.')
      .mockReturnValueOnce('npm,yarn,pnpm')
      .mockReturnValueOnce('nvm,nodenv,n')
    detectPackageManager.mockReturnValueOnce('pnpm')

    run()

    expect(core.setOutput).toHaveBeenCalledWith('package-manager', 'pnpm')
    expect(core.setOutput).toHaveBeenCalledWith('lockfile', 'pnpm-lock.yaml')
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

  it('fails when no lock file is found', () => {
    core.getInput
      .mockReturnValueOnce('.')
      .mockReturnValueOnce('npm,yarn,pnpm')
      .mockReturnValueOnce('nvm,nodenv,n')
    detectPackageManager.mockImplementationOnce(() => {
      throw new Error(
        'No lock file found. Unable to determine package manager.'
      )
    })

    run()

    expect(core.setFailed).toHaveBeenCalledWith(
      'No lock file found. Unable to determine package manager.'
    )
  })

  it('sets node-version-manager and node-version-file when a version file is found', () => {
    core.getInput
      .mockReturnValueOnce('.')
      .mockReturnValueOnce('npm,yarn,pnpm')
      .mockReturnValueOnce('nvm,nodenv,n')
    detectPackageManager.mockReturnValueOnce('npm')
    detectNodeVersionFile.mockReturnValueOnce({
      manager: 'nvm',
      path: './.nvmrc'
    })

    run()

    expect(detectNodeVersionFile).toHaveBeenCalledWith('.')
    expect(core.setOutput).toHaveBeenCalledWith('node-version-manager', 'nvm')
    expect(core.setOutput).toHaveBeenCalledWith('node-version-file', './.nvmrc')
    expect(core.warning).not.toHaveBeenCalled()
  })

  it('fails when detected node version manager is not supported', () => {
    core.getInput
      .mockReturnValueOnce('.')
      .mockReturnValueOnce('npm,yarn,pnpm')
      .mockReturnValueOnce('nvm,nodenv')
    detectPackageManager.mockReturnValueOnce('npm')
    detectNodeVersionFile.mockReturnValueOnce({
      manager: 'n',
      path: './.n-node-version'
    })

    run()

    expect(core.setFailed).toHaveBeenCalledWith(
      "Detected Node.js version manager 'n' is not in the supported list: nvm, nodenv"
    )
  })

  it('sets empty node-version outputs and warns when none is found', () => {
    core.getInput
      .mockReturnValueOnce('.')
      .mockReturnValueOnce('npm,yarn,pnpm')
      .mockReturnValueOnce('nvm,nodenv,n')
    detectPackageManager.mockReturnValueOnce('npm')
    detectNodeVersionFile.mockReturnValueOnce(null)

    run()

    expect(core.setOutput).toHaveBeenCalledWith('node-version-manager', '')
    expect(core.setOutput).toHaveBeenCalledWith('node-version-file', '')
    expect(core.warning).toHaveBeenCalledWith(
      'No Node.js version file found (.nvmrc, .node-version, .n-node-version)'
    )
  })
})
