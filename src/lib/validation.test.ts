import { describe, it, expect } from 'vitest'
import {
  validatePostContent,
  validateUsername,
  POST_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
} from './validation'

describe('validatePostContent', () => {
  it('rechaza un post vacío', () => {
    expect(validatePostContent('').valid).toBe(false)
  })

  it('rechaza un post de solo espacios', () => {
    expect(validatePostContent('     ').valid).toBe(false)
  })

  it('acepta un post con contenido', () => {
    expect(validatePostContent('Hola mundo').valid).toBe(true)
  })

  it(`acepta exactamente ${POST_MAX_LENGTH} caracteres (límite inclusivo)`, () => {
    expect(validatePostContent('x'.repeat(POST_MAX_LENGTH)).valid).toBe(true)
  })

  it(`rechaza ${POST_MAX_LENGTH + 1} caracteres`, () => {
    const result = validatePostContent('x'.repeat(POST_MAX_LENGTH + 1))
    expect(result.valid).toBe(false)
    expect(result.error).toContain(String(POST_MAX_LENGTH))
  })
})

describe('validateUsername', () => {
  it(`rechaza menos de ${USERNAME_MIN_LENGTH} caracteres`, () => {
    expect(validateUsername('ab').valid).toBe(false)
  })

  it('acepta un usuario válido', () => {
    expect(validateUsername('martin').valid).toBe(true)
  })

  it('ignora los espacios al validar el largo mínimo', () => {
    expect(validateUsername('  a  ').valid).toBe(false)
  })

  it(`rechaza más de ${USERNAME_MAX_LENGTH} caracteres`, () => {
    expect(validateUsername('x'.repeat(USERNAME_MAX_LENGTH + 1)).valid).toBe(false)
  })
})
