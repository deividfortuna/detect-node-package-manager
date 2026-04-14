import fs from 'node:fs'
import path from 'node:path'

export type PackageManager = 'yarn' | 'pnpm' | 'npm'

export type NodeVersionManager = 'nvm' | 'nodenv' | 'n'

const nodeVersionFiles: Record<NodeVersionManager, string> = {
  nvm: '.nvmrc',
  nodenv: '.node-version',
  n: '.n-node-version'
}

/**
 * Detects the package manager used in the given working directory.
 *
 * @param workingDirectory The directory to check for lock files.
 * @returns The detected package manager.
 * @throws If no lock file is found, an error is thrown indicating that the package manager cannot be determined.
 */
export const detectPackageManager: (
  workingDirectory: string
) => PackageManager = (workingDirectory) => {
  if (fs.existsSync(path.join(workingDirectory, 'package-lock.json'))) {
    return 'npm'
  } else if (fs.existsSync(path.join(workingDirectory, 'yarn.lock'))) {
    return 'yarn'
  } else if (fs.existsSync(path.join(workingDirectory, 'pnpm-lock.yaml'))) {
    return 'pnpm'
  } else {
    throw new Error('No lock file found. Unable to determine package manager.')
  }
}

/**
 * Detects the Node.js version file used in the given working directory.
 *
 * @param workingDirectory The directory to check for Node.js version files.
 * @returns An object containing the detected Node.js version manager and the path to the version file, or null if no version file is found.
 */
export const detectNodeVersionFile: (
  workingDirectory: string
) => { manager: NodeVersionManager; path: string } | null = (
  workingDirectory
) => {
  for (const [manager, file] of Object.entries(nodeVersionFiles) as [
    NodeVersionManager,
    string
  ][]) {
    const filePath = path.join(workingDirectory, file)
    if (fs.existsSync(filePath)) {
      return { manager, path: filePath }
    }
  }
  return null
}
