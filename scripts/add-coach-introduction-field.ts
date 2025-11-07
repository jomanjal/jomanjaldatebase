/**
 * 코치 테이블에 coach_introduction 컬럼 추가 스크립트
 */

// 환경 변수 로드 (가장 먼저!)
import { config } from 'dotenv'
import path from 'path'
config({ path: path.resolve(process.cwd(), '.env.local') })

async function addCoachIntroductionField() {
  // 환경 변수 로드 후에 동적으로 모듈 import
  const { db } = await import('../lib/db')
  const { sql } = await import('drizzle-orm')
  
  try {
    console.log('🚀 코치 테이블에 coach_introduction 컬럼 추가 중...\n')

    // 컬럼 추가
    await db.execute(sql`
      ALTER TABLE coaches 
      ADD COLUMN IF NOT EXISTS coach_introduction TEXT;
    `)

    console.log('✅ 컬럼 추가 완료!')
    console.log('\n📋 기존 데이터 마이그레이션 중...\n')

    // 기존 introductionContent에서 __coachIntroduction__ 추출하여 coach_introduction에 저장
    const allCoaches = await db.execute(sql`
      SELECT id, introduction_content 
      FROM coaches 
      WHERE introduction_content IS NOT NULL
    `)

    let migratedCount = 0

    for (const coach of allCoaches.rows) {
      const coachData = coach as any
      if (!coachData.introduction_content) continue

      try {
        const introductionItems = JSON.parse(coachData.introduction_content)
        if (!Array.isArray(introductionItems)) continue

        const coachIntroItem = introductionItems.find((item: any) => item.title === "__coachIntroduction__")
        
        if (coachIntroItem && coachIntroItem.content) {
          await db.execute(sql`
            UPDATE coaches 
            SET coach_introduction = ${coachIntroItem.content}
            WHERE id = ${coachData.id}
          `)
          console.log(`✅ 코치 ID ${coachData.id}: 코치 소개 마이그레이션 완료`)
          migratedCount++
        }
      } catch (error: any) {
        console.error(`❌ 코치 ID ${coachData.id} 처리 중 오류:`, error.message)
      }
    }

    console.log(`\n✅ 마이그레이션 완료! 총 ${migratedCount}명의 코치 데이터가 업데이트되었습니다.`)
  } catch (error: any) {
    console.error('❌ 오류 발생:', error.message)
    throw error
  }
}

addCoachIntroductionField()
  .then(() => {
    console.log('\n✅ 모든 작업이 완료되었습니다.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ 작업 실패:', error)
    process.exit(1)
  })



