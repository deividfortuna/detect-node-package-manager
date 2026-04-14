import path from 'node:path'
import * as core from '@actions/core'
import {
  detectPackageManager,
  detectNodeVersionFile,
  NodeVersionManager,
  PackageManager
} from './detect'

const lockfiles: Record<PackageManager, string> = {
  npm: 'package-lock.json',
  yarn: 'yarn.lock',
  pnpm: 'pnpm-lock.yaml'
}

export function run(): void {
  try {
    const workingDirectory = core.getInput('working-directory', {
      trimWhitespace: true
    })
    const supportedPackageManagers = core
      .getInput('supported-package-managers', {
        trimWhitespace: true
      })
      .split(',')
      .map((s) => s.trim()) as PackageManager[]
    const supportedNodeVersionManagers = core
      .getInput('supported-node-version-managers', {
        trimWhitespace: true
      })
      .split(',')
      .map((s) => s.trim()) as NodeVersionManager[]

    const packageManager = detectPackageManager(workingDirectory)

    if (!supportedPackageManagers.includes(packageManager)) {
      core.setFailed(
        `Detected package manager '${packageManager}' is not in the supported list: ${supportedPackageManagers.join(', ')}`
      )
    }

    const nodeVersionFile = detectNodeVersionFile(workingDirectory)
    if (nodeVersionFile) {
      if (!supportedNodeVersionManagers.includes(nodeVersionFile.manager)) {
        core.setFailed(
          `Detected Node.js version manager '${nodeVersionFile.manager}' is not in the supported list: ${supportedNodeVersionManagers.join(', ')}`
        )
      }
      core.setOutput('node-version-manager', nodeVersionFile.manager)
      core.setOutput('node-version-file', nodeVersionFile.path)
    } else {
      core.warning(
        'No Node.js version file found (.nvmrc, .node-version, .n-node-version)'
      )
      core.setOutput('node-version-manager', '')
      core.setOutput('node-version-file', '')
    }

    core.setOutput('package-manager', packageManager)
    core.setOutput(
      'lockfile',
      path.join(workingDirectory, lockfiles[packageManager])
    )
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
