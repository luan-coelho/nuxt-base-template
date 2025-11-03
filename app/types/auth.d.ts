// Extensão de tipos para nuxt-auth-utils

declare module '#auth-utils' {
  // Definição do usuário na sessão
  interface User {
    id: string
    name: string
    email: string
    cpf: string
    phone?: string
    roles: string[]
    active: boolean
    passwordMustChange?: boolean
  }

  // Definição dos dados da sessão do usuário
  interface UserSession {
    // Data de login (timestamp)
    loggedInAt?: number
    // Tempo de expiração do access token (timestamp)
    expiresAt?: number
  }

  // Dados sensíveis da sessão (acessíveis apenas no server)
  interface SecureSessionData {
    // Tokens não precisam ser armazenados pois são gerenciados via cookies HTTP-only
    // Você pode adicionar outros dados sensíveis aqui se necessário
  }
}

export {}
