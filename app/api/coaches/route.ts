import { NextResponse } from 'next/server'

const coaches = [
  {
    id: 1,
    name: "김프로",
    game: "리그 오브 레전드",
    tier: "챌린저",
    experience: "5년",
    rating: 4.9,
    students: 120,
    price: "50,000원/시간",
    specialties: ["정글", "미드", "라인전"],
    description: "프로팀 코치 출신으로 정글과 미드 라인 전문가입니다.",
    verified: true,
    serverTimestamp: new Date().toISOString()
  },
  // ... 더 많은 코치 데이터
]

export async function GET() {
  // 서버에서 데이터 검증
  const validatedCoaches = coaches.map(coach => ({
    ...coach,
    // 가격 정보는 서버에서만 처리
    priceDisplay: coach.price,
    // 실제 가격은 숨김
    actualPrice: null
  }))

  return NextResponse.json({
    success: true,
    data: validatedCoaches,
    totalCount: coaches.length
  })
}
