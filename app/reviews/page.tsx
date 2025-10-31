"use client"

import { Header } from "@/components/header"
import { FooterSection } from "@/components/footer-section"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"

// 게임 카테고리 데이터
const gameCategories = [
  { id: "all", name: "전체", icon: "⚡" },
  { id: "lol", name: "리그오브레전드", icon: "⚔️" },
  { id: "valorant", name: "발로란트", icon: "🎯" },
  { id: "tft", name: "전략적팀전투", icon: "♟️" },
  { id: "pubg", name: "배틀그라운드", icon: "🏹" },
  { id: "overwatch", name: "오버워치", icon: "🛡️" },
  { id: "fc", name: "FC 온라인", icon: "⚽" },
  { id: "tekken", name: "철권", icon: "👊" },
  { id: "starcraft", name: "스타크래프트", icon: "🚀" },
  { id: "apex", name: "에이펙스레전드", icon: "🔫" }
]

// 수업후기 데이터
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

export default function ReviewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showPerformanceOnly, setShowPerformanceOnly] = useState(false)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  // 서버에서 데이터 가져오기
  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch('/api/reviews')
        const data = await response.json()
        if (data.success) {
          setReviews(data.data)
        }
      } catch (error) {
        console.error('리뷰 데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [])

  const filteredReviews = reviews.filter((review: any) => {
    if (showPerformanceOnly && review.rating < 5) return false
    return true
  })

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* 페이지 헤더 */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              24,676개의 후기로 증명된 강의 만족도
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              🔥 실시간으로 올라오는 진짜 후기! 🔥
            </p>
            
            {/* 성과 후기만 보기 체크박스 */}
            <div className="flex justify-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPerformanceOnly}
                  onChange={(e) => setShowPerformanceOnly(e.target.checked)}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm text-foreground">성과 후기만 보기</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* 게임 카테고리 필터 */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 overflow-x-auto pb-4">
            {gameCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 whitespace-nowrap ${
                  selectedCategory === category.id
                    ? "bg-primary text-white"
                    : "bg-white text-foreground border-border hover:bg-accent"
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </Button>
            ))}
            <Button variant="outline" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* 수업후기 목록 */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">리뷰를 불러오는 중...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredReviews.map((review: any) => (
              <Card key={review.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* 후기 헤더 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium text-foreground">{review.user}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{review.timeAgo}</span>
                    </div>
                  </div>

                  {/* 후기 내용 */}
                  <p className="text-foreground mb-4 leading-relaxed">
                    {review.review}
                  </p>

                  {/* 연결된 강의 정보 */}
                  <div className="bg-accent/20 rounded-lg p-4 border border-accent/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-12 bg-primary/20 rounded flex items-center justify-center">
                          <span className="text-xs font-medium text-primary text-center px-2">
                            {review.course.thumbnail}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground mb-1">
                            {review.course.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-muted-foreground">
                                {review.course.rating} ({review.course.reviewCount}건)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}

          {/* 더보기 버튼 */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              더 많은 후기 보기
            </Button>
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  )
}
