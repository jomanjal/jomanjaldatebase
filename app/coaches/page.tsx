"use client"

import React, { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { FooterSection } from "@/components/footer-section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FlightMenu, FlightMenuItem } from "@/components/ui/flight-menu"
import { Search, Loader2, SlidersHorizontal, X } from "lucide-react"
import Link from "next/link"
import { CoachCard } from "@/components/CoachCard"
import { SkeletonCard } from "@/components/SkeletonCard"
import { EmptyState } from "@/components/EmptyState"
import { ErrorDisplay } from "@/components/error-display"
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
  { id: "ranking", name: "랭킹순" },
  { id: "reviews", name: "후기순" },
]

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

function CoachesPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null) // 에러 상태 추가
  const [searching, setSearching] = useState(false) // 검색 중 상태 추가
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

  // URL 파라미터에서 필터 초기화
  useEffect(() => {
    const specialty = searchParams.get('specialty')
    if (specialty) {
      // 게임 카테고리 목록에 있는 게임인지 확인
      const gameExists = gameCategories.some(g => g.id === specialty)
      if (gameExists) {
        setSelectedGame(specialty)
      }
    } else {
      setSelectedGame("all")
    }
  }, [searchParams])

  // 코치 목록 조회
  useEffect(() => {
    let isMounted = true

    async function fetchCoaches() {
      // 초기 로드가 아닌 경우에만 기존 데이터 유지하면서 업데이트
      const isInitialLoad = coaches.length === 0 && loading
      
      if (searchQuery) {
        setSearching(true) // 검색 중일 때만 searching 상태 활성화
      }
      
      // 초기 로드일 때만 loading 상태 설정
      if (isInitialLoad) {
        setLoading(true)
      }
      
      setError(null) // 에러 초기화
      
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
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()

        if (isMounted) {
          if (result.success) {
            const dbCoaches = result.data || []
            
            // 페이지네이션 정보 저장
            if (result.pagination) {
              setPagination(result.pagination)
            }
            
            // DB에서 받은 코치 목록 그대로 사용 (레이아웃 시프트 방지를 위해 즉시 업데이트)
            setCoaches(dbCoaches)
          } else {
            throw new Error(result.message || '코치 데이터를 불러오는데 실패했습니다.')
          }
        }
      } catch (error) {
        console.error('코치 데이터 로드 실패:', error)
        if (process.env.NODE_ENV === 'development') {
          console.error('Error details:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          })
        }
        if (isMounted) {
          setError(error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
          setSearching(false)
        }
      }
    }

    // 검색어 debounce (300ms로 개선)
    const timer = setTimeout(() => {
      // 검색이나 필터 변경 시 첫 페이지로 리셋
      if (currentPage === 1) {
        fetchCoaches()
      } else {
        setCurrentPage(1)
      }
    }, searchQuery ? 300 : 0)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [searchQuery, selectedGame, selectedPriceRange, sortBy, currentPage])

  // 검색이나 필터 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedGame, selectedPriceRange, sortBy])

  // 검색어 하이라이팅 함수
  const highlightSearchTerm = (text: string, searchTerm: string): React.ReactNode => {
    if (!searchTerm || !text) return text
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

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
    <main className="min-h-screen bg-[var(--layer01)]" style={{ transition: 'var(--transition)' }}>
      <Header />
      
      {/* 페이지 헤더 */}
      <section className="bg-[var(--layer01)] pt-6 sm:pt-8 lg:pt-10 pb-0" style={{ transition: 'var(--transition)' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 2xl:px-32">
          <h1 className="mb-0 text-xl font-semibold text-[var(--text01)] text-center">
            전문 코치 목록
          </h1>
        </div>
      </section>

      {/* 검색 및 필터 */}
      <section className="pt-0 pb-8 sm:pb-12 bg-[var(--layer01)]" style={{ transition: 'var(--transition)' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 2xl:px-32">
          {/* 강의 검색 */}
          <div className="mb-2 min-h-[40px] flex justify-start">
            <div className="relative max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text04)] w-4 h-4" aria-hidden="true" />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text04)] w-4 h-4 animate-spin" aria-hidden="true" />
              )}
              <Input
                placeholder="강의 검색"
                value={searchQuery}
                onChange={(e) => {
                  if (e.target.value.length <= 100) {
                    setSearchQuery(e.target.value)
                  }
                }}
                className={searching ? "pl-10 pr-10" : "pl-10"}
                maxLength={100}
                aria-label="강의 검색"
              />
            </div>
          </div>

          {/* 필터 버튼 줄 (게임 카테고리 + 가격) */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth snap-x snap-mandatory justify-start" style={{ minHeight: '40px' }}>
            {/* 게임 카테고리 버튼들 */}
            {gameCategories.map((game) => (
              <Button
                key={game.id}
                variant={selectedGame === game.id ? "default" : "outline"}
                onClick={(e) => {
                  e.preventDefault()
                  const newGame = game.id === selectedGame ? "all" : game.id
                  setSelectedGame(newGame)
                  // URL 업데이트
                  if (newGame === "all") {
                    router.push("/coaches")
                  } else {
                    router.push(`/coaches?specialty=${encodeURIComponent(newGame)}`)
                  }
                }}
                className={`whitespace-nowrap rounded-md snap-start shrink-0 h-8 px-3 text-xs ${
                  selectedGame === game.id 
                    ? "bg-[var(--primary01)] text-white hover:bg-[var(--primary02)] !border-0" 
                    : "bg-[var(--layer02)] text-[var(--text01)] !border !border-[var(--divider01)] hover:bg-[var(--layer02Hover)]"
                }`}
                style={{ transition: 'var(--transition)' }}
                aria-label={`${game.name} 필터 ${selectedGame === game.id ? '해제' : '적용'}`}
                aria-pressed={selectedGame === game.id}
              >
                {game.name}
              </Button>
            ))}
            
            {/* 가격 드롭다운 */}
            {selectedPriceRange === 'all' && (
              <FlightMenu
                value={selectedPriceRange}
                onValueChange={setSelectedPriceRange}
                placeholder="가격"
                triggerClassName="w-[100px] h-8 text-xs shrink-0 snap-start"
                contentClassName="w-[100px]"
              >
                {priceRanges
                  .filter(range => range.id !== "all")
                  .map((range) => (
                    <FlightMenuItem key={range.id} value={range.id}>
                      {range.name}
                    </FlightMenuItem>
                  ))}
              </FlightMenu>
            )}
          </div>

          {/* 활성 필터 태그 섹션 (Gigs 스타일) */}
          {(selectedGame !== 'all' || selectedPriceRange !== 'all') && (
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {/* 활성 필터 태그들 */}
              {selectedGame !== 'all' && (
                <div className="flex items-center gap-1.5 bg-[var(--layer02)] text-[var(--text01)] rounded-md px-2.5 py-1 h-7 text-xs border border-[var(--divider01)]">
                  <span>{gameCategories.find(g => g.id === selectedGame)?.name}</span>
                  <button
                    onClick={() => setSelectedGame("all")}
                    className="hover:opacity-70 transition-opacity"
                    aria-label={`${gameCategories.find(g => g.id === selectedGame)?.name} 필터 제거`}
                  >
                    <X className="w-3 h-3 text-[var(--text04)]" />
                  </button>
                </div>
              )}
              {selectedPriceRange !== 'all' && (
                <div className="flex items-center gap-1.5 bg-[var(--layer02)] text-[var(--text01)] rounded-md px-2.5 py-1 h-7 text-xs border border-[var(--divider01)]">
                  <span>{priceRanges.find(r => r.id === selectedPriceRange)?.name}</span>
                  <button
                    onClick={() => setSelectedPriceRange("all")}
                    className="hover:opacity-70 transition-opacity"
                    aria-label={`${priceRanges.find(r => r.id === selectedPriceRange)?.name} 필터 제거`}
                  >
                    <X className="w-3 h-3 text-[var(--text04)]" />
                  </button>
                </div>
              )}
              
              {/* 초기화 버튼 */}
              <Button
                onClick={() => {
                  setSelectedGame("all")
                  setSelectedPriceRange("all")
                  setSortBy("latest")
                }}
                variant="ghost"
                className="h-7 px-2 text-xs text-[var(--text04)] hover:text-[var(--text01)] hover:bg-[var(--layer02Hover)]"
                aria-label="모든 필터 초기화"
              >
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                초기화
              </Button>
            </div>
          )}

          {/* 강의 개수 및 정렬 줄 */}
          <div className="flex items-center justify-between gap-4 min-h-[32px]">
            <div className="min-w-[100px]">
              {loading && coaches.length === 0 ? (
                <div className="h-5 w-24 bg-[var(--layer02)] animate-pulse rounded" />
              ) : (
                <p className="text-xs text-[var(--text04)]">
                  {coaches.length}개의 강의
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <FlightMenu
                value={sortBy}
                onValueChange={setSortBy}
                placeholder="정렬"
                triggerClassName="w-[110px] h-8 text-xs whitespace-nowrap"
                contentClassName="w-[110px] min-w-[110px]"
              >
                {sortOptions.map((option) => (
                  <FlightMenuItem key={option.id} value={option.id}>
                    <span className="whitespace-nowrap">{option.name}</span>
                  </FlightMenuItem>
                ))}
              </FlightMenu>
            </div>
          </div>
        </div>
      </section>

      {/* 코치 목록 */}
      <section className="py-8 sm:py-12 lg:py-16" style={{ transition: 'var(--transition)' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 2xl:px-32">
          {error ? (
            <ErrorDisplay 
              error={error} 
              onRetry={() => {
                setError(null)
                // fetchCoaches는 useEffect의 의존성 배열에 의해 자동으로 재실행됨
                window.location.reload()
              }} 
            />
          ) : loading && coaches.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-4 sm:gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : coachesWithPrices.length === 0 ? (
            <EmptyState
              type={searchQuery ? "search" : selectedGame !== 'all' ? "filter" : "default"}
              searchQuery={searchQuery}
              onResetFilters={() => {
                setSearchQuery("")
                setSelectedGame("all")
                setSelectedPriceRange("all")
                setSortBy("latest")
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-4 sm:gap-6">
              {coachesWithPrices.map((coach) => (
                <CoachCard
                  key={coach.id}
                  coach={coach}
                  calculatedPrice={coach.calculatedPrice}
                  calculatedOriginalPrice={coach.calculatedOriginalPrice}
                  calculatedDiscount={coach.calculatedDiscount}
                  searchQuery={searchQuery}
                  highlightSearchTerm={highlightSearchTerm}
                />
              ))}
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

export default function CoachesPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[var(--layer01)]">
        <Header />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-24 py-8 sm:py-12">
          <div className="h-8 w-48 bg-[var(--layer02)] animate-pulse rounded mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      </main>
    }>
      <CoachesPageContent />
    </Suspense>
  )
}

