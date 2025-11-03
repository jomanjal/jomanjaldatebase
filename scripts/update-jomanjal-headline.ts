// 환경 변수 로드
import { config } from 'dotenv'
import path from 'path'
config({ path: path.resolve(process.cwd(), '.env.local') })

/**
 * 코치 ID 5 (Jomanjal)에 headline 업데이트
 */
async function updateJomanjalHeadline() {
  // 환경 변수 로드 후에 동적으로 모듈 import
  const { db } = await import('../lib/db')
  const { coaches } = await import('../lib/db/schema')
  const { eq } = await import('drizzle-orm')
  
  try {
    const coachId = 5

    const [updatedCoach] = await db.update(coaches)
      .set({
        headline: "에임, 피지컬 강의 국내 No.1",
      })
      .where(eq(coaches.id, coachId))
      .returning({
        id: coaches.id,
        name: coaches.name,
        headline: coaches.headline,
      })

    if (updatedCoach) {
      console.log(`✅ 코치 ID ${coachId} (Jomanjal) headline 업데이트 완료!`)
      console.log('업데이트된 데이터:', updatedCoach)
    } else {
      console.log(`❌ 코치 ID ${coachId}를 찾을 수 없습니다.`)
    }
  } catch (error) {
    console.error('❌ 코치 업데이트 중 오류 발생:', error)
  }
}

updateJomanjalHeadline().then(() => {
  process.exit(0)
})

