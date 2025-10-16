/**
 * Gera uma senha temporária segura e aleatória
 * Compatible with Better Auth password requirements:
 * - Minimum 8 characters, maximum 128 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 *
 * @param length - Tamanho da senha (padrão: 12, mínimo: 8, máximo: 128)
 * @returns Senha temporária gerada
 */
export function generateTemporaryPassword(length: number = 12): string {
  // Valida o comprimento da senha de acordo com os requisitos do Better Auth
  if (length < 8) {
    length = 8
  }
  if (length > 128) {
    length = 128
  }

  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
  const numberChars = '0123456789'
  const specialChars = '!@#$%^&*'

  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars

  // Garantir que a senha tenha pelo menos um de cada tipo de caractere
  let password = ''
  password += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)]
  password += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)]
  password += numberChars[Math.floor(Math.random() * numberChars.length)]
  password += specialChars[Math.floor(Math.random() * specialChars.length)]

  // Preencher o resto da senha com caracteres aleatórios
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Embaralhar a senha para que os caracteres garantidos não estejam sempre no início
  const shuffledPassword = password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')

  // Validação final para garantir que a senha atende aos requisitos
  const hasUppercase = /[A-Z]/.test(shuffledPassword)
  const hasLowercase = /[a-z]/.test(shuffledPassword)
  const hasNumber = /[0-9]/.test(shuffledPassword)
  const hasSpecial = /[!@#$%^&*]/.test(shuffledPassword)

  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    // Se por algum motivo a senha não atender aos requisitos, tenta novamente
    console.warn('Senha gerada não atendeu aos requisitos. Gerando novamente...')
    return generateTemporaryPassword(length)
  }

  return shuffledPassword
}
