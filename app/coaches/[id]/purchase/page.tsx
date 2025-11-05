"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/header"
import { FooterSection } from "@/components/footer-section"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ChevronLeft, Clock, Search, Shield, Target, Zap, Crosshair } from "lucide-react"
import { checkAuth, type User } from "@/lib/auth"
import { toast } from "sonner"
import { fetchWithCsrf } from "@/lib/csrf-client"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface Coach {
  id: number
  name: string
  specialty: string
  tier: string
  experience: string
  rating: number
  reviews: number
  price: number | null
  discount: number | null
  description: string | null
  headline: string | null
  thumbnailImage: string | null
  introductionImage: string | null
  introductionContent: string | null
  curriculumItems: Array<{ title: string; duration: string }>
  totalCourseTime: string | null
}

interface IntroductionItem {
  title: string
  content: string
  items?: string[]
  videoUrl?: string | null
}

export default function PurchasePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const coachId = parseInt(params.id, 10)
  const [coach, setCoach] = useState<Coach | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  
  // 예약 일정
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [loadingTimes, setLoadingTimes] = useState(false)
  
  // 게임 정보
  const [selectedRank, setSelectedRank] = useState<string>("")
  const [selectedPositions, setSelectedPositions] = useState<string[]>([])
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [agentSearchQuery, setAgentSearchQuery] = useState("")

  // 게임별 랭크 목록
  const getRankOptions = (gameSpecialty: string) => {
    switch (gameSpecialty) {
      case "발로란트":
        return [
          { value: "iron", label: "아이언" },
          { value: "bronze", label: "브론즈" },
          { value: "silver", label: "실버" },
          { value: "gold", label: "골드" },
          { value: "platinum", label: "플래티넘" },
          { value: "diamond", label: "다이아몬드" },
          { value: "ascendant", label: "초월자" },
          { value: "immortal", label: "불멸" },
          { value: "radiant", label: "레디언트" },
        ]
      case "리그 오브 레전드":
        return [
          { value: "iron", label: "아이언" },
          { value: "bronze", label: "브론즈" },
          { value: "silver", label: "실버" },
          { value: "gold", label: "골드" },
          { value: "platinum", label: "플래티넘" },
          { value: "emerald", label: "에메랄드" },
          { value: "diamond", label: "다이아" },
          { value: "master", label: "마스터" },
          { value: "grandmaster", label: "그랜드마스터" },
          { value: "challenger", label: "챌린저" },
        ]
      case "오버워치 2":
        return [
          { value: "bronze", label: "브론즈" },
          { value: "silver", label: "실버" },
          { value: "gold", label: "골드" },
          { value: "platinum", label: "플래티넘" },
          { value: "diamond", label: "다이아몬드" },
          { value: "master", label: "마스터" },
          { value: "grandmaster", label: "그랜드마스터" },
        ]
      case "배틀그라운드":
        return [
          { value: "bronze", label: "브론즈" },
          { value: "silver", label: "실버" },
          { value: "gold", label: "골드" },
          { value: "platinum", label: "플래티넘" },
          { value: "diamond", label: "다이아몬드" },
          { value: "master", label: "마스터" },
        ]
      default:
        // 기본값: 발로란트
        return [
          { value: "iron", label: "아이언" },
          { value: "bronze", label: "브론즈" },
          { value: "silver", label: "실버" },
          { value: "gold", label: "골드" },
          { value: "platinum", label: "플래티넘" },
          { value: "diamond", label: "다이아몬드" },
          { value: "ascendant", label: "초월자" },
          { value: "immortal", label: "불멸" },
          { value: "radiant", label: "레디언트" },
        ]
    }
  }

  const rankOptions = coach ? getRankOptions(coach.specialty) : []

  // 가격 계산
  const originalPrice = coach?.price || 0
  const discountRate = coach?.discount || 0
  const discountAmount = Math.floor(originalPrice * (discountRate / 100))
  const finalPrice = originalPrice - discountAmount

  // 가장 빠른 일정 찾기
  const findEarliestAvailableSlot = async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 1)
    maxDate.setHours(23, 59, 59, 999)

    // 오늘부터 한 달 내에서 가장 빠른 예약 가능한 날짜 찾기
    for (let d = new Date(today); d <= maxDate; d.setDate(d.getDate() + 1)) {
      const dateString = format(d, 'yyyy-MM-dd')
      try {
        const response = await fetch(`/api/coaches/${coachId}/available-times?date=${dateString}`)
        const result = await response.json()

        if (result.success && result.data && result.data.availableSlots.length > 0) {
          let times = result.data.availableSlots

          // 오늘 날짜인 경우, 현재 시간 기준 30분 미만인 시간 슬롯 필터링
          const todayOnly = new Date()
          todayOnly.setHours(0, 0, 0, 0)
          const checkDate = new Date(d)
          checkDate.setHours(0, 0, 0, 0)

          if (checkDate.getTime() === todayOnly.getTime()) {
            const now = new Date()
            times = times.filter((time: string) => {
              const [hours, minutes] = time.split(':').map(Number)
              const timeSlot = new Date(d)
              timeSlot.setHours(hours, minutes, 0, 0)
              const diffMs = timeSlot.getTime() - now.getTime()
              const diffMinutes = diffMs / (1000 * 60)
              return diffMinutes >= 30
            })
          }

          if (times.length > 0) {
            setSelectedDate(d)
            setSelectedTime(times[0])
            return
          }
        }
      } catch (error) {
        console.error(`날짜 ${dateString} 조회 실패:`, error)
        continue
      }
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        const user = await checkAuth()
        if (!user) {
          router.push('/login')
          return
        }
        if (user.role !== 'user') {
          toast.error('일반 사용자만 강의 구매가 가능합니다.')
          router.push(`/coaches/${coachId}`)
          return
        }
        setCurrentUser(user)

        // 코치 정보 조회
        const coachResponse = await fetch(`/api/coaches/${coachId}`)
        const coachResult = await coachResponse.json()

        if (coachResult.success && coachResult.data) {
          setCoach(coachResult.data)
          // 코치 정보 로드 후 가장 빠른 일정 찾기
          await findEarliestAvailableSlot()
        } else {
          toast.error('코치 정보를 불러올 수 없습니다.')
          router.push(`/coaches/${coachId}`)
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error)
        toast.error('데이터를 불러오는 중 오류가 발생했습니다.')
        router.push(`/coaches/${coachId}`)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [coachId, router])

  // 날짜 선택 시 예약 가능한 시간 조회 (디바운싱 적용)
  useEffect(() => {
    if (!selectedDate) {
      setAvailableTimes([])
      setSelectedTime("")
      return
    }

    // 디바운싱: 300ms 후에 API 호출
    const timeoutId = setTimeout(async () => {
      setLoadingTimes(true)
      try {
        const dateString = format(selectedDate, 'yyyy-MM-dd')
        const response = await fetch(`/api/coaches/${coachId}/available-times?date=${dateString}`)
        
        // 응답이 오기 전에 날짜가 변경되었는지 확인
        if (!selectedDate) {
          return
        }
        
        const result = await response.json()

        if (result.success && result.data) {
          let times = result.data.availableSlots || []
          
          // 오늘 날짜인 경우, 현재 시간 기준 30분 미만인 시간 슬롯 필터링
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const selectedDateOnly = new Date(selectedDate)
          selectedDateOnly.setHours(0, 0, 0, 0)
          
          if (selectedDateOnly.getTime() === today.getTime()) {
            const now = new Date()
            times = times.filter((time: string) => {
              const [hours, minutes] = time.split(':').map(Number)
              const timeSlot = new Date(selectedDate)
              timeSlot.setHours(hours, minutes, 0, 0)
              
              // 현재 시간과 시간 슬롯의 차이 계산 (밀리초)
              const diffMs = timeSlot.getTime() - now.getTime()
              const diffMinutes = diffMs / (1000 * 60)
              
              // 30분 이상 남은 시간 슬롯만 표시
              return diffMinutes >= 30
            })
          }
          
          setAvailableTimes(times)
          if (times.length > 0) {
            setSelectedTime(times[0])
          } else {
            setSelectedTime("")
            toast.info('선택한 날짜에 예약 가능한 시간이 없습니다.')
          }
        } else {
          setAvailableTimes([])
          setSelectedTime("")
        }
      } catch (error) {
        console.error('예약 가능한 시간 조회 실패:', error)
        toast.error('예약 가능한 시간을 불러오는 중 오류가 발생했습니다.')
        setAvailableTimes([])
        setSelectedTime("")
      } finally {
        setLoadingTimes(false)
      }
    }, 300)

    // cleanup: 날짜가 변경되거나 컴포넌트가 언마운트될 때 타이머 취소
    return () => {
      clearTimeout(timeoutId)
    }
  }, [selectedDate, coachId])

  const handlePurchase = async () => {
    if (!currentUser || !coach) {
      toast.error('로그인이 필요합니다.')
      return
    }

    setPurchasing(true)

    try {
      // 게임 정보를 JSON 형식으로 준비
      const gameInfo = {
        rank: selectedRank || null,
        positions: selectedPositions.length > 0 ? selectedPositions : null,
        agents: selectedAgents.length > 0 ? selectedAgents : null,
      }
      const gameInfoMessage = Object.values(gameInfo).some(v => v !== null)
        ? JSON.stringify(gameInfo)
        : null

          // 1. 수강 신청 생성 (게임 정보 포함)
          const enrollmentResponse = await fetchWithCsrf('/api/enrollments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              coachId: coachId,
              message: gameInfoMessage,
            }),
          })

      const enrollmentResult = await enrollmentResponse.json()

      if (!enrollmentResponse.ok || !enrollmentResult.success) {
        throw new Error(enrollmentResult.message || '수강 신청 중 오류가 발생했습니다.')
      }

      toast.success('수강 신청이 완료되었습니다! 코치 승인 후 세션 예약이 가능합니다.')
      router.push(`/my/enrollments`)
    } catch (error: any) {
      console.error('구매 실패:', error)
      
      // 네트워크 오류인지 확인
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.')
      } else {
        toast.error(error.message || '구매 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      }
    } finally {
      setPurchasing(false)
    }
  }

  // introductionContent 파싱 (메타데이터 필터링)
  const introductionItems: IntroductionItem[] = coach?.introductionContent
    ? (() => {
        try {
          const parsed = JSON.parse(coach.introductionContent)
          const items = Array.isArray(parsed) ? parsed : []
          // 메타데이터 필터링 (__로 시작하는 항목 제외)
          return items.filter((item: any) => 
            item.title && 
            !item.title.startsWith('__') && 
            item.title !== '__positions__' && 
            item.title !== '__agents__' && 
            item.title !== '__courseType__'
          )
        } catch {
          return []
        }
      })()
    : []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!coach) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 뒤로가기 버튼 */}
        <Button
          variant="ghost"
          onClick={() => router.push(`/coaches/${coachId}`)}
          className="mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          뒤로가기
        </Button>

        <div className="flex gap-6">
          {/* 왼쪽 메인 콘텐츠 */}
          <div className="flex-1 space-y-6">
            <h1 className="text-3xl font-bold mb-6">강의 구매</h1>

            {/* 강의 정보 카드 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="w-48 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {coach.introductionImage || coach.thumbnailImage ? (
                      <Image
                        src={coach.introductionImage || coach.thumbnailImage || ''}
                        alt={coach.description || ''}
                        width={192}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        이미지 없음
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2">{coach.description || coach.headline || '강의 제목'}</h2>
                    <div className="flex items-center gap-3 mb-3">
                      {discountRate > 0 && (
                        <Badge className="bg-red-500">{(discountRate)}% 할인</Badge>
                      )}
                      <div className="flex items-center gap-2">
                        {discountRate > 0 && (
                          <span className="text-sm text-muted-foreground line-through">
                            {originalPrice.toLocaleString()}원
                          </span>
                        )}
                        <span className="text-2xl font-bold">
                          {finalPrice.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 내용 섹션 */}
            {introductionItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>내용</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {introductionItems.map((item, index) => (
                      <div key={index}>
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        <p className="text-muted-foreground whitespace-pre-line">{item.content}</p>
                        {item.items && item.items.length > 0 && (
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            {item.items.map((listItem, idx) => (
                              <li key={idx} className="text-muted-foreground">{listItem}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 커리큘럼 섹션 */}
            {coach.curriculumItems && coach.curriculumItems.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>커리큘럼</CardTitle>
                    <Badge variant="outline" className="text-sm">
                      {coach.totalCourseTime || `${coach.curriculumItems.length}시간`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            )}

            {/* 예약 일정 섹션 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">희망 일정</CardTitle>
                <CardDescription className="text-base">
                  코치가 가능한 가장 빠른 일정으로 기본 선택되며, 필요에 따라 일정 변경은 가능합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-8">
                  {/* 캘린더 - 크게 */}
                  <div className="flex-1">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date)
                        setSelectedTime('') // 날짜 변경 시 시간 초기화
                      }}
                      disabled={(date) => {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const maxDate = new Date()
                        maxDate.setMonth(maxDate.getMonth() + 1)
                        maxDate.setHours(23, 59, 59, 999)
                        return date < today || date > maxDate
                      }}
                      locale={ko}
                      className="rounded-lg border p-6 w-full"
                      formatters={{
                        formatCaption: (month, options) => {
                          const year = month.getFullYear()
                          const monthNum = month.getMonth() + 1
                          return `${year}년 ${monthNum}월`
                        },
                        formatWeekdayName: (date) => {
                          if (!date) return ''
                          const weekdays = ['일', '월', '화', '수', '목', '금', '토']
                          return weekdays[date.getDay()]
                        },
                      }}
                      components={{
                        CaptionLabel: ({ displayMonth, ...props }: any) => {
                          if (!displayMonth) {
                            return <span>{props.children}</span>
                          }
                          const year = displayMonth.getFullYear()
                          const month = displayMonth.getMonth() + 1
                          return <>{year}년 {month}월</>
                        },
                      }}
                      classNames={{
                        months: "flex flex-col space-y-4",
                        month: "space-y-4",
                        caption: "flex justify-center pt-1 relative items-center text-xl font-semibold mb-4",
                        caption_label: "text-xl font-semibold",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-10 w-10 rounded-md hover:bg-accent transition-colors",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex mb-2",
                        head_cell: "text-muted-foreground rounded-md w-14 font-medium text-base flex items-center justify-center",
                        row: "flex w-full mt-2",
                        cell: "h-14 w-14 text-center text-base p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "h-14 w-14 p-0 font-medium aria-selected:opacity-100 text-base rounded-md hover:bg-accent transition-colors",
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-semibold",
                        day_today: "bg-accent text-accent-foreground font-semibold",
                        day_outside: "text-muted-foreground opacity-50",
                        day_disabled: "text-muted-foreground opacity-30 cursor-not-allowed",
                        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        day_hidden: "invisible",
                      }}
                    />
                  </div>
                  
                  {/* 시간 선택 - 버튼 리스트로 */}
                  <div className="flex-1">
                    <Label className="mb-4 block text-lg font-semibold">시간 선택</Label>
                    {loadingTimes ? (
                      <div className="flex items-center justify-center h-[400px]">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : availableTimes.length > 0 ? (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {availableTimes.map((time) => (
                          <Button
                            key={time}
                            type="button"
                            variant={selectedTime === time ? "default" : "outline"}
                            className={`w-full h-14 text-lg font-medium ${
                              selectedTime === time 
                                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                                : "hover:bg-muted"
                            }`}
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    ) : selectedDate ? (
                      <div className="flex items-center justify-center h-[400px]">
                        <p className="text-base text-muted-foreground">예약 가능한 시간이 없습니다.</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-[400px]">
                        <p className="text-base text-muted-foreground">날짜를 먼저 선택해주세요.</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 내 게임 정보 섹션 */}
            <Card>
              <CardHeader>
                <CardTitle>내 게임 정보 <span className="text-sm font-normal text-muted-foreground">(선택사항)</span></CardTitle>
                <CardDescription>
                  코치님이 강의 준비 및 맞춤형 코칭을 위해 참고하는 정보입니다. 선택사항이며, 입력하지 않아도 강의 구매가 가능합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 랭크 선택 */}
                <div>
                  <Label htmlFor="rank">랭크</Label>
                  <Select value={selectedRank} onValueChange={setSelectedRank} disabled={!coach}>
                    <SelectTrigger id="rank" className="mt-2">
                      <SelectValue placeholder={coach ? "랭크를 선택해 주세요." : "코치 정보를 불러오는 중..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {rankOptions.map((rank) => (
                        <SelectItem key={rank.value} value={rank.value}>
                          {rank.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 포지션 선택 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>포지션</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (selectedPositions.length === 4) {
                          setSelectedPositions([])
                        } else {
                          setSelectedPositions(["sentinel", "controller", "initiator", "duelist"])
                        }
                      }}
                    >
                      모두 선택
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "sentinel", label: "감시자", icon: Shield },
                      { value: "controller", label: "전략가", icon: Target },
                      { value: "initiator", label: "척후대", icon: Zap },
                      { value: "duelist", label: "타격대", icon: Crosshair },
                    ].map((position) => {
                      const Icon = position.icon
                      const isSelected = selectedPositions.includes(position.value)
                      return (
                        <Button
                          key={position.value}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          className={`h-auto py-4 flex flex-col items-center gap-2 ${
                            isSelected ? "bg-primary text-primary-foreground" : ""
                          }`}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedPositions(selectedPositions.filter(p => p !== position.value))
                            } else {
                              setSelectedPositions([...selectedPositions, position.value])
                            }
                          }}
                        >
                          <Icon className="w-6 h-6" />
                          <span>{position.label}</span>
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* 요원 선택 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>요원</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const allAgents = [
                          "게코", "네온", "데드록", "레이나", "레이즈", "바이퍼",
                          "브리치", "브림스톤", "사이퍼", "세이지", "소바", "스카이",
                          "아스트라", "아이소", "오멘", "요루", "제트", "체임버",
                          "케이/오", "클로브", "킬조이", "페이드", "피닉스", "하버"
                        ]
                        if (selectedAgents.length === allAgents.length) {
                          setSelectedAgents([])
                        } else {
                          setSelectedAgents(allAgents)
                        }
                      }}
                    >
                      모두 선택
                    </Button>
                  </div>
                  
                  {/* 검색 바 */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="요원 검색"
                      value={agentSearchQuery}
                      onChange={(e) => setAgentSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* 요원 목록 */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto">
                    {[
                      "게코", "네온", "데드록", "레이나", "레이즈", "바이퍼",
                      "브리치", "브림스톤", "사이퍼", "세이지", "소바", "스카이",
                      "아스트라", "아이소", "오멘", "요루", "제트", "체임버",
                      "케이/오", "클로브", "킬조이", "페이드", "피닉스", "하버"
                    ]
                      .filter(agent => agent.toLowerCase().includes(agentSearchQuery.toLowerCase()))
                      .map((agent) => {
                        const isSelected = selectedAgents.includes(agent)
                        return (
                          <Button
                            key={agent}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            className={`h-auto py-3 flex flex-col items-center gap-2 relative ${
                              isSelected ? "bg-primary text-primary-foreground" : ""
                            }`}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedAgents(selectedAgents.filter(a => a !== agent))
                              } else {
                                setSelectedAgents([...selectedAgents, agent])
                              }
                            }}
                          >
                            <div className={`w-12 h-12 rounded-full ${isSelected ? "bg-primary-foreground/20" : "bg-muted"} flex items-center justify-center text-xs font-semibold`}>
                              {agent.charAt(0)}
                            </div>
                            <span className="text-xs">{agent}</span>
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-4 h-4 bg-primary-foreground rounded-full flex items-center justify-center">
                                <span className="text-primary text-[10px]">✓</span>
                              </div>
                            )}
                          </Button>
                        )
                      })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 환불 규정 및 자주 묻는 질문 */}
            <Card className="p-0">
              <CardContent className="p-0">
                <Accordion type="single" collapsible>
                  <AccordionItem value="refund" className="border-b">
                    <AccordionTrigger className="px-6 py-4">
                      <span className="flex-1 text-left">환불 규정</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-6 pb-4 space-y-2 text-sm text-muted-foreground">
                        <p>• 수강 시작 전: 전액 환불 가능</p>
                        <p>• 수강 시작 후 7일 이내: 50% 환불 가능</p>
                        <p>• 수강 시작 후 7일 이후: 환불 불가</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="faq" className="border-b last:border-b-0">
                    <AccordionTrigger className="px-6 py-4">
                      <span className="flex-1 text-left">자주 묻는 질문</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-6 pb-4 space-y-4 text-sm">
                        <div>
                          <p className="font-semibold mb-1">Q. 강의는 어떻게 진행되나요?</p>
                          <p className="text-muted-foreground">1:1 맞춤형 강의로 진행됩니다. 예약하신 시간에 코치와 연결됩니다.</p>
                        </div>
                        <div>
                          <p className="font-semibold mb-1">Q. 환불은 어떻게 하나요?</p>
                          <p className="text-muted-foreground">마이페이지에서 환불 신청이 가능합니다.</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽 결제 정보 사이드바 */}
          <div className="w-80 flex-shrink-0">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>결제 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDate && selectedTime && (
                  <>
                    <div>
                      <Label className="text-sm text-muted-foreground">예약일</Label>
                      <p className="font-medium">{format(selectedDate, 'yyyy-MM-dd', { locale: ko })}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">예약 시간</Label>
                      <p className="font-medium">{selectedTime}</p>
                    </div>
                  </>
                )}
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">상품 금액</span>
                    <span>{originalPrice.toLocaleString()}원</span>
                  </div>
                  {discountRate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">할인 금액</span>
                      <span className="text-red-500">-{discountAmount.toLocaleString()}원</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>총 결제 금액</span>
                    <span>{finalPrice.toLocaleString()}원</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                  onClick={handlePurchase}
                  disabled={purchasing || !selectedDate || !selectedTime}
                >
                  {purchasing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      구매 중...
                    </>
                  ) : (
                    '구매하기'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <FooterSection />
    </main>
  )
}

