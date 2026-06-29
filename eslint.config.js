import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'

// Configuración flat de ESLint (formato moderno).
// Lintea el código TypeScript/React de la app. Los archivos generados se ignoran.
export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', '.astro', 'coverage', 'playwright-report', 'test-results'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Permitimos `any` puntual en el manejo de errores (catch (err: unknown) ya es la norma,
      // pero no queremos que el linter bloquee casos legítimos).
      '@typescript-eslint/no-explicit-any': 'off',
      // Las variables sin usar son un error, salvo que empiecen con "_" (descarte intencional).
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
)
