import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    clearMocks: true,
    coverage: {
      include: ['src/**'],
      exclude: ['node_modules/', 'dist/'],
      reporter: ['json-summary', 'text', 'lcov'],
      reportsDirectory: './coverage'
    },
    include: ['**/*.test.ts'],
    exclude: ['dist/', 'node_modules/']
  }
})
