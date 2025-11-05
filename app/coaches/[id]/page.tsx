"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Header } from "@/components/header"
import { FooterSection } from "@/components/footer-section"
import { ErrorDisplay } from "@/components/error-display"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Star, Users, Clock, MapPin, Trophy, Check, Gift, Loader2, Edit, Rocket, Send } from "lucide-react"
import Link from "next/link"
import { checkAuth, type User } from "@/lib/auth"
import { toast } from "sonner"
import { sanitizeText } from "@/lib/dompurify-client"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

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
  price: number | null // 숫자로 변경
  discount?: number | null
  originalPrice?: number | null
  specialties: string[]
  description: string | null
  headline: string | null
  thumbnailImage: string | null
  profileImage: string | null
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
  const [error, setError] = useState<Error | null>(null) // 에러 상태 추가
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState<Error | null>(null) // 리뷰 에러 상태 추가
  const [sortBy, setSortBy] = useState<"latest" | "high" | "low">("latest")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [showAllAgents, setShowAllAgents] = useState(false)
  const [reviewsPage, setReviewsPage] = useState(1)
  const [reviewsPagination, setReviewsPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false)
  const [enrollLoading, setEnrollLoading] = useState(false)
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null) // 현재 수강 신청 상태
  const coachId = parseInt(params.id, 10)

  // 현재 사용자 확인 및 소유자 확인
  useEffect(() => {
    async function loadUser() {
      const user = await checkAuth()
      setCurrentUser(user)
    }
    loadUser()
  }, [])

  // 수강 신청 상태 확인
  useEffect(() => {
    async function checkEnrollmentStatus() {
      if (!currentUser || currentUser.role !== 'user' || !currentUser.id) return

      try {
        const response = await fetch(`/api/enrollments?userId=${currentUser.id}&coachId=${coachId}&role=user`, {
          credentials: 'include',
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data && result.data.length > 0) {
            // 취소되지 않은 수강 신청만 확인 (pending, approved, rejected, completed)
            const activeEnrollments = result.data.filter(
              (enrollment: any) => enrollment.status !== 'cancelled'
            )
            
            if (activeEnrollments.length > 0) {
              // 가장 최근 신청의 상태 확인
              const latestEnrollment = activeEnrollments[0]
              setEnrollmentStatus(latestEnrollment.status)
            } else {
              // 취소된 수강 신청만 있으면 상태를 null로 설정 (구매 가능)
              setEnrollmentStatus(null)
            }
          } else {
            // 수강 신청이 없으면 상태를 null로 설정
            setEnrollmentStatus(null)
          }
        }
      } catch (error) {
        console.error('수강 신청 상태 확인 실패:', error)
      }
    }

    if (currentUser && currentUser.id) {
      checkEnrollmentStatus()
    }
  }, [currentUser, coachId])

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
      setError(null) // 에러 초기화
      
      try {
        const response = await fetch(`/api/coaches/${coachId}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()

        if (isMounted) {
          if (result.success && result.data) {
            // introductionContent 파싱 (에러 처리 개선)
            let introductionItems: IntroductionItem[] = []
            if (result.data.introductionContent) {
              try {
                const parsed = JSON.parse(result.data.introductionContent)
                if (Array.isArray(parsed)) {
                  introductionItems = parsed
                } else if (typeof parsed === 'object') {
                  // 단일 객체인 경우 배열로 변환
                  introductionItems = [parsed]
                }
              } catch (error) {
                console.error('introductionContent 파싱 실패:', error)
                introductionItems = []
              }
            }
            
            // 커리큘럼 시간 계산 (totalCourseTime이 없을 때)
            let calculatedTotalTime = result.data.totalCourseTime
            if (!calculatedTotalTime && result.data.curriculumItems && Array.isArray(result.data.curriculumItems)) {
              // 모든 커리큘럼 항목의 duration에서 시간 추출
              const totalMinutes = result.data.curriculumItems.reduce((acc: number, item: { title: string; duration: string }) => {
                if (item.duration) {
                  // "30분", "1시간", "1시간 30분" 등의 형식 파싱
                  const hourMatch = item.duration.match(/(\d+)\s*시간/)
                  const minuteMatch = item.duration.match(/(\d+)\s*분/)
                  const hours = hourMatch ? parseInt(hourMatch[1]) : 0
                  const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0
                  return acc + (hours * 60) + minutes
                }
                return acc
              }, 0)
              
              if (totalMinutes > 0) {
                const hours = Math.floor(totalMinutes / 60)
                const minutes = totalMinutes % 60
                if (hours > 0 && minutes > 0) {
                  calculatedTotalTime = `${hours}시간 ${minutes}분`
                } else if (hours > 0) {
                  calculatedTotalTime = `${hours}시간`
                } else {
                  calculatedTotalTime = `${minutes}분`
                }
              }
            }
            
            // DB에서 받은 코치 데이터 그대로 사용
            const coachData = { 
              ...result.data, 
              introductionItems,
              totalCourseTime: calculatedTotalTime || result.data.totalCourseTime
            }
            
            setCoach(coachData)
          } else {
            throw new Error(result.message || '코치를 찾을 수 없습니다.')
          }
        }
      } catch (error) {
        console.error('코치 데이터 로드 실패:', error)
        if (isMounted) {
          setError(error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.'))
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
      setReviewsError(null) // 에러 초기화
      
      try {
        const params = new URLSearchParams()
        params.append('coachId', coachId.toString())
        params.append('verified', 'true') // 승인된 리뷰만 표시
        params.append('page', reviewsPage.toString())
        params.append('limit', '10') // 상세 페이지에서는 10개씩 표시

        const response = await fetch(`/api/reviews?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()

        if (isMounted) {
          if (result.success) {
            setReviews(result.data || [])
            if (result.pagination) {
              setReviewsPagination(result.pagination)
            }
          } else {
            throw new Error(result.message || '리뷰 데이터를 불러오는데 실패했습니다.')
          }
        }
      } catch (error) {
        console.error('리뷰 데이터 로드 실패:', error)
        if (isMounted) {
          setReviewsError(error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.'))
        }
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
  }, [coachId, reviewsPage])
  
  // 정렬 변경 시 첫 페이지로 리셋
  useEffect(() => {
    setReviewsPage(1)
  }, [sortBy])

  // 리뷰 정렬
  // 주의: 현재는 서버에서 페이지네이션된 데이터를 받지만,
  // 클라이언트 사이드 정렬도 필요하므로 유지
  // 향후 서버 사이드 정렬로 전환 가능
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else if (sortBy === "high") {
      return b.rating - a.rating
    } else {
      return a.rating - b.rating
    }
  })
  
  // 페이지네이션 페이지 번호 생성
  const getReviewPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const totalPages = reviewsPagination.totalPages
    const current = reviewsPagination.page

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
  
  const handleKakaoChat = () => {
    const chatUrl = process.env.NEXT_PUBLIC_KAKAO_CHAT_URL || 'https://open.kakao.com/o/s6kCFbZh'
    window.open(chatUrl, '_blank', 'noopener,noreferrer')
  }

  const handleEnrollClick = () => {
    if (!currentUser) {
      // 비회원은 로그인 페이지로 리다이렉트
      window.location.href = '/login'
      return
    }

    if (currentUser.role !== 'user') {
      toast.error('일반 사용자만 수강 신청이 가능합니다.')
      return
    }

    // 구매 페이지로 이동
    window.location.href = `/coaches/${coachId}/purchase`
  }

  const handleEnrollSubmit = async () => {
    if (!currentUser || !currentUser.id) {
      toast.error('로그인이 필요합니다.')
      return
    }

    setEnrollLoading(true)
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          coachId: coachId,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success('수강 신청이 완료되었습니다.')
        setIsEnrollDialogOpen(false)
        setEnrollmentStatus('pending')
        // 코치 정보 새로고침 (students 수 업데이트)
        window.location.reload()
      } else {
        toast.error(result.message || '수강 신청 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('수강 신청 실패:', error)
      toast.error('수강 신청 중 오류가 발생했습니다.')
    } finally {
      setEnrollLoading(false)
    }
  }

  const getEnrollButtonText = () => {
    if (!currentUser || currentUser.role !== 'user') {
      return '강의 구매'
    }

    switch (enrollmentStatus) {
      case 'pending':
        return '수강 신청 대기 중'
      case 'approved':
        return '수강 신청 승인됨'
      case 'rejected':
        return '수강 신청 거절됨'
      case 'completed':
        return '수강 완료'
      case 'cancelled':
        return '수강 신청 취소됨'
      default:
        return '수강 신청하기'
    }
  }

  const isEnrollButtonDisabled = () => {
    if (!currentUser || currentUser.role !== 'user') {
      return false // 강의 구매 버튼은 항상 활성화
    }

    return enrollmentStatus === 'pending' || enrollmentStatus === 'approved' || enrollmentStatus === 'completed'
  }

  // 가격 처리 (숫자 또는 문자열 지원)
  const getPriceValue = (price: number | string | null): number | null => {
    if (!price) return null
    if (typeof price === 'number') return price
    // 문자열인 경우 숫자 추출
    const numbersOnly = price.toString().replace(/,/g, '').match(/\d+/)
    return numbersOnly ? parseInt(numbersOnly[0]) : null
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <ErrorDisplay 
          error={error} 
          onRetry={() => {
            setError(null)
            window.location.reload()
          }} 
        />
        <FooterSection />
      </main>
    )
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

  // 할인 정보 계산
  let displayPrice: number | null = null
  let originalPrice: number | null = null
  let discount: number | null = null
  
  // DB 데이터: price는 숫자(원가), discount는 할인율
  originalPrice = getPriceValue(coach.price)
  discount = coach.discount || null
  
  // 할인가 계산
  if (discount && originalPrice) {
    displayPrice = Math.round(originalPrice * (1 - discount / 100))
  } else {
    displayPrice = originalPrice
  }

  // introductionItems 분리: 강의 대상, 강의 효과, 나머지
  const targetItems = coach.introductionItems?.filter(item => item.title === "강의 대상") || []
  const effectItems = coach.introductionItems?.filter(item => item.title === "강의 효과") || []
  const otherItems = coach.introductionItems?.filter(item => item.title !== "강의 대상" && item.title !== "강의 효과" && !item.title.startsWith("__")) || []
  
  // 포지션과 요원 정보 파싱
  const positionsItem = coach.introductionItems?.find(item => item.title === "__positions__")
  const agentsItem = coach.introductionItems?.find(item => item.title === "__agents__")
  const courseTypeItem = coach.introductionItems?.find(item => item.title === "__courseType__")
  let positions: string[] = []
  let agents: string[] = []
  let courseType = "온라인" // 기본값
  
  // 강의 유형 파싱
  if (courseTypeItem?.content) {
    try {
      const courseTypeData = JSON.parse(courseTypeItem.content)
      if (courseTypeData.type === "온라인 강의") {
        courseType = "온라인"
      } else if (courseTypeData.type === "오프라인 강의") {
        courseType = "오프라인"
      }
    } catch {
      // 파싱 실패 시 기본값 사용
    }
  }
  
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
            <h1 className="text-3xl font-bold">{coach.headline || "에임, 피지컬 강의 국내 No.1"}</h1>
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
                  <div className="w-full rounded-lg overflow-hidden">
                    <Image
                      src={coach.introductionImage || "/uploads/coaches/1762077719977_qq.jpg"}
                      alt="강의 소개 이미지"
                      width={1200}
                      height={0}
                      className="w-full h-auto rounded-lg"
                      sizes="(max-width: 768px) 100vw, 66vw"
                      priority
                    />
                  </div>

                  {/* 강의 소개 */}
                  {otherItems.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                        <h2 className="text-xl font-bold mb-6">이 강의는 {courseType} 강의로, {coach.headline || "에임, 피지컬 강의 국내 No.1"}</h2>
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
                                <div className="flex flex-wrap gap-2">
                                  {coach.specialties.map((specialty, idx) => (
                                    <Badge key={idx} variant="outline">{specialty}</Badge>
                                  ))}
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
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">
                          커리큘럼 {coach.totalCourseTime ? `총 ${coach.totalCourseTime}` : ''}
                        </h2>
                        {coach.curriculumItems && coach.curriculumItems.length > 0 && (
                          <Badge variant="outline" className="text-sm">
                            {coach.curriculumItems.length}개 강의
                          </Badge>
                        )}
                      </div>
                      {coach.curriculumItems && coach.curriculumItems.length > 0 ? (
                        <div className="space-y-3">
                          {coach.curriculumItems.map((item, index) => (
                            <div 
                              key={index} 
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                                  {index + 1}
                                </div>
                                <span className="font-medium text-base truncate">
                                  {item.title || `강의 ${index + 1}`}
                                </span>
                              </div>
                              {item.duration && (
                                <Badge variant="secondary" className="flex-shrink-0">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {item.duration}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <p className="text-muted-foreground">등록된 커리큘럼이 없습니다.</p>
                        </div>
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
                      {reviewsError ? (
                        <ErrorDisplay 
                          error={reviewsError} 
                          message="리뷰를 불러오는 중 오류가 발생했습니다."
                          onRetry={() => {
                            setReviewsError(null)
                            window.location.reload()
                          }}
                          className="py-10"
                        />
                      ) : reviewsLoading ? (
                        <div className="flex justify-center items-center py-10">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      ) : sortedReviews.length === 0 ? (
                        <div className="text-center py-10">
                          <p className="text-muted-foreground">아직 등록된 후기가 없습니다.</p>
                        </div>
                      ) : (
                      <>
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
                                  <p className="text-muted-foreground">{sanitizeText(review.comment)}</p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        
                        {/* 페이지네이션 */}
                        {reviewsPagination.totalPages >= 1 && reviewsPagination.totalCount > 0 && (
                          <div className="mt-8">
                            <Pagination className="w-full">
                              <PaginationContent className="flex-wrap justify-center">
                                <PaginationItem>
                                  <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      if (reviewsPagination.hasPrevPage) {
                                        setReviewsPage(reviewsPagination.page - 1)
                                        window.scrollTo({ top: 0, behavior: 'smooth' })
                                      }
                                    }}
                                    className={!reviewsPagination.hasPrevPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                  />
                                </PaginationItem>

                                {getReviewPageNumbers().map((pageNum, index) => {
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
                                          setReviewsPage(pageNum)
                                          window.scrollTo({ top: 0, behavior: 'smooth' })
                                        }}
                                        isActive={pageNum === reviewsPagination.page}
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
                                      if (reviewsPagination.hasNextPage) {
                                        setReviewsPage(reviewsPagination.page + 1)
                                        window.scrollTo({ top: 0, behavior: 'smooth' })
                                      }
                                    }}
                                    className={!reviewsPagination.hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                  />
                                </PaginationItem>
                              </PaginationContent>
                            </Pagination>
                          </div>
                        )}
                      </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* 우측: 사이드바 (sticky) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* 섬네일 이미지 */}
                <div className="relative w-full aspect-video rounded-lg overflow-hidden max-h-64">
                  <Image
                    src={coach.thumbnailImage || "/uploads/coaches/1762077719977_qq.jpg"}
                    alt="사이드바 이미지"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                </div>

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
                      onClick={() => {
                        if (!currentUser) {
                          // 비회원은 로그인 페이지로 이동
                          window.location.href = '/login'
                        } else if (isEnrollButtonDisabled()) {
                          // 이미 신청한 경우 아무 동작 안 함
                          return
                        } else if (currentUser.role === 'user') {
                          // 일반 사용자는 수강 신청 다이얼로그 열기
                          handleEnrollClick()
                        } else {
                          // 코치나 관리자는 카카오 채팅
                          handleKakaoChat()
                        }
                      }}
                      disabled={isEnrollButtonDisabled()}
                    >
                      {getEnrollButtonText()}
                    </Button>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>• 총 {coach.curriculumItems?.length || 1}개의 커리큘럼 {coach.totalCourseTime ? `(${coach.totalCourseTime})` : '(1시간)'}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* 코치 정보 */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      {coach.profileImage ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
                          <Image
                            src={coach.profileImage}
                            alt={coach.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="font-bold text-primary">{coach.name.charAt(0)}</span>
                        </div>
                      )}
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

      {/* 수강 신청 다이얼로그 */}
      <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>수강 신청</DialogTitle>
            <DialogDescription>
              {coach.name} 코치에게 수강 신청을 하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEnrollDialogOpen(false)
              }}
              disabled={enrollLoading}
            >
              취소
            </Button>
            <Button
              onClick={handleEnrollSubmit}
              disabled={enrollLoading}
            >
              {enrollLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  신청 중...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  신청하기
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FooterSection />
    </main>
  )
}