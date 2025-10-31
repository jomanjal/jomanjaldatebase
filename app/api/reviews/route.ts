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
  {
    id: 2,
    user: "여왕의_**",
    rating: 5,
    timeAgo: "48분전",
    review: "개인적으로 척후대를 배우시는 분들이 찾아가시면 더 좋을 거 같습니다. 강사님이 척후대를 통한 운영이나 스킬 활용에 대해서 친절히 알려주셔서 더 유익할 거 같습니다.",
    course: {
      title: "[척후대] 입문자부터 불멸까지 해당 티어때 반드시 알아야하는 기술을 알려드리겠습니다",
      thumbnail: "[척후대] 입문자부터 불멸까지",
      rating: 5.0,
      reviewCount: 1
    }
  },
  {
    id: 3,
    user: "게임마스터**",
    rating: 5,
    timeAgo: "1시간전",
    review: "정말 체계적으로 잘 가르쳐주셔서 실력이 많이 늘었어요! 추천합니다.",
    course: {
      title: "발로란트 에이밍 마스터 클래스",
      thumbnail: "발로란트 에이밍 마스터",
      rating: 4.9,
      reviewCount: 15
    }
  },
  {
    id: 4,
    user: "프로게이머**",
    rating: 4,
    timeAgo: "2시간전",
    review: "좋은 강의였지만 조금 더 실전적인 팁이 있었으면 좋겠어요.",
    course: {
      title: "오버워치2 탱커 가이드",
      thumbnail: "오버워치2 탱커 가이드",
      rating: 4.7,
      reviewCount: 8
    }
  },
  {
    id: 5,
    user: "배그킹**",
    rating: 5,
    timeAgo: "3시간전",
    review: "배틀그라운드 포지셔닝에 대해 정말 자세히 알려주셔서 감사합니다!",
    course: {
      title: "배틀그라운드 포지셔닝 완벽 가이드",
      thumbnail: "배틀그라운드 포지셔닝",
      rating: 4.8,
      reviewCount: 23
    }
  },
  {
    id: 6,
    user: "롤천재**",
    rating: 5,
    timeAgo: "5시간전",
    review: "라인전에서 정말 많은 도움을 받았습니다. 강사님 덕분에 티어가 올랐어요!",
    course: {
      title: "리그오브레전드 라인전 마스터",
      thumbnail: "리그오브레전드 라인전",
      rating: 4.9,
      reviewCount: 31
    }
  }
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
