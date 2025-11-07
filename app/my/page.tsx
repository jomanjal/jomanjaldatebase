"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { checkAuth } from "@/lib/auth"
import { Loader2, UserCircle, BookOpen, Star, Users, Edit, UserCheck, MessageSquare, Calendar, TrendingUp, CheckCircle, Clock, FolderCheck, AlertCircle, Search, Info } from "lucide-react"
import Link from "next/link"
import { format, addDays, startOfWeek, isSameDay } from "date-fns"
import { ko } from "date-fns/locale"

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
  specialties: string[]
  description: string | null
  profileImage: string | null
  verified: boolean
  active?: boolean
}

interface Stats {
  satisfaction: {
    rating: number
    messageResponseRate: number
    scheduleComplianceRate: number
    orderSuccessRate: number
  }
  revenue: {
    totalRevenue: number
    totalSales: number
    todayRevenue: number
    todaySales: number
  }
  sales: {
    pending: number
    approved: number
    inProgress: number
    completed: number
    confirmed: number
    cancelled: number
  }
}

interface Schedule {
  dayOfWeek: number
  enabled: boolean
  startTime: string
  endTime: string
}

export default function MyPage() {
  const [coach, setCoach] = useState<Coach | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingActive, setUpdatingActive] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) // 월요일 기준
    const monday = new Date(today.setDate(diff))
    monday.setHours(0, 0, 0, 0)
    return monday
  })

  useEffect(() => {
    async function loadData() {
      try {
        const user = await checkAuth()
        if (!user) {
          window.location.href = '/login'
          return
        }

        setCurrentUser(user)

        // 코치 프로필 조회 (코치만)
        if (user.role === 'coach') {
          const [coachResponse, statsResponse, scheduleResponse] = await Promise.all([
            fetch('/api/coaches/my', { credentials: 'include' }),
            fetch('/api/coaches/my/stats', { credentials: 'include' }),
            fetch('/api/coaches/my/schedule', { credentials: 'include' })
          ])

          const coachResult = await coachResponse.json()
          if (coachResult.success && coachResult.data) {
            setCoach(coachResult.data)
          }

          const statsResult = await statsResponse.json()
          if (statsResult.success && statsResult.data) {
            setStats(statsResult.data)
          }

          const scheduleResult = await scheduleResponse.json()
          if (scheduleResult.success && scheduleResult.data) {
            setSchedules(scheduleResult.data)
          }
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleToggleActive = async (active: boolean) => {
    setUpdatingActive(true)
    try {
      const response = await fetch('/api/coaches/my', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ active }),
      })

      const result = await response.json()

      if (result.success && coach) {
        setCoach({ ...coach, active })
      }
    } catch (error) {
      console.error('활성화 상태 업데이트 실패:', error)
    } finally {
      setUpdatingActive(false)
    }
  }

  const handlePrevWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7))
  }

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7))
  }

  const handleTodaySchedule = () => {
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) // 월요일 기준
    const monday = new Date(today.setDate(diff))
    monday.setHours(0, 0, 0, 0)
    setCurrentWeekStart(monday)
  }

  // 주간 날짜 배열 생성
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))
  const weekEnd = addDays(currentWeekStart, 6)

  // 특정 날짜의 일정 가져오기
  const getScheduleForDate = (date: Date) => {
    const dayOfWeek = date.getDay() === 0 ? 6 : date.getDay() - 1 // 0: 월요일, 6: 일요일
    return schedules.find(s => s.dayOfWeek === dayOfWeek && s.enabled)
  }

  // 시간 슬롯 생성 (30분 단위)
  const generateTimeSlots = (startTime: string, endTime: string) => {
    const slots: string[] = []
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    
    let currentHour = startHour
    let currentMin = startMin
    
    while (currentHour < endHour || (currentHour === endHour && currentMin <= endMin)) {
      slots.push(`${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`)
      currentMin += 30
      if (currentMin >= 60) {
        currentMin = 0
        currentHour += 1
      }
    }
    
    return slots
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary01)] mx-auto mb-4" />
          <p className="text-[var(--text04)]">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 환영 메시지 */}
      <div>
        <h1 className="text-xl font-semibold mb-1 text-[var(--text01)]">
          {currentUser?.username || "사용자"}님, 안녕하세요.
        </h1>
        <p className="text-[var(--text04)] text-xs">대시보드에서 주요 정보를 확인하세요.</p>
      </div>

      {/* 탭 네비게이션 (코치인 경우) */}
      {coach && (
        <Tabs defaultValue="expert" className="w-full">
          <TabsList className="bg-transparent border-b border-[var(--divider01)] p-0 h-auto gap-0">
            <TabsTrigger 
              value="expert" 
              className="data-[state=active]:bg-transparent data-[state=active]:text-[var(--primary01)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--primary01)] rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium text-[var(--text04)] hover:text-[var(--text01)]"
            >
              전문가
            </TabsTrigger>
            <TabsTrigger 
              value="general" 
              className="data-[state=active]:bg-transparent data-[state=active]:text-[var(--primary01)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--primary01)] rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium text-[var(--text04)] hover:text-[var(--text01)]"
            >
              일반
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expert" className="mt-4 space-y-6">
            {/* 통합 대시보드 카드 */}
            <Card className="bg-[var(--layer02)] ">
              <CardHeader>
                <CardTitle className="text-lg text-[var(--text01)]">대시보드</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* 상단: 강의 만족도 + 매출 현황 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* 강의 만족도 섹션 */}
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-[var(--text01)] mb-3">강의 만족도</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[var(--primaryOpacity01)] flex items-center justify-center">
                          <Star className="w-5 h-5 text-[var(--systemSuccess01)]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-[var(--text04)] mb-1">만족도</p>
                          <p className="text-xl font-bold text-[var(--text01)]">
                            {stats ? `${(stats.satisfaction.rating * 20).toFixed(1)}%` : `${(coach.rating * 20).toFixed(1)}%`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[var(--primaryOpacity01)] flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-[var(--primary01)]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-[var(--text04)] mb-1">메시지 응답</p>
                          <p className="text-xl font-bold text-[var(--text01)]">
                            {stats ? `${stats.satisfaction.messageResponseRate}%` : '0%'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[var(--primaryOpacity01)] flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-[var(--systemWarning01)]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-[var(--text04)] mb-1">일정 준수</p>
                          <p className="text-xl font-bold text-[var(--text01)]">
                            {stats ? `${stats.satisfaction.scheduleComplianceRate}%` : '0%'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[var(--primaryOpacity01)] flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-[var(--systemSuccess01)]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-[var(--text04)] mb-1">주문 성공</p>
                          <p className="text-xl font-bold text-[var(--text01)]">
                            {stats ? `${stats.satisfaction.orderSuccessRate}%` : '0%'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 매출 현황 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-[var(--text01)]">매출 현황</h3>
                      <Link href="#" className="text-xs text-[var(--text04)] hover:text-[var(--textPrimary)]">
                        전체보기
                      </Link>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[var(--text04)]">누적 수익금</p>
                        <p className="text-base font-bold text-[var(--text01)]">
                          {stats ? `₩${stats.revenue.totalRevenue.toLocaleString()}` : (coach.price ? `₩${(coach.price * coach.students).toLocaleString()}` : "-")}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[var(--text04)]">누적 판매 건</p>
                        <p className="text-base font-bold text-[var(--text01)]">
                          {stats ? `${stats.revenue.totalSales}건` : `${coach.students}건`}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[var(--text04)]">금일 수익금</p>
                        <p className="text-base font-bold text-[var(--text01)]">
                          {stats ? `₩${stats.revenue.todayRevenue.toLocaleString()}` : '₩0'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[var(--text04)]">금일 판매 건</p>
                        <p className="text-base font-bold text-[var(--text01)]">
                          {stats ? `${stats.revenue.todaySales}건` : '0건'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 하단: 판매 현황 + 일정 관리 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t border-[var(--divider01)]">
                  {/* 판매 현황 */}
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-[var(--text01)] mb-3">판매 현황</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-8 bg-[var(--primary01)] rounded-full"></div>
                        <div>
                          <p className="text-xs text-[var(--text04)]">대기</p>
                          <p className="text-lg font-bold text-[var(--text01)]">{stats ? stats.sales.pending : 0}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-8 bg-[var(--systemSuccess01)] rounded-full"></div>
                        <div>
                          <p className="text-xs text-[var(--text04)]">일정 확정</p>
                          <p className="text-lg font-bold text-[var(--text01)]">{stats ? stats.sales.approved : 0}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-8 bg-[var(--systemWarning01)] rounded-full"></div>
                        <div>
                          <p className="text-xs text-[var(--text04)]">진행 중</p>
                          <p className="text-lg font-bold text-[var(--text01)]">{stats ? stats.sales.inProgress : 0}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-8 bg-[var(--systemSuccess01)] rounded-full"></div>
                        <div>
                          <p className="text-xs text-[var(--text04)]">완료</p>
                          <p className="text-lg font-bold text-[var(--text01)]">{stats ? stats.sales.completed : coach.students}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-8 bg-[var(--systemDanger01)] rounded-full"></div>
                        <div>
                          <p className="text-xs text-[var(--text04)]">확정</p>
                          <p className="text-lg font-bold text-[var(--text01)]">{stats ? stats.sales.confirmed : coach.students}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-8 bg-[var(--text04)] rounded-full"></div>
                        <div>
                          <p className="text-xs text-[var(--text04)]">취소</p>
                          <p className="text-lg font-bold text-[var(--text01)]">{stats ? stats.sales.cancelled : 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 일정 관리 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-[var(--text01)]">일정 관리</h3>
                      <Button size="sm" onClick={handleTodaySchedule}>
                        오늘 일정 모아보기
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {/* 날짜 선택 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={handlePrevWeek}>
                            ←
                          </Button>
                          <span className="text-xs font-medium text-[var(--text01)]">
                            {format(currentWeekStart, 'yyyy년 MM월 dd일', { locale: ko })} ~ {format(weekEnd, 'MM월 dd일', { locale: ko })}
                          </span>
                          <Button variant="outline" size="sm" onClick={handleNextWeek}>
                            →
                          </Button>
                        </div>
                      </div>
                      
                      {/* 주간 캘린더 그리드 */}
                      <div className="border border-[var(--divider01)] rounded-md overflow-hidden">
                        {/* 요일 헤더 */}
                        <div className="grid grid-cols-7 border-b border-[var(--divider01)] bg-[var(--layer01)]">
                          {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                            <div key={index} className="p-2 text-center text-xs font-medium text-[var(--text04)] border-r border-[var(--divider01)] last:border-r-0">
                              {day}
                            </div>
                          ))}
                        </div>
                        
                        {/* 날짜 그리드 */}
                        <div className="grid grid-cols-7">
                          {weekDates.map((date, index) => {
                            const schedule = getScheduleForDate(date)
                            const isToday = isSameDay(date, new Date())
                            const timeSlots = schedule ? generateTimeSlots(schedule.startTime, schedule.endTime).slice(0, 3) : []
                            
                            return (
                              <div key={index} className="p-2 min-h-[80px] border-r border-b border-[var(--divider01)] last:border-r-0">
                                <div className={`text-xs mb-1 text-center ${
                                  isToday ? 'bg-[var(--primary01)] text-white rounded px-1 py-0.5 font-semibold' : 'text-[var(--text04)]'
                                }`}>
                                  {format(date, 'dd일 (E)', { locale: ko })}
                                </div>
                                <div className="space-y-1">
                                  {schedule && schedule.enabled ? (
                                    timeSlots.length > 0 ? (
                                      timeSlots.map((time, idx) => (
                                        <div key={idx} className="text-xs text-[var(--text04)]">
                                          {time}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-xs text-[var(--text04)]">
                                        {schedule.startTime} ~ {schedule.endTime}
                                      </div>
                                    )
                                  ) : (
                                    <div className="text-xs text-[var(--text04)] opacity-50">
                                      휴무
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 프로필 카드 - 그리드 밖에 배치 */}
            <Card className="bg-[var(--layer02)] ">
            <CardHeader>
              <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-[var(--text01)]">프로필 정보</CardTitle>
                <Button variant="outline" asChild>
                  <Link href="/my/course">
                    <Edit className="w-4 h-4 mr-2" />
                    강의 설정
                  </Link>
                </Button>
              </div>
            </CardHeader>
              <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                    {coach.profileImage ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--primary01)]">
                        <Image
                          src={coach.profileImage}
                          alt={coach.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-[var(--primary01)] rounded-full flex items-center justify-center">
                        <UserCircle className="w-8 h-8 text-white" />
                      </div>
                    )}
                  <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[var(--text01)]">{coach.name}</h3>
                      <p className="text-xs text-[var(--text04)]">{coach.specialty} • {coach.tier}</p>
                  </div>
                  <div>
                    {coach.verified ? (
                        <Badge className="bg-[var(--systemSuccess01)] text-white">승인됨</Badge>
                    ) : (
                        <Badge variant="outline" className="bg-[var(--systemWarning01)]/10 text-[var(--systemWarning01)] border-[var(--systemWarning01)]">
                        승인 대기
                      </Badge>
                    )}
                  </div>
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[var(--divider01)]">
                  <div>
                      <p className="text-xs text-[var(--text04)] mb-1">평점</p>
                    <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-[var(--textYellow)] text-[var(--textYellow)]" />
                        <span className="text-xl font-bold text-[var(--text01)]">{coach.rating.toFixed(1)}</span>
                        <span className="text-xs text-[var(--text04)]">({coach.reviews})</span>
                    </div>
                  </div>
                  <div>
                      <p className="text-xs text-[var(--text04)] mb-1">수강생</p>
                    <div className="flex items-center gap-1">
                        <Users className="w-5 h-5 text-[var(--textPrimary)]" />
                        <span className="text-xl font-bold text-[var(--text01)]">{coach.students}</span>
                    </div>
                  </div>
                  <div>
                      <p className="text-xs text-[var(--text04)] mb-1">가격</p>
                      <p className="text-xl font-bold text-[var(--text01)]">
                      {coach.price ? `₩${coach.price.toLocaleString()}` : "미설정"}
                    </p>
                  </div>
                </div>

                {coach.description && (
                    <div className="pt-4 border-t border-[var(--divider01)]">
                      <p className="text-xs text-[var(--text04)] mb-1">소개</p>
                      <p className="text-xs text-[var(--text01)]">{coach.description}</p>
                  </div>
                )}

                {coach.specialties && coach.specialties.length > 0 && (
                    <div className="pt-4 border-t border-[var(--divider01)]">
                      <p className="text-xs text-[var(--text04)] mb-1">전문 분야</p>
                    <div className="flex flex-wrap gap-2">
                      {coach.specialties.map((spec, index) => (
                          <Badge key={index} variant="secondary" className="bg-[var(--layerNotNormal)] text-[var(--text01)]">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 강의 활성화 스위치 */}
                  <div className="pt-4 border-t border-[var(--divider01)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={coach.active !== false}
                        onCheckedChange={handleToggleActive}
                        disabled={updatingActive}
                      />
                      <div>
                          <p className="text-xs font-medium text-[var(--text01)]">코치 목록 노출</p>
                          <p className="text-xs text-[var(--text04)]">
                          {coach.active !== false ? "강의가 활성화 되었습니다." : "강의를 활성화 시켜주세요."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 빠른 액션 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="bg-[var(--layer02)] ">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-[var(--text01)]">
                  <BookOpen className="w-5 h-5" />
                  강의 설정
                </CardTitle>
              </CardHeader>
                <CardContent className="p-3">
                  <p className="text-xs text-[var(--text04)] mb-3">
                  강의 소개, 커리큘럼, 상세 페이지 설정을 관리할 수 있습니다.
                </p>
                <Button asChild className="w-full">
                  <Link href="/my/course">
                    강의 설정 바로가기
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {coach.verified && (
                <Card className="bg-[var(--layer02)] ">
                <CardHeader>
                    <CardTitle className="text-lg text-[var(--text01)]">상세 페이지</CardTitle>
                </CardHeader>
                  <CardContent className="p-3">
                    <p className="text-xs text-[var(--text04)] mb-3">
                    내 강의 상세 페이지를 확인할 수 있습니다.
                  </p>
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/coaches/${coach.id}`}>
                      상세 페이지 보기
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          </TabsContent>

          {/* 일반 탭 */}
          <TabsContent value="general" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Card className="bg-[var(--layer02)] ">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-[var(--text01)]">
                    <UserCheck className="w-5 h-5" />
                    내 수강 신청
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <p className="text-xs text-[var(--text04)] mb-3">
                    수강 신청 내역을 확인하고 관리할 수 있습니다.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/my/enrollments">
                      수강 신청 보기
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[var(--layer02)] ">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-[var(--text01)]">
                    <BookOpen className="w-5 h-5" />
                    코치 찾기
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <p className="text-xs text-[var(--text04)] mb-3">
                    전문 코치를 찾아 수강 신청을 해보세요.
                  </p>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/coaches">
                      코치 목록 보기
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {!coach && (
        <>
          {/* 상태 카드 (크몽 스타일) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="bg-[var(--layer02)] ">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--primaryOpacity01)] flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-[var(--primary01)]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[var(--text04)] mb-1">진행 중</p>
                  <p className="text-lg font-bold text-[var(--text01)]">0</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[var(--layer02)] ">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--primaryOpacity01)] flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-[var(--systemSuccess01)]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[var(--text04)] mb-1">완료</p>
                  <p className="text-lg font-bold text-[var(--text01)]">0</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[var(--layer02)] ">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--primaryOpacity01)] flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-[var(--systemDanger01)]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[var(--text04)] mb-1">취소·환불</p>
                  <p className="text-lg font-bold text-[var(--text01)]">0</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 요약 카운트 및 안내 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4 text-xs text-[var(--text04)]">
              <span>구매 확정: <strong className="text-[var(--text01)] font-semibold">0</strong></span>
              <span>작성 가능한 리뷰: <strong className="text-[var(--text01)] font-semibold">0</strong></span>
              <span>주문 취소: <strong className="text-[var(--text01)] font-semibold">0</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text04)]">
              <Info className="w-4 h-4" />
              <span>구매 과정 및 주문 상태 안내</span>
            </div>
          </div>

          {/* 필터/검색 바 */}
          <Card className="bg-[var(--layer02)]">
            <CardContent className="p-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="전체 상품" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 상품</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="전체 상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 상태</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 flex-1">
                  <Input 
                    type="date" 
                    className="w-full sm:w-[140px]"
                    placeholder="기간 선택"
                  />
                  <span className="text-[var(--text04)]">~</span>
                  <Input 
                    type="date" 
                    className="w-full sm:w-[140px]"
                    placeholder="기간 선택"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="닉네임" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  type="text" 
                  placeholder="검색어 입력"
                  className="flex-1"
                />
                <Button>
                  <Search className="w-4 h-4 mr-2" />
                  조회
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 일반 사용자 대시보드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Card className="bg-[var(--layer02)] ">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-[var(--text01)]">
                  <UserCheck className="w-5 h-5" />
                  내 수강 신청
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-xs text-[var(--text04)] mb-3">
                  수강 신청 내역을 확인하고 관리할 수 있습니다.
                </p>
                <Button asChild className="w-full">
                  <Link href="/my/enrollments">
                    수강 신청 보기
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[var(--layer02)] ">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-[var(--text01)]">
                  <BookOpen className="w-5 h-5" />
                  코치 찾기
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-xs text-[var(--text04)] mb-3">
                  전문 코치를 찾아 수강 신청을 해보세요.
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/coaches">
                    코치 목록 보기
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

