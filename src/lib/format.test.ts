import { describe, it, expect } from 'vitest'
import { timeAgo } from './format'

// Reloj fijo para que los tests sean deterministas (no dependen de Date.now() real).
const NOW = new Date('2026-06-29T12:00:00Z').getTime()
const ago = (ms: number) => new Date(NOW - ms).toISOString()

const SECOND = 1_000
const MINUTE = 60 * SECOND
const HOUR   = 60 * MINUTE
const DAY    = 24 * HOUR

describe('timeAgo', () => {
  it('muestra "ahora" para menos de un minuto', () => {
    expect(timeAgo(ago(30 * SECOND), NOW)).toBe('ahora')
  })

  it('muestra minutos para menos de una hora', () => {
    expect(timeAgo(ago(5 * MINUTE), NOW)).toBe('5m')
    expect(timeAgo(ago(59 * MINUTE), NOW)).toBe('59m')
  })

  it('muestra horas para menos de un día', () => {
    expect(timeAgo(ago(3 * HOUR), NOW)).toBe('3h')
    expect(timeAgo(ago(23 * HOUR), NOW)).toBe('23h')
  })

  it('muestra días para menos de una semana', () => {
    expect(timeAgo(ago(2 * DAY), NOW)).toBe('2d')
    expect(timeAgo(ago(6 * DAY), NOW)).toBe('6d')
  })

  it('a partir de una semana muestra una fecha corta en vez de "Nd"', () => {
    const result = timeAgo(ago(8 * DAY), NOW)
    expect(result).not.toMatch(/^\d+d$/)
    expect(result.length).toBeGreaterThan(0)
  })
})
