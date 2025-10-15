/**
 * Utilitário centralizado para máscaras do sistema
 */

/**
 * Remove todos os caracteres não numéricos de uma string
 */
export function removeNonNumeric(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Aplica a máscara de CPF no formato 000.000.000-00
 * @param value - Valor a ser formatado
 * @returns String formatada com máscara de CPF
 */
export function applyCPFMask(value: string): string {
  let cpf = removeNonNumeric(value)
  cpf = cpf.substring(0, 11)
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2')
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2')
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  return cpf
}

/**
 * Aplica a máscara de telefone no formato (00) 00000-0000 ou (00) 0000-0000
 * @param value - Valor a ser formatado
 * @returns String formatada com máscara de telefone
 */
export function applyPhoneMask(value: string): string {
  let phone = removeNonNumeric(value)
  phone = phone.substring(0, 11)

  if (phone.length <= 10) {
    // Formato: (00) 0000-0000
    phone = phone.replace(/(\d{2})(\d)/, '($1) $2')
    phone = phone.replace(/(\d{4})(\d)/, '$1-$2')
  } else {
    // Formato: (00) 00000-0000
    phone = phone.replace(/(\d{2})(\d)/, '($1) $2')
    phone = phone.replace(/(\d{5})(\d)/, '$1-$2')
  }

  return phone
}

/**
 * Aplica a máscara de CEP no formato 00000-000
 * @param value - Valor a ser formatado
 * @returns String formatada com máscara de CEP
 */
export function applyCEPMask(value: string): string {
  let cep = removeNonNumeric(value)
  cep = cep.substring(0, 8)
  cep = cep.replace(/(\d{5})(\d)/, '$1-$2')
  return cep
}

/**
 * Aplica a máscara de CNPJ no formato 00.000.000/0000-00
 * @param value - Valor a ser formatado
 * @returns String formatada com máscara de CNPJ
 */
export function applyCNPJMask(value: string): string {
  let cnpj = removeNonNumeric(value)
  cnpj = cnpj.substring(0, 14)
  cnpj = cnpj.replace(/(\d{2})(\d)/, '$1.$2')
  cnpj = cnpj.replace(/(\d{3})(\d)/, '$1.$2')
  cnpj = cnpj.replace(/(\d{3})(\d)/, '$1/$2')
  cnpj = cnpj.replace(/(\d{4})(\d)/, '$1-$2')
  return cnpj
}

/**
 * Aplica a máscara de cartão de crédito no formato 0000 0000 0000 0000
 * @param value - Valor a ser formatado
 * @returns String formatada com máscara de cartão de crédito
 */
export function applyCreditCardMask(value: string): string {
  let card = removeNonNumeric(value)
  card = card.substring(0, 16)
  card = card.replace(/(\d{4})(?=\d)/g, '$1 ')
  return card
}

/**
 * Aplica a máscara de moeda no formato R$ 0.000,00
 * @param value - Valor a ser formatado
 * @returns String formatada com máscara de moeda
 */
export function applyCurrencyMask(value: string): string {
  const currency = removeNonNumeric(value)

  if (currency.length === 0) {
    return ''
  }

  // Converte para número e divide por 100 para ter os centavos
  const numberValue = parseInt(currency) / 100

  return numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

/**
 * Aplica a máscara de data no formato DD/MM/AAAA
 * @param value - Valor a ser formatado
 * @returns String formatada com máscara de data
 */
export function applyDateMask(value: string): string {
  let date = removeNonNumeric(value)
  date = date.substring(0, 8)
  date = date.replace(/(\d{2})(\d)/, '$1/$2')
  date = date.replace(/(\d{2})(\d)/, '$1/$2')
  return date
}
