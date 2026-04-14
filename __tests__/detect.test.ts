import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { detectPackageManager, detectNodeVersionFile } from '../src/detect'

describe('detectPackageManager', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'detect-pm-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true })
  })

  it('returns npm when package-lock.json exists', () => {
    fs.writeFileSync(path.join(tmpDir, 'package-lock.json'), '')
    expect(detectPackageManager(tmpDir)).toBe('npm')
  })

  it('returns yarn when yarn.lock exists', () => {
    fs.writeFileSync(path.join(tmpDir, 'yarn.lock'), '')
    expect(detectPackageManager(tmpDir)).toBe('yarn')
  })

  it('returns pnpm when pnpm-lock.yaml exists', () => {
    fs.writeFileSync(path.join(tmpDir, 'pnpm-lock.yaml'), '')
    expect(detectPackageManager(tmpDir)).toBe('pnpm')
  })

  it('throws when no lock file is found', () => {
    expect(() => detectPackageManager(tmpDir)).toThrow(
      'No lock file found. Unable to determine package manager.'
    )
  })

  it('prefers npm when multiple lock files exist', () => {
    fs.writeFileSync(path.join(tmpDir, 'package-lock.json'), '')
    fs.writeFileSync(path.join(tmpDir, 'yarn.lock'), '')
    expect(detectPackageManager(tmpDir)).toBe('npm')
  })
})

describe('detectNodeVersionFile', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'detect-nvf-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true })
  })

  it('returns nvm and the path to .nvmrc when it exists', () => {
    const filePath = path.join(tmpDir, '.nvmrc')
    fs.writeFileSync(filePath, '20')
    expect(detectNodeVersionFile(tmpDir)).toEqual({
      manager: 'nvm',
      path: filePath
    })
  })

  it('returns nodenv and the path to .node-version when it exists', () => {
    const filePath = path.join(tmpDir, '.node-version')
    fs.writeFileSync(filePath, '20')
    expect(detectNodeVersionFile(tmpDir)).toEqual({
      manager: 'nodenv',
      path: filePath
    })
  })

  it('returns n and the path to .n-node-version when it exists', () => {
    const filePath = path.join(tmpDir, '.n-node-version')
    fs.writeFileSync(filePath, '20')
    expect(detectNodeVersionFile(tmpDir)).toEqual({
      manager: 'n',
      path: filePath
    })
  })

  it('returns null when no node version file is found', () => {
    expect(detectNodeVersionFile(tmpDir)).toBeNull()
  })

  it('prefers .nvmrc when multiple node version files exist', () => {
    fs.writeFileSync(path.join(tmpDir, '.nvmrc'), '20')
    fs.writeFileSync(path.join(tmpDir, '.node-version'), '20')
    fs.writeFileSync(path.join(tmpDir, '.n-node-version'), '20')
    expect(detectNodeVersionFile(tmpDir)).toEqual({
      manager: 'nvm',
      path: path.join(tmpDir, '.nvmrc')
    })
  })

  it('prefers .node-version over .n-node-version', () => {
    fs.writeFileSync(path.join(tmpDir, '.node-version'), '20')
    fs.writeFileSync(path.join(tmpDir, '.n-node-version'), '20')
    expect(detectNodeVersionFile(tmpDir)).toEqual({
      manager: 'nodenv',
      path: path.join(tmpDir, '.node-version')
    })
  })
})
