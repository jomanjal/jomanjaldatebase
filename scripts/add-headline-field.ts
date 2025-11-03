// 환경 변수 로드
import { config } from 'dotenv'
import path from 'path'
config({ path: path.resolve(process.cwd(), '.env.local') })

/**
 * 코치 테이블에 headline 필드 추가 스크립트
 */
async function addHeadlineField() {
  // 환경 변수 로드 후에 동적으로 모듈 import
  const { db } = await import('../lib/db')
  const { sql } = await import('drizzle-orm')
  
  try {
    // headline 컬럼이 이미 있는지 확인
    const checkColumn = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'coaches' AND column_name = 'headline'
    `)

    if (checkColumn.rows && checkColumn.rows.length > 0) {
      console.log('✅ headline 컬럼이 이미 존재합니다.')
      return
    }

    // headline 컬럼 추가
    await db.execute(sql`
      ALTER TABLE coaches 
      ADD COLUMN headline TEXT
    `)

    console.log('✅ headline 컬럼이 추가되었습니다.')
  } catch (error: any) {
    console.error('❌ 오류 발생:', error.message)
    throw error
  } finally {
    process.exit(0)
  }
}

addHeadlineField()

