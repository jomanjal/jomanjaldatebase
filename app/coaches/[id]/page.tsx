"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { FooterSection } from "@/components/footer-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Star, Users, Clock, MapPin, Trophy, Check, Gift, Loader2, Edit, Rocket } from "lucide-react"
import Link from "next/link"
import { checkAuth, type User } from "@/lib/auth"

interface Coach {
  id: number
  userId: number | null
  name: string
  specialty: string
  tier: string
  experience: string
  rating: number
  reviews: number
  students: number
  price: string | null
  discount?: number | null
  originalPrice?: number | null
  specialties: string[]
  description: string | null
  introductionImage: string | null
  introductionContent: string | null
  introductionItems?: IntroductionItem[]
  curriculumItems: Array<{ title: string; duration: string }>
  totalCourseTime: string | null
  verified: boolean
}

interface IntroductionItem {
  title: string
  content: string
  items?: string[]
  videoUrl?: string | null
}

interface Review {
  id: number
  rating: number
  comment: string | null
  userName: string
  createdAt: Date | string
  timeAgo?: string
}

export default function CoachDetailPage({ params }: { params: { id: string } }) {
  const [coach, setCoach] = useState<Coach | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"latest" | "high" | "low">("latest")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [showAllAgents, setShowAllAgents] = useState(false)
  const coachId = parseInt(params.id, 10)

  // 현재 사용자 확인 및 소유자 확인
  useEffect(() => {
    async function loadUser() {
      const user = await checkAuth()
      setCurrentUser(user)
    }
    loadUser()
  }, [])

  // 코치 정보가 로드된 후 소유자 확인
  useEffect(() => {
    if (currentUser && coach && currentUser.role === 'coach' && coach.userId && coach.userId === currentUser.id) {
      setIsOwner(true)
    } else {
      setIsOwner(false)
    }
  }, [currentUser, coach])
  
  // 코치 정보 조회
  useEffect(() => {
    let isMounted = true

    async function fetchCoach() {
      setLoading(true)
      try {
        const response = await fetch(`/api/coaches/${coachId}`)
        const result = await response.json()

        if (isMounted) {
          if (result.success && result.data) {
            // introductionContent 파싱
            let introductionItems: IntroductionItem[] = []
            if (result.data.introductionContent) {
              try {
                introductionItems = JSON.parse(result.data.introductionContent)
              } catch {
                introductionItems = []
              }
            }
            setCoach({
              ...result.data,
              introductionItems,
            })
          } else if (coachId === 0 || coachId === 1) {
            // 참고용 하드코딩 데이터 (ID가 0 또는 1인 경우 - Jomanjal)
            const referenceCoach: Coach = {
              id: coachId,
              userId: null,
    name: "Jomanjal",
              specialty: "발로란트",
    tier: "레디언트",
    experience: "3년",
    rating: 5.0,
              reviews: 8,
    students: 200,
              price: "25,000원/시간",
              originalPrice: 50000,
              discount: 50,
    specialties: ["전략", "에이밍"],
              description: "수강생 200+ 이 경험한 에임실력 상승 🔥",
              introductionImage: "/Introduction.png",
              introductionContent: JSON.stringify([
                { title: "독자적 커리큘럼", content: "타 강사와 차별화된 수준 높은 독자적인 커리큘럼 제공." },
                { title: "대상", content: "초보자부터 프로 레벨까지 모든 수준에 도움되는 구성." },
                { title: "진행 방식", content: "", items: ["Aim Lab(스팀 설치)을 활용.", "강사가 직접 구성한 루틴 및 과제로 진행.", "10가지 시나리오로 구성된 루틴 제공."] },
                { title: "콘텐츠 제공", content: "", items: ["약 2,500자 분량의 알찬 설명 제공.", "명확한 목표 점수 제시 및 변화 체감 가능.", "천천히 진행 가능한 루틴 설계."] },
                { title: "장점 (무제한 소장)", content: "", items: ["글로 모두 작성되어 언제든지 복습 가능.", "콘텐츠 무제한 소장 가능."] },
                { title: "강의 환경", content: "", items: ["마이크 사용 불필요 (시간대 상관없이 진행 가능).", "디스코드 미사용.", "더 자세한 내용은 강의에서 확인 가능."] },
              ]),
              introductionItems: [
                { title: "독자적 커리큘럼", content: "타 강사와 차별화된 수준 높은 독자적인 커리큘럼 제공." },
                { title: "대상", content: "초보자부터 프로 레벨까지 모든 수준에 도움되는 구성." },
                { title: "진행 방식", content: "", items: ["Aim Lab(스팀 설치)을 활용.", "강사가 직접 구성한 루틴 및 과제로 진행.", "10가지 시나리오로 구성된 루틴 제공."] },
                { title: "콘텐츠 제공", content: "", items: ["약 2,500자 분량의 알찬 설명 제공.", "명확한 목표 점수 제시 및 변화 체감 가능.", "천천히 진행 가능한 루틴 설계."] },
                { title: "장점 (무제한 소장)", content: "", items: ["글로 모두 작성되어 언제든지 복습 가능.", "콘텐츠 무제한 소장 가능."] },
                { title: "강의 환경", content: "", items: ["마이크 사용 불필요 (시간대 상관없이 진행 가능).", "디스코드 미사용.", "더 자세한 내용은 강의에서 확인 가능."] },
              ],
              curriculumItems: [
                { title: "[소장] 마이크를 사용하지 않고도 배울 수 있는 과제 형식의 독보적 커리큘럼", duration: "1시간" }
              ],
              totalCourseTime: "1시간",
              verified: true,
            }
            setCoach(referenceCoach)
          } else {
            setCoach(null)
          }
        }
      } catch (error) {
        console.error('코치 데이터 로드 실패:', error)
        if (isMounted) {
          setCoach(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchCoach()

    return () => {
      isMounted = false
    }
  }, [coachId])

  // 리뷰 목록 조회
  useEffect(() => {
    let isMounted = true

    async function fetchReviews() {
      setReviewsLoading(true)
      try {
        // 하드코딩된 Jomanjal 코치(ID: 0 또는 1)의 경우 하드코딩된 후기 사용
        if (coachId === 0 || coachId === 1) {
          // 즉시 하드코딩된 후기 설정 (비동기 없이)
          const referenceReviews: Review[] = [
            {
              id: 1,
              rating: 5,
              comment: "에임루틴이 완벽합니다. 믿고 받아보세여!",
              userName: "수강생1",
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
            {
              id: 2,
              rating: 5,
              comment: "천천히 에임 연습할수 있구 장기적으로 할 분들은 추천드립니다! 한번 레슨에 주기적으로 할수있는 기본 무 친절하게 잘안내해주시고 감사합니다",
              userName: "수강생2",
              createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            },
            {
              id: 3,
              rating: 5,
              comment: "발로란트 게임을 처음 시작하는 사람들을 위한 강의 내용(조합, 캐릭, 돈관리, 심리전 등)과 에임 코칭 경험이 정말 도움이 됐어요!",
              userName: "수강생3",
              createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
            },
            {
              id: 4,
              rating: 5,
              comment: "나는 분명 뇌지컬은 좋은거 같은데 예임이 안좋았는데 이 강의 듣고 정말 많이 향상됐어요!",
              userName: "수강생4",
              createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
            {
              id: 5,
              rating: 5,
              comment: "왜 게임을 못 이기는지 모르겠었는데 이 강의 듣고 이해가 되기 시작했어요. 추천합니다!",
              userName: "수강생5",
              createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
            },
            {
              id: 6,
              rating: 5,
              comment: "내 예임 수준을 알고싶었는데 정확하게 피드백 해주셔서 정말 도움됐습니다!",
              userName: "수강생6",
              createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            },
            {
              id: 7,
              rating: 5,
              comment: "제 수업을 들었던 200명이 넘는 수강생분들이 예임상승과 탱크상승을 경험하셨다는 말에 믿고 신청했는데 정말 만족스러워요!",
              userName: "수강생7",
              createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
            },
            {
              id: 8,
              rating: 5,
              comment: "에임 강의 패키지가 정말 좋아요. 기본부터 차근차근 알려주셔서 이해하기 쉬웠습니다!",
              userName: "수강생8",
              createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            }
          ]
          
          if (isMounted) {
            setReviews(referenceReviews)
            setReviewsLoading(false)
          }
          return
        }

        const params = new URLSearchParams()
        params.append('coachId', coachId.toString())
        params.append('verified', 'true') // 승인된 리뷰만 표시

        const response = await fetch(`/api/reviews?${params.toString()}`)
        const result = await response.json()

        if (isMounted && result.success) {
          setReviews(result.data || [])
        }
      } catch (error) {
        console.error('리뷰 데이터 로드 실패:', error)
      } finally {
        if (isMounted) {
          setReviewsLoading(false)
        }
      }
    }

    fetchReviews()

    return () => {
      isMounted = false
    }
  }, [coachId])

  // 리뷰 정렬
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else if (sortBy === "high") {
      return b.rating - a.rating
    } else {
      return a.rating - b.rating
    }
  })
  
  const handleKakaoChat = () => {
    const chatUrl = process.env.NEXT_PUBLIC_KAKAO_CHAT_URL || 'https://open.kakao.com/o/s6kCFbZh'
    window.open(chatUrl, '_blank', 'noopener,noreferrer')
  }

  // 가격 파싱
  const parsePrice = (price: string | null): { value: number | null; unit: string } => {
    if (!price) return { value: null, unit: '' }
    // 쉼표를 제거한 후 모든 숫자 추출
    const priceWithoutCommas = price.replace(/,/g, '')
    const match = priceWithoutCommas.match(/(\d+)/)
    const value = match ? parseInt(match[0]) : null
    const unitMatch = price.match(/\/시간|원/)
    const unit = unitMatch ? (price.includes('/시간') ? '/시간' : '원') : ''
    return { value, unit }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">코치 정보를 불러오는 중...</p>
        </section>
        <FooterSection />
      </main>
    )
  }

  if (!coach) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">코치를 찾을 수 없습니다</h1>
          <Link href="/coaches">
            <Button>코치 목록으로 돌아가기</Button>
          </Link>
        </section>
        <FooterSection />
      </main>
    )
  }

  const priceInfo = parsePrice(coach.price)
  
  // 할인 정보 계산
  let displayPrice: number | null = null
  let originalPrice: number | null = null
  let discount: number | null = null
  
  if (coach.originalPrice !== undefined && coach.discount !== undefined && coach.originalPrice !== null && coach.discount !== null) {
    // 하드코딩 데이터: originalPrice와 discount가 직접 지정됨
    originalPrice = coach.originalPrice
    discount = coach.discount
    displayPrice = priceInfo.value || Math.round(originalPrice * (1 - discount / 100))
  } else if (coach.discount && coach.discount > 0 && priceInfo.value) {
    // DB 데이터: price는 원가, discount는 할인율
    originalPrice = priceInfo.value
    discount = coach.discount
    displayPrice = Math.round(originalPrice * (1 - discount / 100))
  } else {
    // 할인 없음
    displayPrice = priceInfo.value
    originalPrice = null
    discount = null
  }

  // introductionItems 분리: 강의 대상, 강의 효과, 나머지
  const targetItems = coach.introductionItems?.filter(item => item.title === "강의 대상") || []
  const effectItems = coach.introductionItems?.filter(item => item.title === "강의 효과") || []
  const otherItems = coach.introductionItems?.filter(item => item.title !== "강의 대상" && item.title !== "강의 효과" && !item.title.startsWith("__")) || []
  
  // 포지션과 요원 정보 파싱
  const positionsItem = coach.introductionItems?.find(item => item.title === "__positions__")
  const agentsItem = coach.introductionItems?.find(item => item.title === "__agents__")
  let positions: string[] = []
  let agents: string[] = []
  
  if (positionsItem?.content) {
    try {
      positions = JSON.parse(positionsItem.content)
    } catch {
      positions = []
    }
  }
  
  if (agentsItem?.content) {
    try {
      agents = JSON.parse(agentsItem.content)
    } catch {
      agents = []
    }
  }
  
  // 발로란트 포지션 및 요원 정의 (강의 관리 페이지와 동일)
  const valorantPositions = [
    { id: "sentinel", name: "감시자", icon: "🛡️" },
    { id: "controller", name: "전략가", icon: "🎯" },
    { id: "initiator", name: "척후대", icon: "⬆️" },
    { id: "duelist", name: "타격대", icon: "⚔️" },
  ]
  
  const valorantAgents = [
    "게코", "네온", "데드록", "레이나", "레이즈", "바이퍼", "브리치", "브림스톤",
    "사이퍼", "세이지", "소바", "스카이", "아스트라", "아이소", "오멘", "요루",
    "제트", "체임버", "케이/오", "클로브", "킬조이", "페이드", "피닉스", "하버"
  ]

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* 메인 콘텐츠 */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">에임, 피지컬 강의 국내 No.1</h1>
            {isOwner && (
              <Button asChild variant="outline">
                <Link href="/my/course">
                  <Edit className="w-4 h-4 mr-2" />
                  프로필 편집
                </Link>
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 좌측: 탭 콘텐츠 */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="intro" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="intro">강의 소개</TabsTrigger>
                  <TabsTrigger value="curriculum">커리큘럼</TabsTrigger>
                  <TabsTrigger value="reviews">후기 {coach.reviews}</TabsTrigger>
                </TabsList>

                {/* 강의 소개 탭 */}
                <TabsContent value="intro" className="space-y-6">
                  {/* 소개이미지 */}
                  {coach.introductionImage && (
                  <img 
                      src={coach.introductionImage} 
                    alt="강의 소개 이미지" 
                    className="w-full rounded-lg" 
                  />
                  )}

                  {/* 강의 소개 */}
                  {otherItems.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                        <h2 className="text-xl font-bold mb-6">이 강의는 온라인 강의로, 에임, 피지컬 강의 국내 No.1</h2>
                      <div className="space-y-4 text-muted-foreground">
                          {otherItems.map((item, index) => (
                            <div key={index}>
                              {/* 강의 소개 (videoUrl 포함) */}
                              {item.title === "강의 소개" ? (
                                <div className="space-y-4">
                                  {item.content && (
                                    <div className="whitespace-pre-wrap">
                                      {item.content}
                                    </div>
                                  )}
                                  {item.videoUrl && (
                                    <div className="mt-4">
                                      <iframe
                                        src={item.videoUrl.includes('youtube.com') 
                                          ? item.videoUrl.replace('watch?v=', 'embed/').split('&')[0]
                                          : item.videoUrl.includes('youtu.be')
                                          ? item.videoUrl.replace('youtu.be/', 'youtube.com/embed/')
                                          : item.videoUrl}
                                        className="w-full aspect-video rounded-lg"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                      />
                                    </div>
                                  )}
                                </div>
                              ) : (
                                /* 기타 항목 (체크마크 리스트) */
                        <div className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    {item.content && !item.items && (
                                      <div>
                                        <span className="font-semibold">{item.title}:</span> {item.content}
                                      </div>
                                    )}
                                    {item.items && item.items.length > 0 && (
                          <div>
                                        <span className="font-semibold">{item.title}:</span>
                                        {item.content && <span className="ml-2">{item.content}</span>}
                                        <ul className="mt-2 ml-4 space-y-1 text-sm">
                                          {item.items.map((subItem, subIndex) => (
                                            <li key={subIndex}>ㆍ {subItem}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 강의 대상 */}
                  {targetItems.length > 0 && (
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Clock className="w-5 h-5 text-primary" />
                          <h2 className="text-xl font-bold">강의 대상은 누가 될까요?</h2>
                        </div>
                        <div className="space-y-2 text-muted-foreground">
                          {targetItems.map((item, index) => (
                            <div key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">{item.content}</div>
                          </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 강의 효과 */}
                  {effectItems.length > 0 && (
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Rocket className="w-5 h-5 text-primary" />
                          <h2 className="text-xl font-bold">강의 효과는 얼마나 될까요?</h2>
                        </div>
                        <div className="space-y-2 text-muted-foreground">
                          {effectItems.map((item, index) => (
                            <div key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">{item.content}</div>
                          </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 게임 정보 - Accordion */}
                  {(coach.specialty === "발로란트" && (positions.length > 0 || agents.length > 0)) || (coach.specialties && coach.specialties.length > 0) ? (
                    <Card>
                      <CardContent className="p-0">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="game-info" className="border-0">
                            <AccordionTrigger className="px-6 py-4 hover:no-underline">
                              <h2 className="text-xl font-bold">강의 상세 게임 정보</h2>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6">
                              {/* 발로란트 포지션 */}
                              {coach.specialty === "발로란트" && positions.length > 0 && (
                                <div className="mb-4">
                                  <div className="flex flex-wrap gap-2">
                                    {valorantPositions.map((position) => (
                                      positions.includes(position.id) && (
                                        <Button
                                          key={position.id}
                                          variant="outline"
                                          size="sm"
                                          className="rounded-lg h-9"
                                        >
                                          <span className="mr-1.5">{position.icon}</span>
                                          {position.name}
                                        </Button>
                                      )
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* 발로란트 요원 */}
                              {coach.specialty === "발로란트" && agents.length > 0 && (
                                <div className="mb-4">
                                  <div className="flex flex-wrap gap-2">
                                    {(showAllAgents ? agents : agents.slice(0, 6)).map((agent) => (
                                      <Button
                                        key={agent}
                                        variant="outline"
                                        size="sm"
                                        className="rounded-lg h-9 px-3"
                                      >
                                        {agent}
                                      </Button>
                                    ))}
                                    {agents.length > 6 && !showAllAgents && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-lg h-9"
                                        onClick={() => setShowAllAgents(true)}
                                      >
                                        더보기 (+{agents.length - 6})
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* 키워드 */}
                              {coach.specialties && coach.specialties.length > 0 && (
                                <div>
                                  {coach.specialty === "발로란트" && (positions.length > 0 || agents.length > 0) && (
                                    <p className="text-sm text-muted-foreground mb-4">{coach.specialties.join(', ')}</p>
                                  )}
                                  <div className="flex flex-wrap gap-2">
                                    {coach.specialties.map((specialty, idx) => (
                                      <Badge key={idx} variant="outline">{specialty}</Badge>
                                    ))}
                        </div>
                      </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                    </CardContent>
                  </Card>
                  ) : null}

                  {/* 취소 및 환불 - Accordion */}
                  <Card>
                    <CardContent className="p-0">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="refund" className="border-0">
                          <AccordionTrigger className="px-6 py-4 hover:no-underline">
                            <h2 className="text-xl font-bold">취소 및 환불</h2>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-6 text-muted-foreground">
                            <div className="space-y-2 text-sm">
                              <p>• 강의 구매 후 7일 이내 환불 가능</p>
                              <p>• 강의를 50% 이상 수강한 경우 환불 불가</p>
                              <p>• 환불 문의는 고객센터로 연락 부탁드립니다</p>
                          </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 커리큘럼 탭 */}
                <TabsContent value="curriculum">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-6">
                        커리큘럼 {coach.totalCourseTime ? `총 ${coach.totalCourseTime}` : ''}
                      </h2>
                      {coach.curriculumItems && coach.curriculumItems.length > 0 ? (
                      <div className="space-y-4">
                          {coach.curriculumItems.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <span className="font-medium">
                                {index + 1}. {item.title}
                          </span>
                              <span className="text-muted-foreground text-sm">{item.duration}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">등록된 커리큘럼이 없습니다.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 후기 탭 */}
                <TabsContent value="reviews">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">후기 {coach.reviews}</h2>
                        <div className="flex gap-2">
                          <Button
                            variant={sortBy === "latest" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSortBy("latest")}
                          >
                            최신순
                          </Button>
                          <Button
                            variant={sortBy === "high" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSortBy("high")}
                          >
                            평점 높은 순
                          </Button>
                          <Button
                            variant={sortBy === "low" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSortBy("low")}
                          >
                            평점 낮은 순
                          </Button>
                        </div>
                      </div>

                      {/* 후기 목록 */}
                      {reviewsLoading ? (
                        <div className="flex justify-center items-center py-10">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      ) : sortedReviews.length === 0 ? (
                        <div className="text-center py-10">
                          <p className="text-muted-foreground">아직 등록된 후기가 없습니다.</p>
                        </div>
                      ) : (
                      <div className="space-y-6">
                          {sortedReviews.map((review) => {
                            const reviewDate = new Date(review.createdAt)
                            const formattedDate = `${reviewDate.getFullYear()}-${String(reviewDate.getMonth() + 1).padStart(2, '0')}-${String(reviewDate.getDate()).padStart(2, '0')}`
                            
                            return (
                              <div key={review.id} className="border-b pb-6 last:border-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex gap-1">
                                {[...Array(review.rating)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                                  <span className="font-semibold">{review.userName}</span>
                                  <span className="text-sm text-muted-foreground">{formattedDate}</span>
                            </div>
                                {review.comment && (
                                  <p className="text-muted-foreground">{review.comment}</p>
                                )}
                          </div>
                            )
                          })}
                      </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* 우측: 사이드바 (sticky) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* asd.jpg 이미지 */}
                <img 
                  src="/asd.jpg" 
                  alt="사이드바 이미지" 
                  className="w-full rounded-lg max-h-64 object-cover" 
                />

                {/* 할인 배너 */}
                <div className="bg-blue-500 text-white p-4 rounded-lg flex items-center gap-2">
                  <Gift className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">최대 10만원 할인! 신규 가입 쿠폰팩 즉시 받기</span>
                </div>

                {/* 강의 구매 카드 */}
                <Card>
                  <CardContent className="p-6">
                    {coach.students > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <Check className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-muted-foreground">{coach.students}명이 구매한 강의</span>
                    </div>
                    )}
                    
                    <div className="flex gap-2 mb-4">
                      <Badge variant="outline">온라인</Badge>
                      {coach.verified && (
                        <Badge variant="secondary">인증됨</Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-bold mb-2">
                      {coach.description || `${coach.name} 코치`}
                    </h3>

                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-4 h-4 fill-purple-500 text-purple-500" />
                      <span className="font-semibold">{coach.rating > 0 ? coach.rating.toFixed(1) : '0.0'}</span>
                      <span className="text-sm text-muted-foreground">({coach.reviews})</span>
                    </div>

                    {displayPrice && (
                    <div className="mb-4">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          ₩{displayPrice.toLocaleString()}
                          {priceInfo.unit && <span className="text-base font-normal text-muted-foreground">{priceInfo.unit}</span>}
                        </div>
                        {discount && discount > 0 && originalPrice && (
                          <div className="flex items-center gap-2">
                            <span className="inline-block rounded-md bg-destructive text-white text-xs font-medium px-1.5 py-0.5">{discount}%</span>
                            <span className="text-sm text-muted-foreground line-through">₩{originalPrice.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <Button 
                      className="w-full mb-4 bg-gray-800 text-white hover:bg-gray-700"
                      onClick={handleKakaoChat}
                    >
                      강의 구매
                    </Button>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>• 총 1개의 커리큘럼 (1시간)</div>
                    </div>
                  </CardContent>
                </Card>

                {/* 코치 정보 */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="font-bold text-primary">{coach.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h4 className="font-bold">{coach.name}</h4>
                        <p className="text-sm text-muted-foreground">{coach.specialty}</p>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full mb-4"
                      onClick={handleKakaoChat}
                    >
                      상담하기
                    </Button>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-purple-500 text-purple-500" />
                        <span>{coach.rating > 0 ? coach.rating.toFixed(1) : '0.0'} ({coach.reviews})</span>
                      </div>
                      <div>👑 {coach.experience} 경력</div>
                      <div>👥 {coach.students}명의 수강생</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  )
}