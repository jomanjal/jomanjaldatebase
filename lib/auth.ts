export interface User {
  id: number
  username: string
  email: string
  role: string
}

export interface LoginResponse {
  success: boolean
  user?: User
  token?: string
  message?: string
}

/**
 * 로그인 함수 (JWT 토큰 기반)
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // 쿠키 포함
    })

    const data: LoginResponse = await response.json()

    if (data.success && data.user) {
      // 클라이언트 측에서도 사용자 정보 저장 (선택사항)
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

/**
 * 로그아웃 함수
 */
export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    localStorage.removeItem('currentUser')
  }
}

/**
 * 인증 상태 확인 (서버에서 토큰 검증)
 */
export async function checkAuth(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'GET',
      credentials: 'include',
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success && data.user) {
        localStorage.setItem('currentUser', JSON.stringify(data.user))
        return data.user
      }
    }
    
    localStorage.removeItem('currentUser')
    return null
  } catch (error) {
    console.error('Check auth error:', error)
    localStorage.removeItem('currentUser')
    return null
  }
}

/**
 * 현재 사용자 정보 가져오기 (클라이언트 사이드)
 */
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

/**
 * 인증 상태 확인 (클라이언트 사이드 - 캐시된 정보 사용)
 * @deprecated 서버 검증을 위해 checkAuth() 사용 권장
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('currentUser') !== null
}