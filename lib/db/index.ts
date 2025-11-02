import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

// PostgreSQL 연결 풀 생성
// DATABASE_URL이 undefined일 경우를 대비한 기본값 설정
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.')
}

const pool = new Pool({
  connectionString: connectionString,
  // 연결 옵션 추가
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// 연결 오류 처리
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

// Drizzle ORM 인스턴스 생성
export const db = drizzle(pool, { schema })

// 스키마 export
export * from './schema'

