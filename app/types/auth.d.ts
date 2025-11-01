// Tipos customizados para autenticação
declare module '#auth-utils' {
  interface User {
    id: string
    name: string
    email: string
    cpf: string
    roles: ('ADMIN' | 'USER' | 'MANAGER')[]
    passwordMustChange: boolean
    active: boolean
    phone?: string | undefined
  }

  interface UserSession {
    user: User
    loggedInAt: number
    secure: SecureSessionData | undefined
  }

  interface SecureSessionData {
    accessToken: string
    refreshToken: string
  }
}

export {}
