import { z } from 'zod'

/**
 * 공통 입력 검증 스키마
 */

// 이메일 검증
export const emailSchema = z
  .string()
  .min(1, '이메일을 입력해주세요.')
  .max(255, '이메일은 255자를 초과할 수 없습니다.')
  .email('올바른 이메일 형식을 입력해주세요.')

// 비밀번호 검증
export const passwordSchema = z
  .string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
  .regex(
    /(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/,
    '비밀번호는 영문, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.'
  )

// 닉네임 검증
export const usernameSchema = z
  .string()
  .min(2, '닉네임은 2자 이상이어야 합니다.')
  .max(20, '닉네임은 20자 이하여야 합니다.')
  .regex(/^[a-zA-Z0-9가-힣_]+$/, '닉네임은 영문, 숫자, 한글, 언더스코어만 사용할 수 있습니다.')

// ID 검증 (양수 정수)
export const idSchema = z
  .union([z.string(), z.number()])
  .transform((val) => {
    const num = typeof val === 'string' ? parseInt(val, 10) : val
    if (isNaN(num) || num <= 0) {
      throw new Error('유효하지 않은 ID입니다.')
    }
    return num
  })

// 상태 검증
export const enrollmentStatusSchema = z.enum(['pending', 'approved', 'rejected', 'completed', 'cancelled'])
export const reviewStatusSchema = z.enum(['pending', 'approved', 'rejected'])

// 리뷰 평점 검증
export const ratingSchema = z
  .union([z.string(), z.number()])
  .transform((val) => {
    const num = typeof val === 'string' ? parseInt(val, 10) : val
    if (isNaN(num) || num < 1 || num > 5) {
      throw new Error('평점은 1부터 5까지의 숫자여야 합니다.')
    }
    return num
  })

// 검색어 검증
export const searchQuerySchema = z
  .union([
    z.string().max(100, '검색어는 100자를 초과할 수 없습니다.'),
    z.literal(''),
    z.undefined()
  ])
  .optional()
  .transform((val) => {
    if (!val || val === '') return undefined
    return val.trim()
  })

// 페이지네이션 검증
export const paginationSchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseInt(val, 10) : val
      return Math.max(1, isNaN(num) ? 1 : num)
    })
    .default(1),
  limit: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseInt(val, 10) : val
      return Math.min(100, Math.max(1, isNaN(num) ? 20 : num))
    })
    .default(20),
})

// 로그인 스키마
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
})

// 회원가입 스키마
export const signupSchema = z.object({
  email: emailSchema,
  nickname: usernameSchema,
  password: passwordSchema,
  game: z.string().optional(),
  level: z.string().optional(),
})

// 수강 신청 스키마
export const enrollmentSchema = z.object({
  coachId: idSchema,
  message: z
    .string()
    .max(5000, '메시지는 5000자를 초과할 수 없습니다.')
    .nullable()
    .optional(),
})

// 수강 신청 상태 변경 스키마
export const enrollmentStatusUpdateSchema = z.object({
  status: enrollmentStatusSchema,
  coachMessage: z
    .string()
    .max(5000, '메시지는 5000자를 초과할 수 없습니다.')
    .nullable()
    .optional(),
})

// 리뷰 작성 스키마
export const reviewSchema = z.object({
  coachId: idSchema,
  userId: idSchema,
  rating: ratingSchema,
  comment: z
    .string()
    .max(2000, '리뷰 내용은 2000자를 초과할 수 없습니다.')
    .nullable()
    .optional(),
  verified: z.boolean().optional().default(false),
})

// 리뷰 상태 변경 스키마
export const reviewStatusUpdateSchema = z.object({
  verified: z.boolean(),
})

// 코치 검색/필터 스키마
export const coachSearchSchema = z.object({
  search: searchQuerySchema,
  specialty: z.string().optional(),
  tier: z.string().optional(),
  minPrice: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined) return undefined
      const num = typeof val === 'string' ? parseInt(val, 10) : val
      return isNaN(num) ? undefined : num
    })
    .optional(),
  maxPrice: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined) return undefined
      const num = typeof val === 'string' ? parseInt(val, 10) : val
      return isNaN(num) ? undefined : num
    })
    .optional(),
  sortBy: z.enum(['latest', 'rating-high', 'rating-low', 'price-high', 'price-low', 'students']).optional(),
  page: paginationSchema.shape.page,
  limit: paginationSchema.shape.limit,
})

// 코치 일정 스키마
export const coachScheduleSchema = z.object({
  schedules: z
    .array(
      z.object({
        dayOfWeek: z.number().min(0).max(6),
        enabled: z.boolean(),
        startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, '올바른 시간 형식이 아닙니다. (HH:mm)'),
        endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, '올바른 시간 형식이 아닙니다. (HH:mm)'),
      })
    )
    .length(7, '7일치 일정이 필요합니다.'),
})

// 입력 sanitization 헬퍼 함수
export function sanitizeString(input: string): string {
  // HTML 태그 제거
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/&[^;]+;/g, '')
    .trim()
}

export function sanitizeSearchQuery(input: string): string {
  // 검색어에서 특수 문자 제거 (SQL Injection 방지)
  // Drizzle ORM이 파라미터화된 쿼리를 사용하지만, 추가 보안을 위해 sanitization 수행
  return input
    .replace(/[;'"\\]/g, '')
    .replace(/--/g, '') // SQL 주석 제거
    .replace(/\/\*/g, '') // SQL 주석 제거
    .replace(/\*\//g, '') // SQL 주석 제거
    .trim()
    .slice(0, 100) // 최대 100자
}

// SQL Injection 방지를 위한 추가 검증
export function validateSqlInput(input: any): boolean {
  if (typeof input !== 'string') return true
  
  // 위험한 SQL 키워드 패턴 검사
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/i,
    /(--|\/\*|\*\/|;)/,
    /(\bOR\b.*\b1\b.*\b=\b.*\b1\b)/i,
    /(\bAND\b.*\b1\b.*\b=\b.*\b1\b)/i,
  ]
  
  return !dangerousPatterns.some(pattern => pattern.test(input))
}

// 숫자 입력 검증 (SQL Injection 방지)
export function sanitizeNumericInput(input: any): number | null {
  if (typeof input === 'number') {
    return isNaN(input) || !isFinite(input) ? null : input
  }
  
  if (typeof input === 'string') {
    const num = parseFloat(input)
    return isNaN(num) || !isFinite(num) ? null : num
  }
  
  return null
}

