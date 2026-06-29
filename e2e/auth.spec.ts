import { test, expect } from '@playwright/test'

// Test E2E del flujo principal: control de acceso por autenticación.
// Cubre el caso crítico "un usuario no autenticado no puede ver contenido privado".

test.describe('Acceso y autenticación', () => {
  test('la home muestra el formulario de inicio de sesión', async ({ page }) => {
    await page.goto('/')
    // El logo y el formulario de auth deben estar presentes.
    await expect(page.getByText('lucuma')).toBeVisible()
    await expect(page.getByPlaceholder('Email')).toBeVisible()
    await expect(page.getByPlaceholder('Contraseña')).toBeVisible()
  })

  test('se puede alternar entre iniciar sesión y registrarse', async ({ page }) => {
    await page.goto('/')
    // Al pasar a "Registrarse" aparece el campo de nombre de usuario.
    await page.getByRole('button', { name: /Registrate/i }).click()
    await expect(page.getByPlaceholder('Nombre de usuario')).toBeVisible()
  })

  test('un usuario no autenticado que entra al feed es redirigido al login', async ({ page }) => {
    await page.goto('/feed')
    // Sin sesión, FeedPage redirige a "/" (la pantalla de auth).
    await expect(page).toHaveURL(/\/$/, { timeout: 10_000 })
    await expect(page.getByPlaceholder('Email')).toBeVisible()
  })
})
