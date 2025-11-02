/**
 * coaches 테이블의 user_id 컬럼을 nullable로 변경하는 스크립트
 * 사용법: pnpm tsx scripts/fix-userid-nullable.ts
 */

// 환경 변수 로드
import { config } from 'dotenv'
import path from 'path'
config({ path: path.resolve(process.cwd(), '.env.local') })

async function fixUserIdNullable() {
  try {
    // 환경 변수 로드 후에 동적으로 모듈 import
    const { db } = await import('../lib/db')
    const { sql } = await import('drizzle-orm')

    console.log('🔧 coaches 테이블의 user_id 컬럼을 nullable로 변경 중...\n')

    // NOT NULL 제약 제거
    await db.execute(sql`
      ALTER TABLE coaches 
      ALTER COLUMN user_id DROP NOT NULL;
    `)

    console.log('✅ user_id 컬럼의 NOT NULL 제약이 제거되었습니다.')
    console.log('이제 코치를 추가할 때 userId를 null로 설정할 수 있습니다.\n')
  } catch (error: any) {
    console.error('❌ 오류 발생:', error.message)
    
    if (error.code === '42804' || error.message.includes('already')) {
      console.log('💡 제약이 이미 제거되었거나 존재하지 않을 수 있습니다.')
    } else {
      console.error('상세 오류:', error)
    }
    
    process.exit(1)
  }
}

fixUserIdNullable().then(() => {
  process.exit(0)
})

