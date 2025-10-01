import { NextResponse } from 'next/server'

// 실제로는 데이터베이스에서 가져옴
const reviews = [
  {
    id: 1,
    user: "수확_코**",
    rating: 5,
    timeAgo: "4분전",
    review: "매우 도움됫습니다",
    course: {
      title: "여러분을 위한 모든 라인 강의_2시간",
      thumbnail: "여러분을 위한 모든 라인 강의",
      rating: 5.0,
      reviewCount: 2
    }
  },
  // ... 더 많은 리뷰 데이터
]

export async function GET() {
  // 서버에서 데이터 검증 및 처리
  const validatedReviews = reviews.map(review => ({
    ...review,
    // 민감한 정보는 서버에서만 처리
    serverTimestamp: new Date().toISOString(),
    verified: true
  }))

  return NextResponse.json({
    success: true,
    data: validatedReviews,
    totalCount: reviews.length
  })
}
