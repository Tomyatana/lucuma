import { defineConfig, devices } from '@playwright/test'

// Configuración de Playwright para los tests E2E.
// Levanta la build de producción servida con `astro preview` y corre los tests contra ella.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Construye y sirve la app antes de correr los tests (reutiliza el server si ya está vivo).
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
