/**
 * introductionContent에서 __positions__와 __agents__ 항목 제거 스크립트
 */

// 환경 변수 로드 (가장 먼저!)
import { config } from 'dotenv'
import path from 'path'
config({ path: path.resolve(process.cwd(), '.env.local') })

async function removePositionsAndAgents() {
  // 환경 변수 로드 후에 동적으로 모듈 import
  const { db } = await import('../lib/db')
  const { coaches } = await import('../lib/db/schema')
  const { eq, isNotNull } = await import('drizzle-orm')
  try {
    console.log('🚀 introductionContent에서 __positions__와 __agents__ 항목 제거 중...\n')

    // 모든 코치 조회
    const allCoaches = await db.select().from(coaches).where(isNotNull(coaches.introductionContent))

    console.log(`총 ${allCoaches.length}명의 코치 데이터를 확인합니다.\n`)

    let updatedCount = 0

    for (const coach of allCoaches) {
      if (!coach.introductionContent) continue

      try {
        // JSON 파싱
        const introductionItems = JSON.parse(coach.introductionContent)
        
        if (!Array.isArray(introductionItems)) {
          console.log(`⚠️  코치 ID ${coach.id}: introductionContent가 배열 형식이 아닙니다. 건너뜁니다.`)
          continue
        }

        // __positions__와 __agents__ 항목 제거
        const filteredItems = introductionItems.filter(
          (item: any) => item.title !== "__positions__" && item.title !== "__agents__"
        )

        // 변경사항이 있는 경우에만 업데이트
        if (filteredItems.length !== introductionItems.length) {
          const updatedContent = JSON.stringify(filteredItems)
          
          await db
            .update(coaches)
            .set({ 
              introductionContent: updatedContent,
              updatedAt: new Date()
            })
            .where(eq(coaches.id, coach.id))

          console.log(`✅ 코치 ID ${coach.id} (${coach.name}): 포지션/요원 데이터 제거 완료`)
          updatedCount++
        }
      } catch (error: any) {
        console.error(`❌ 코치 ID ${coach.id} 처리 중 오류:`, error.message)
      }
    }

    console.log(`\n✅ 작업 완료! 총 ${updatedCount}명의 코치 데이터가 업데이트되었습니다.`)
  } catch (error: any) {
    console.error('❌ 오류 발생:', error.message)
    throw error
  }
}

removePositionsAndAgents()
  .then(() => {
    console.log('\n✅ 모든 작업이 완료되었습니다.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ 작업 실패:', error)
    process.exit(1)
  })

