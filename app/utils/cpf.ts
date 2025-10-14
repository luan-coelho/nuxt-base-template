/**
 * Remove todos os caracteres não numéricos de uma string
 */
export function removeCPFMask(cpf: string): string {
  return cpf.replace(/\D/g, '')
}

/**
 * Aplica a máscara de CPF no formato 000.000.000-00
 */
export function applyCPFMask(value: string): string {
  let cpf = removeCPFMask(value)
  cpf = cpf.substring(0, 11)
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2')
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2')
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  return cpf
}

/**
 * Valida se um CPF é válido através do cálculo dos dígitos verificadores
 */
export function isValidCPF(cpf: string): boolean {
  const cleanCPF = removeCPFMask(cpf)

  // Verifica se tem 11 dígitos ou se todos os dígitos são iguais
  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
    return false
  }

  // Valida primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false

  // Valida segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false

  return true
}

/**
 * Formata um CPF aplicando a máscara automaticamente
 * Útil para usar com v-model em inputs
 */
export function formatCPFInput(value: string): string {
  return applyCPFMask(value)
}
