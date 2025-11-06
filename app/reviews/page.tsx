"use client"

import { Header } from "@/components/header"
import { FooterSection } from "@/components/footer-section"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, ChevronRight, Loader2, SlidersHorizontal } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { ErrorDisplay } from "@/components/error-display"
import { sanitizeText } from "@/lib/dompurify-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

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
  const [error, setError] = useState<Error | null>(null) // 에러 상태 추가
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  })

  // 서버에서 데이터 가져오기
  useEffect(() => {
    async function fetchReviews() {
      setLoading(true)
      setError(null) // 에러 초기화
      
      try {
        const params = new URLSearchParams()
        params.append('verified', 'true')
        params.append('page', currentPage.toString())
        params.append('limit', '20')
        
        const response = await fetch(`/api/reviews?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        if (data.success) {
          setReviews(data.data || [])
          setTotalCount(data.totalCount || 0)
          if (data.pagination) {
            setPagination(data.pagination)
          }
        } else {
          throw new Error(data.message || '리뷰 데이터를 불러오는데 실패했습니다.')
        }
      } catch (error) {
        console.error('리뷰 데이터 로드 실패:', error)
        setError(error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.'))
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [currentPage])
  
  // 카테고리나 필터 변경 시 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, showPerformanceOnly, sortBy])

  // 게임 카테고리 필터링 및 정렬
  // 주의: 현재는 서버에서 페이지네이션된 데이터를 받지만,
  // 클라이언트 사이드 필터링/정렬도 필요하므로 유지
  // 향후 서버 사이드 정렬로 전환 가능
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
  
  // 페이지네이션 페이지 번호 생성
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const totalPages = pagination.totalPages
    const current = pagination.page

    if (totalPages <= 7) {
      // 7페이지 이하면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 첫 페이지
      pages.push(1)

      if (current > 3) {
        pages.push('ellipsis')
      }

      // 현재 페이지 주변
      const start = Math.max(2, current - 1)
      const end = Math.min(totalPages - 1, current + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (current < totalPages - 2) {
        pages.push('ellipsis')
      }

      // 마지막 페이지
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* 페이지 헤더 */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground mb-4">
              {totalCount > 0 ? `${totalCount.toLocaleString()}개의 후기로 증명된 강의 만족도` : "24,676개의 후기로 증명된 강의 만족도"}
            </h1>
            <p className="text-sm text-[var(--text04)] mb-6">
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
            <SlidersHorizontal className="w-4 h-4 text-[var(--text04)]" />
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
                    : "bg-white text-foreground border-[var(--divider01)] hover:bg-accent"
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
          {error ? (
            <ErrorDisplay 
              error={error} 
              onRetry={() => {
                setError(null)
                window.location.reload()
              }} 
            />
          ) : loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--primary01)] mx-auto mb-4" />
              <p className="text-[var(--text04)]">리뷰를 불러오는 중...</p>
            </div>
          ) : filteredAndSortedReviews.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm text-[var(--text04)]">
                {selectedCategory !== "all" || showPerformanceOnly
                  ? '조건에 맞는 리뷰가 없습니다.' 
                  : '등록된 리뷰가 없습니다.'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {filteredAndSortedReviews.map((review) => (
                  <Card key={review.id} className="overflow-hidden hover:shadow-[var(--shadow-md)] transition-shadow">
                    <CardContent className="p-3">
                      {/* 후기 헤더 */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? "text-[var(--textYellow)] fill-current" : "text-[var(--text04)] opacity-30"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium text-foreground">{review.userName}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-[var(--text04)]">
                          <Clock className="w-4 h-4" />
                          <span>{review.timeAgo}</span>
                        </div>
                      </div>

                      {/* 후기 내용 */}
                      {review.comment && (
                        <p className="text-foreground mb-4 leading-relaxed">
                          {sanitizeText(review.comment)}
                        </p>
                      )}

                      {/* 연결된 코치 정보 */}
                      <div className="bg-accent/20 rounded-md p-4 border border-accent/30">
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
                                    <Star className="w-3 h-3 text-[var(--textYellow)] fill-current" />
                                    <span className="text-xs text-[var(--text04)]">
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
                  <p className="text-xs text-[var(--text04)]">
                    총 {totalCount.toLocaleString()}개 중 {filteredAndSortedReviews.length}개의 리뷰가 표시되고 있습니다.
                  </p>
                </div>
              )}
              
              {/* 페이지네이션 */}
              {!loading && pagination.totalPages >= 1 && pagination.totalCount > 0 && (
                <div className="mt-12">
                  <Pagination className="w-full">
                    <PaginationContent className="flex-wrap justify-center">
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (pagination.hasPrevPage) {
                              setCurrentPage(pagination.page - 1)
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }
                          }}
                          className={!pagination.hasPrevPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>

                      {getPageNumbers().map((pageNum, index) => {
                        if (pageNum === 'ellipsis') {
                          return (
                            <PaginationItem key={`ellipsis-${index}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )
                        }

                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage(pageNum)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}
                              isActive={pageNum === pagination.page}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      })}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (pagination.hasNextPage) {
                              setCurrentPage(pagination.page + 1)
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }
                          }}
                          className={!pagination.hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
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
