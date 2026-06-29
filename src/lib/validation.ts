// Validaciones de reglas de negocio, compartidas entre la UI y (conceptualmente)
// las restricciones de la base de datos. Mantenerlas como funciones puras permite
// testearlas de forma aislada y reutilizarlas en los formularios.

export const POST_MAX_LENGTH = 280
export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 30

export interface ValidationResult {
  valid: boolean
  error?: string
}

// Valida el contenido de una publicación.
// Refleja el CHECK de la base de datos: char_length(content) between 1 and 280.
// Se ignoran los espacios al inicio/fin (un post de solo espacios no es válido).
export function validatePostContent(content: string): ValidationResult {
  const trimmed = content.trim()
  if (trimmed.length === 0) {
    return { valid: false, error: 'La publicación no puede estar vacía' }
  }
  if (trimmed.length > POST_MAX_LENGTH) {
    return { valid: false, error: `Máximo ${POST_MAX_LENGTH} caracteres` }
  }
  return { valid: true }
}

// Valida un nombre de usuario en el registro.
// Debe tener entre 3 y 30 caracteres (sin contar espacios al borde).
export function validateUsername(username: string): ValidationResult {
  const trimmed = username.trim()
  if (trimmed.length < USERNAME_MIN_LENGTH) {
    return { valid: false, error: `El usuario debe tener al menos ${USERNAME_MIN_LENGTH} caracteres` }
  }
  if (trimmed.length > USERNAME_MAX_LENGTH) {
    return { valid: false, error: `El usuario no puede superar los ${USERNAME_MAX_LENGTH} caracteres` }
  }
  return { valid: true }
}
