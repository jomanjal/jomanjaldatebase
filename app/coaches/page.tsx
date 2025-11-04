"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { FooterSection } from "@/components/footer-section"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, MapPin, Star, User, Search, Loader2, Percent, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// 게임 카테고리
const gameCategories = [
  { id: "all", name: "전체" },
  { id: "리그 오브 레전드", name: "리그 오브 레전드" },
  { id: "발로란트", name: "발로란트" },
  { id: "오버워치 2", name: "오버워치 2" },
  { id: "배틀그라운드", name: "배틀그라운드" },
]

// 티어 옵션 (모든 게임 통합)
const tierOptions = [
  { id: "all", name: "전체" },
  { id: "아이언", name: "아이언" },
  { id: "브론즈", name: "브론즈" },
  { id: "실버", name: "실버" },
  { id: "골드", name: "골드" },
  { id: "플래티넘", name: "플래티넘" },
  { id: "에메랄드", name: "에메랄드" },
  { id: "다이아", name: "다이아" },
  { id: "마스터", name: "마스터" },
  { id: "그랜드마스터", name: "그랜드마스터" },
  { id: "챌린저", name: "챌린저" },
  { id: "초월자", name: "초월자" },
  { id: "불멸", name: "불멸" },
  { id: "레디언트", name: "레디언트" },
]

// 가격대 옵션 (이미지 형식)
const priceRanges = [
  { id: "all", name: "가격", min: null, max: null },
  { id: "0-50k", name: "0~5만 원", min: "0", max: "50000" },
  { id: "50k-100k", name: "5~10만 원", min: "50000", max: "100000" },
  { id: "100k-200k", name: "10~20만 원", min: "100000", max: "200000" },
  { id: "200k-300k", name: "20~30만 원", min: "200000", max: "300000" },
  { id: "over300k", name: "30만 원 초과", min: "300000", max: null },
]

// 정렬 옵션
const sortOptions = [
  { id: "latest", name: "최신순" },
  { id: "rating-high", name: "평점 높은순" },
  { id: "rating-low", name: "평점 낮은순" },
  { id: "price-low", name: "가격 낮은순" },
  { id: "price-high", name: "가격 높은순" },
  { id: "students", name: "수강생 많은순" },
]

// 하드코딩된 오버라이드 데이터 (나중에 DB 연동 시 제거)
// 코치 ID 1 또는 5 (Jomanjal)에 적용할 오버라이드 데이터
// 주: 평점, 수강생, 후기는 아직 DB에 반영되지 않았으므로 임시로 오버라이드
//     가격 관련 필드(price, discount)는 DB에서 가져옴
const jomanjalOverrides = {
  rating: 5.0,
  reviews: 8,
  students: 200,
}

interface Coach {
  id: number
  name: string
  specialty: string
  tier: string
  experience: string
  rating: number
  reviews: number
  students: number
  price: number | null // 숫자로 변경
  discount: number | null
  specialties: string[]
  description: string | null
  thumbnailImage: string | null
  introductionImage: string | null
  verified: boolean
  active: boolean
}

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGame, setSelectedGame] = useState("all")
  const [selectedPriceRange, setSelectedPriceRange] = useState("all")
  const [sortBy, setSortBy] = useState("latest")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  })

  // 코치 목록 조회
  useEffect(() => {
    let isMounted = true

    async function fetchCoaches() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (searchQuery) params.append('search', searchQuery)
        if (selectedGame !== 'all') params.append('specialty', selectedGame)
        if (selectedPriceRange !== 'all') {
          const priceRange = priceRanges.find(r => r.id === selectedPriceRange)
          if (priceRange) {
            if (priceRange.min !== null) params.append('minPrice', priceRange.min)
            if (priceRange.max !== null) params.append('maxPrice', priceRange.max)
          }
        }
        params.append('sortBy', sortBy)
        params.append('page', currentPage.toString())
        params.append('limit', '20')

        const response = await fetch(`/api/coaches?${params.toString()}`)
        const result = await response.json()

        if (isMounted && result.success) {
          const dbCoaches = result.data || []
          
          // 페이지네이션 정보 저장
          if (result.pagination) {
            setPagination(result.pagination)
          }
          
          // ID 1 또는 5 (Jomanjal) 코치 찾기
          let jomanjalIndex = dbCoaches.findIndex((c: Coach) => c.id === 5 || c.id === 1)
          let jomanjal: Coach | null = null
          
          if (jomanjalIndex !== -1) {
            // DB에서 찾은 경우 오버라이드
            jomanjal = {
              ...dbCoaches[jomanjalIndex],
              ...jomanjalOverrides,
            } as Coach & { originalPrice?: number; discount?: number }
          } else {
            // DB에서 찾지 못한 경우 하드코딩된 Jomanjal 코치 생성
            // (API에서 verified=false이거나 active=false인 경우 등)
            jomanjal = {
              id: 5,
              name: "Jomanjal",
              specialty: "발로란트",
              tier: "레디언트",
              experience: "3년",
              rating: jomanjalOverrides.rating,
              reviews: jomanjalOverrides.reviews,
              students: jomanjalOverrides.students,
              price: null,
              discount: null,
              specialties: ["발로란트", "에이밍", "전략"],
              description: "전문 코치",
              headline: "에임, 피지컬 강의 국내 No.1",
              thumbnailImage: "/asd.jpg",
              introductionImage: null,
              verified: true,
              active: true,
            } as unknown as Coach & { originalPrice?: number; discount?: number }
          }
          
          // Jomanjal 코치를 맨 앞으로 이동
          const otherCoaches = dbCoaches.filter((c: Coach) => c.id !== 5 && c.id !== 1)
          setCoaches([jomanjal, ...otherCoaches])
        }
      } catch (error) {
        console.error('코치 데이터 로드 실패:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // 검색어 debounce
    const timer = setTimeout(() => {
      // 검색이나 필터 변경 시 첫 페이지로 리셋
      if (currentPage === 1) {
        fetchCoaches()
      } else {
        setCurrentPage(1)
      }
    }, searchQuery ? 500 : 0)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [searchQuery, selectedGame, selectedPriceRange, sortBy, currentPage])

  // 검색이나 필터 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedGame, selectedPriceRange, sortBy])

  // 가격 파싱 (숫자 또는 문자열 지원)
  const parsePrice = (price: number | string | null): number | null => {
    if (!price) return null
    if (typeof price === 'number') return price
    // 문자열인 경우 숫자 추출
    const numbersOnly = price.replace(/,/g, '').match(/\d+/)
    return numbersOnly ? parseInt(numbersOnly[0]) : null
  }

  // 가격 계산 결과 메모이제이션
  const coachesWithPrices = useMemo(() => {
    return coaches.map((coach) => {
      const coachWithDiscount = coach as Coach & { originalPrice?: number; discount?: number }
      
      // 가격 계산
      let price: number | null = null
      let originalPrice: number | null = null
      let discount: number | null = null
      
      // DB 데이터: price는 숫자(원가), discount는 할인율
      originalPrice = typeof coach.price === 'number' ? coach.price : parsePrice(coach.price)
      discount = coach.discount || null
      
      // 할인가 계산 (원가에서 할인율 적용)
      if (discount && originalPrice) {
        price = Math.round(originalPrice * (1 - discount / 100))
      } else {
        price = originalPrice
      }
      
      return {
        ...coach,
        calculatedPrice: price,
        calculatedOriginalPrice: originalPrice,
        calculatedDiscount: discount,
      }
    })
  }, [coaches])

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            전문 코치 목록
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            각 게임 분야의 전문 코치들과 함께 실력을 향상시켜보세요
          </p>
        </div>
      </section>

      {/* 검색 및 필터 */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="코치 이름으로 검색... (최대 100자)"
                value={searchQuery}
                onChange={(e) => {
                  if (e.target.value.length <= 100) {
                    setSearchQuery(e.target.value)
                  }
                }}
                className="pl-10"
                maxLength={100}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="가격">
                    {priceRanges.find(r => r.id === selectedPriceRange)?.name || "가격"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {priceRanges
                    .filter(range => range.id !== "all") // "가격" 옵션 제외
                    .map((range) => (
                      <SelectItem key={range.id} value={range.id}>
                        {range.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
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
          </div>

          {/* 게임별 필터 */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">게임</label>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {gameCategories.map((game) => (
                <Button
                  key={game.id}
                  variant={selectedGame === game.id ? "default" : "outline"}
                  onClick={() => setSelectedGame(game.id)}
                  className="whitespace-nowrap"
                >
                  {game.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 코치 목록 */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : coachesWithPrices.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">
                {searchQuery || selectedGame !== 'all' 
                  ? '검색 조건에 맞는 코치가 없습니다.' 
                  : '등록된 코치가 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {coachesWithPrices.map((coach) => {
                const price = coach.calculatedPrice
                const originalPrice = coach.calculatedOriginalPrice
                const discount = coach.calculatedDiscount
                
                return (
                  <Link href={`/coaches/${coach.id}`} key={coach.id} className="block">
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full bg-card border-0 py-0">
                      {/* 헤더 이미지 영역 */}
                      <div className="relative h-32 overflow-hidden">
                        <img 
                          src={coach.thumbnailImage || coach.introductionImage || "/asd.jpg"} 
                          alt={coach.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <CardContent className="relative p-4 bg-card">
                        {/* 배지 */}
                        <div className="flex items-center gap-2 mb-2.5">
                          <Badge className="bg-green-500 hover:bg-green-500 text-xs px-2 py-0.5">
                            <MapPin className="w-3 h-3 mr-1" />
                            온라인
                          </Badge>
                          {discount && discount > 0 && (
                            <Badge className="bg-red-500 hover:bg-red-500 text-xs px-2 py-0.5">
                              <Percent className="w-3 h-3 mr-1" />
                              할인
                            </Badge>
                          )}
                        </div>

                        {/* 제목 */}
                        <h3 className="text-base font-bold text-foreground mb-2.5 leading-tight line-clamp-2">
                          {coach.description || `${coach.name} 코치`}
                        </h3>

                        {/* 평점과 인원수 */}
                        <div className="flex items-center gap-3 mb-2.5">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-purple-500 text-purple-500 flex-shrink-0" />
                            <span className="text-sm font-medium whitespace-nowrap">{coach.rating > 0 ? coach.rating.toFixed(1) : '0.0'} ({coach.reviews})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm whitespace-nowrap">{coach.students}</span>
                          </div>
                        </div>

                        {/* 코치 이름 */}
                        <p className="text-sm text-muted-foreground mb-3 truncate">{coach.name}</p>

                        {/* 가격 정보 */}
                        {price && (
                          <div className="mb-1">
                            {discount && discount > 0 && originalPrice ? (
                              <div className="flex gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs font-bold">₩</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xl font-bold text-green-600 mb-0.5 leading-none">
                                    {price.toLocaleString()}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="inline-block rounded-md bg-destructive text-white text-xs font-medium px-1.5 py-0.5 leading-4">{discount}%</span>
                                    <span className="text-xs text-muted-foreground line-through whitespace-nowrap">{originalPrice.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs font-bold">₩</span>
                                </div>
                                <div className="text-xl font-bold text-green-600">
                                  {price.toLocaleString()}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 좋아요 버튼 */}
                        <div className="absolute bottom-3 right-3">
                          <Heart className="w-5 h-5 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
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
        </div>
      </section>

      <FooterSection />
    </main>
  )
}

