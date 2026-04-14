import { vi } from 'vitest'

export const detectPackageManager =
  vi.fn<typeof import('../src/detect').detectPackageManager>()

export const detectNodeVersionFile =
  vi.fn<typeof import('../src/detect').detectNodeVersionFile>()
