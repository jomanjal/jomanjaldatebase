/**
 * reviews 테이블에 verified 컬럼 추가 스크립트
 * 사용법: pnpm tsx scripts/add-review-verified.ts
 */

import { config } from 'dotenv'
import path from 'path'
config({ path: path.resolve(process.cwd(), '.env.local') })

async function addVerifiedColumn() {
  try {
    const { db } = await import('../lib/db')
    const { sql } = await import('drizzle-orm')

    console.log('🔧 reviews 테이블에 verified 컬럼 추가 중...\n')

    // 컬럼 추가 시도
    try {
      await db.execute(sql`
        ALTER TABLE reviews 
        ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false NOT NULL;
      `)
      console.log('✅ verified 컬럼이 추가되었습니다.')
    } catch (error: any) {
      // 이미 존재하는 경우 무시
      if (error.message?.includes('already exists') || error.code === '42701') {
        console.log('💡 verified 컬럼이 이미 존재합니다.')
      } else {
        throw error
      }
    }

    console.log('\n✅ 완료되었습니다.')
  } catch (error: any) {
    console.error('❌ 오류 발생:', error.message)
    console.error('상세 오류:', error)
    process.exit(1)
  }
}

addVerifiedColumn().then(() => {
  process.exit(0)
})

