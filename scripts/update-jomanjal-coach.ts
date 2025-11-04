// 환경 변수 로드
import { config } from 'dotenv'
import path from 'path'
config({ path: path.resolve(process.cwd(), '.env.local') })

/**
 * 코치 ID 5 (Jomanjal)에 하드코딩된 데이터를 DB에 업데이트
 */
async function updateJomanjalCoach() {
  // 환경 변수 로드 후에 동적으로 모듈 import
  const { db } = await import('../lib/db')
  const { coaches } = await import('../lib/db/schema')
  const { eq } = await import('drizzle-orm')
  
  try {
    const coachId = 5

    const introductionContent = JSON.stringify([
      { title: "독자적 커리큘럼", content: "타 강사와 차별화된 수준 높은 독자적인 커리큘럼 제공." },
      { title: "대상", content: "초보자부터 프로 레벨까지 모든 수준에 도움되는 구성." },
      { title: "진행 방식", content: "", items: ["Aim Lab(스팀 설치)을 활용.", "강사가 직접 구성한 루틴 및 과제로 진행.", "10가지 시나리오로 구성된 루틴 제공."] },
      { title: "콘텐츠 제공", content: "", items: ["약 2,500자 분량의 알찬 설명 제공.", "명확한 목표 점수 제시 및 변화 체감 가능.", "천천히 진행 가능한 루틴 설계."] },
      { title: "장점 (무제한 소장)", content: "", items: ["글로 모두 작성되어 언제든지 복습 가능.", "콘텐츠 무제한 소장 가능."] },
      { title: "강의 환경", content: "", items: ["마이크 사용 불필요 (시간대 상관없이 진행 가능).", "디스코드 미사용.", "더 자세한 내용은 강의에서 확인 가능."] },
    ])

    const curriculumItems = JSON.stringify([
      { title: "[소장] 마이크를 사용하지 않고도 배울 수 있는 과제 형식의 독보적 커리큘럼", duration: "1시간" }
    ])

    const [updated] = await db.update(coaches)
      .set({
        introductionImage: "/Introduction.png",
        introductionContent: introductionContent,
        curriculumItems: curriculumItems,
        totalCourseTime: "1시간",
        discount: 50,
        price: 50000, // 가격 (원 단위 숫자)
      })
      .where(eq(coaches.id, coachId))
      .returning()

    if (updated) {
      console.log('✅ 코치 ID 5 (Jomanjal) 업데이트 완료!')
      console.log('업데이트된 데이터:', {
        id: updated.id,
        name: updated.name,
        introductionImage: updated.introductionImage,
        totalCourseTime: updated.totalCourseTime,
        discount: updated.discount,
      })
    } else {
      console.log('❌ 코치 ID 5를 찾을 수 없습니다.')
    }
  } catch (error) {
    console.error('❌ 업데이트 실패:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

updateJomanjalCoach()

