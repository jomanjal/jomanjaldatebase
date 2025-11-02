"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { FooterSection } from "@/components/footer-section"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, MapPin, Star, User, Search, Loader2, Percent } from "lucide-react"
import Link from "next/link"

// 게임 카테고리
const gameCategories = [
  { id: "all", name: "전체" },
  { id: "리그 오브 레전드", name: "리그 오브 레전드" },
  { id: "발로란트", name: "발로란트" },
  { id: "오버워치 2", name: "오버워치 2" },
  { id: "배틀그라운드", name: "배틀그라운드" },
]

// 참고용 하드코딩 데이터 (추후 삭제 예정)
const referenceCoach: Coach & { originalPrice?: number; discount?: number } = {
  id: 0, // DB ID와 구분하기 위해 0 사용
  name: "Jomanjal",
  specialty: "발로란트",
  tier: "레디언트",
  experience: "3년",
  rating: 5.0,
  reviews: 8,
  students: 200,
  price: "25,000원/시간",
  specialties: ["전략", "에이밍"],
  description: "수강생 200+ 이 경험한 에임실력 상승 🔥",
  verified: true,
  originalPrice: 50000,
  discount: 50,
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
  price: string | null
  discount: number | null
  specialties: string[]
  description: string | null
  introductionImage: string | null
  verified: boolean
}

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGame, setSelectedGame] = useState("all")

  // 코치 목록 조회
  useEffect(() => {
    let isMounted = true

    async function fetchCoaches() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (searchQuery) params.append('search', searchQuery)
        if (selectedGame !== 'all') params.append('specialty', selectedGame)

        const response = await fetch(`/api/coaches?${params.toString()}`)
        const result = await response.json()

        if (isMounted && result.success) {
          // 참고용 하드코딩 데이터를 맨 앞에 추가
          const dbCoaches = result.data || []
          setCoaches([referenceCoach, ...dbCoaches])
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
      fetchCoaches()
    }, searchQuery ? 500 : 0)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [searchQuery, selectedGame])

  // 가격 파싱 (예: "30,000원/시간" -> 30000)
  const parsePrice = (price: string | null): number | null => {
    if (!price) return null
    // 콤마 제거 후 숫자 추출
    const numbersOnly = price.replace(/,/g, '').match(/\d+/)
    return numbersOnly ? parseInt(numbersOnly[0]) : null
  }

  // 필터링된 코치 목록 (하드코딩 데이터 포함)
  const filteredCoaches = useMemo(() => {
    return coaches.filter((coach) => {
      // 검색어 필터
      if (searchQuery && !coach.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      // 게임 필터
      if (selectedGame !== 'all' && coach.specialty !== selectedGame) {
        return false
      }
      return true
    })
  }, [coaches, searchQuery, selectedGame])

  // 가격 계산 결과 메모이제이션
  const coachesWithPrices = useMemo(() => {
    return filteredCoaches.map((coach) => {
      const coachWithDiscount = coach as Coach & { originalPrice?: number; discount?: number }
      
      // 하드코딩 데이터의 경우 직접 지정된 값 사용, DB 데이터는 DB의 discount 필드 사용
      let price: number | null = null
      let originalPrice: number | null = null
      let discount: number | null = null
      
      if (coachWithDiscount.originalPrice !== undefined && coachWithDiscount.discount !== undefined) {
        // 하드코딩 데이터: originalPrice와 discount가 직접 지정됨
        originalPrice = coachWithDiscount.originalPrice
        discount = coachWithDiscount.discount
        price = parsePrice(coach.price) || Math.round(originalPrice * (1 - discount / 100))
      } else {
        // DB 데이터: price는 원가, discount는 할인율
        originalPrice = parsePrice(coach.price)
        discount = coach.discount || null
        // 할인가 계산 (원가에서 할인율 적용)
        if (discount && originalPrice) {
          price = Math.round(originalPrice * (1 - discount / 100))
        } else {
          price = originalPrice
        }
      }
      
      return {
        ...coach,
        calculatedPrice: price,
        calculatedOriginalPrice: originalPrice,
        calculatedDiscount: discount,
      }
    })
  }, [filteredCoaches])

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
          </div>

          {/* 게임별 필터 */}
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
                          src={coach.introductionImage || "/asd.jpg"} 
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
        </div>
      </section>

      <FooterSection />
    </main>
  )
}

