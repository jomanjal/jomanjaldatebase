/**
 * 코치 테이블에 상세 페이지 구성 필드 추가 스크립트
 */

import { db } from '../lib/db'

async function addCoachDetailFields() {
  try {
    console.log('🚀 코치 테이블에 상세 정보 필드 추가 중...\n')

    // SQL을 직접 실행하여 컬럼 추가
    await db.execute(`
      ALTER TABLE coaches 
      ADD COLUMN IF NOT EXISTS introduction_image TEXT,
      ADD COLUMN IF NOT EXISTS introduction_content TEXT,
      ADD COLUMN IF NOT EXISTS curriculum_items TEXT DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS total_course_time VARCHAR(50);
    `)

    console.log('✅ 필드 추가 완료!')
  } catch (error: any) {
    console.error('❌ 오류 발생:', error.message)
    throw error
  }
}

addCoachDetailFields()
  .then(() => {
    console.log('\n✅ 작업 완료')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ 작업 실패:', error)
    process.exit(1)
  })

