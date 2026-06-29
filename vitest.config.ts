import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Las funciones de negocio son puras: no necesitan DOM, corren en Node.
    environment: 'node',
    // Solo tests unitarios; los E2E (Playwright) viven en /e2e y se corren aparte.
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'e2e'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**'],
      reporter: ['text', 'html'],
    },
  },
})
