"use client"

import { Header } from "@/components/header"
import { FooterSection } from "@/components/footer-section"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, ChevronRight, Loader2, SlidersHorizontal } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 게임 카테고리 데이터 (API의 coachSpecialty와 매핑)
const gameCategories = [
  { id: "all", name: "전체", icon: "⚡", specialties: [] },
  { id: "lol", name: "리그오브레전드", icon: "⚔️", specialties: ["리그 오브 레전드", "리그오브레전드"] },
  { id: "valorant", name: "발로란트", icon: "🎯", specialties: ["발로란트"] },
  { id: "pubg", name: "배틀그라운드", icon: "🏹", specialties: ["배틀그라운드"] },
  { id: "overwatch", name: "오버워치", icon: "🛡️", specialties: ["오버워치 2", "오버워치"] },
]

// 정렬 옵션
const sortOptions = [
  { id: "latest", name: "최신순" },
  { id: "rating-high", name: "평점 높은순" },
  { id: "rating-low", name: "평점 낮은순" },
]

interface Review {
  id: number
  coachId: number
  userId: number
  rating: number
  comment: string
  verified: boolean
  createdAt: string
  coachName: string
  coachSpecialty: string
  userName: string
  timeAgo: string
}

export default function ReviewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showPerformanceOnly, setShowPerformanceOnly] = useState(false)
  const [sortBy, setSortBy] = useState<"latest" | "rating-high" | "rating-low">("latest")
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  // 서버에서 데이터 가져오기
  useEffect(() => {
    async function fetchReviews() {
      setLoading(true)
      try {
        // 승인된 리뷰만 가져오기
        const response = await fetch('/api/reviews?verified=true')
        const data = await response.json()
        if (data.success) {
          setReviews(data.data || [])
          setTotalCount(data.totalCount || 0)
        }
      } catch (error) {
        console.error('리뷰 데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [])

  // 게임 카테고리 필터링 및 정렬
  const filteredAndSortedReviews = useMemo(() => {
    let filtered = [...reviews]

    // 게임 카테고리 필터
    if (selectedCategory !== "all") {
      const category = gameCategories.find(cat => cat.id === selectedCategory)
      if (category) {
        filtered = filtered.filter(review => 
          category.specialties.includes(review.coachSpecialty)
        )
      }
    }

    // 성과 후기만 보기 필터
    if (showPerformanceOnly) {
      filtered = filtered.filter(review => review.rating === 5)
    }

    // 정렬
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "latest") {
        // 최신순 (createdAt 기준)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else if (sortBy === "rating-high") {
        // 평점 높은순
        if (b.rating !== a.rating) {
          return b.rating - a.rating
        }
        // 평점이 같으면 최신순
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else if (sortBy === "rating-low") {
        // 평점 낮은순
        if (a.rating !== b.rating) {
          return a.rating - b.rating
        }
        // 평점이 같으면 최신순
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return 0
    })

    return sorted
  }, [reviews, selectedCategory, showPerformanceOnly, sortBy])

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* 페이지 헤더 */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {totalCount > 0 ? `${totalCount.toLocaleString()}개의 후기로 증명된 강의 만족도` : "24,676개의 후기로 증명된 강의 만족도"}
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

      {/* 게임 카테고리 필터 및 정렬 */}
      <section className="py-8 bg-white border-b dark:bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 정렬 옵션 */}
          <div className="flex items-center justify-end gap-2 mb-4">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(value: "latest" | "rating-high" | "rating-low") => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 게임 카테고리 필터 */}
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
          </div>
        </div>
      </section>

      {/* 수업후기 목록 */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">리뷰를 불러오는 중...</p>
            </div>
          ) : filteredAndSortedReviews.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">
                {selectedCategory !== "all" || showPerformanceOnly
                  ? '조건에 맞는 리뷰가 없습니다.' 
                  : '등록된 리뷰가 없습니다.'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {filteredAndSortedReviews.map((review) => (
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
                          <span className="font-medium text-foreground">{review.userName}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{review.timeAgo}</span>
                        </div>
                      </div>

                      {/* 후기 내용 */}
                      {review.comment && (
                        <p className="text-foreground mb-4 leading-relaxed">
                          {review.comment}
                        </p>
                      )}

                      {/* 연결된 코치 정보 */}
                      <div className="bg-accent/20 rounded-lg p-4 border border-accent/30">
                        <Link href={`/coaches/${review.coachId}`}>
                          <div className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="flex items-center space-x-4 flex-1">
                              <div className="w-16 h-12 bg-primary/20 rounded flex items-center justify-center">
                                <span className="text-xs font-medium text-primary text-center px-2 line-clamp-2">
                                  {review.coachSpecialty}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-foreground mb-1 truncate">
                                  {review.coachName} 코치
                                </h4>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {review.coachSpecialty}
                                  </Badge>
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                    <span className="text-xs text-muted-foreground">
                                      {review.rating}.0
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="ml-2">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 결과 개수 표시 */}
              {filteredAndSortedReviews.length > 0 && (
                <div className="text-center mt-8">
                  <p className="text-sm text-muted-foreground">
                    총 {filteredAndSortedReviews.length}개의 리뷰가 표시되고 있습니다.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <FooterSection />
    </main>
  )
}
