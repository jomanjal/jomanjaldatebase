import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { sql } from 'drizzle-orm'
import * as schema from './schema'

// PostgreSQL 연결 풀 생성
// DATABASE_URL이 undefined일 경우를 대비한 기본값 설정
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.')
}

// Supabase 연결 풀러 최적화
// ⚠️ 중요: Supabase 세션 모드에서는 연결 풀 크기가 매우 제한적입니다 (1-2개)
// Transaction 모드(포트 6543)는 더 많은 연결을 허용합니다 (15-20개)
const isSupabase = connectionString.includes('supabase')
const isTransactionMode = connectionString.includes(':6543')
const poolConfig: any = {
  connectionString: connectionString,
  // Transaction 모드: 15개, Session 모드: 1개, 일반 PostgreSQL: 20개
  max: isTransactionMode ? 15 : (isSupabase ? 1 : 20),
  min: isTransactionMode ? 2 : (isSupabase ? 1 : 2),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: isSupabase ? 10000 : 30000, // Supabase: 10초 (빠른 실패), 일반: 30초
  // 연결 재시도 설정
  allowExitOnIdle: false,
  // SSL 설정 (Supabase는 SSL 필수)
  ssl: isSupabase ? { rejectUnauthorized: false } : (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false),
  // 연결 재사용 설정
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
}

const pool = new Pool(poolConfig)

// 연결 오류 처리
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  // 연결 오류 시 재연결 시도
  if (err.message.includes('terminated') || err.message.includes('timeout') || err.message.includes('MaxClients')) {
    console.warn('데이터베이스 연결 오류 발생. 재연결을 시도합니다...')
  }
})

// 연결 테스트
pool.on('connect', () => {
  console.log('✅ 데이터베이스 연결 성공')
})

pool.on('acquire', () => {
  // 연결 획득 시 (디버깅용, 프로덕션에서는 제거 가능)
})

// Drizzle ORM 인스턴스 생성
export const db = drizzle(pool, { schema })

/**
 * RLS 정책을 위한 사용자 컨텍스트 설정
 * 공개 조회용 엔드포인트에서 사용
 * 트랜잭션을 사용하여 같은 세션에서 실행 보장
 */
export async function setRLSContext(userId: number | null, userRole: string | null) {
  try {
    // 트랜잭션을 사용하여 같은 세션에서 실행
    await db.transaction(async (tx) => {
      if (userId && userRole) {
        await tx.execute(sql`SELECT set_current_user(${userId}, ${userRole})`)
      } else {
        // 익명 사용자로 설정
        await tx.execute(sql`SELECT set_current_user(0, 'anonymous')`)
      }
    })
  } catch (error) {
    console.error('RLS context 설정 실패:', error)
    // RLS 설정 실패해도 계속 진행 (RLS가 비활성화된 경우)
  }
}

/**
 * RLS 컨텍스트를 설정한 후 쿼리를 실행하는 헬퍼 함수
 * 트랜잭션을 사용하여 같은 세션에서 실행 보장
 * 
 * ⚠️ Supabase 세션 모드에서는 연결 풀이 1개로 제한되므로,
 * 트랜잭션 사용 시 연결 점유 시간을 최소화해야 합니다.
 */
export async function withRLSContext<T>(
  userId: number | null,
  userRole: string | null,
  queryFn: (tx: typeof db) => Promise<T>
): Promise<T> {
  // Supabase 세션 모드에서는 연결 타임아웃이 짧으므로 빠르게 실패하고 재시도
  const maxRetries = isSupabase ? 2 : 1
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await db.transaction(async (tx) => {
        try {
          // RLS 컨텍스트 설정
          if (userId && userRole) {
            await tx.execute(sql`SELECT set_current_user(${userId}, ${userRole})`)
          } else {
            await tx.execute(sql`SELECT set_current_user(0, 'anonymous')`)
          }
          // 쿼리 실행
          return await queryFn(tx as typeof db)
        } catch (error) {
          // 트랜잭션 내 에러 발생 시 롤백 보장
          throw error
        }
      })
    } catch (error: any) {
      lastError = error
      // MaxClients 또는 timeout 에러인 경우 재시도
      if (
        (error?.message?.includes('MaxClients') || 
         error?.message?.includes('timeout') ||
         error?.code === 'XX000') &&
        attempt < maxRetries - 1
      ) {
        // 짧은 대기 후 재시도 (100ms * attempt)
        await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)))
        continue
      }
      throw error
    }
  }
  
  throw lastError || new Error('RLS context 설정 실패')
}

// 스키마 export
export * from './schema'

