import { vi } from 'vitest'

export const wait = vi.fn<typeof import('../src/wait').wait>()
