export interface User {
  username: string
}

export interface LoginResponse {
  success: boolean
  user?: User
  message?: string
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    const data: LoginResponse = await response.json()

    if (data.success && data.user) {
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('currentUser', JSON.stringify(data.user))
      return data
    } else {
      return data
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      message: '로그인 중 오류가 발생했습니다.'
    }
  }
}

export function logout(): void {
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('currentUser')
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('isAuthenticated') === 'true'
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('currentUser')
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}