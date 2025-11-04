/**
 * Estrutura padrão de resposta da API
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: FieldError[]
  }
}

export interface FieldError {
  field: string
  message: string
}
