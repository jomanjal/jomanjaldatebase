"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageSquare, ListChecks, TrendingUp, UsersRound, Star, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { checkAuth } from "@/lib/auth"

interface DashboardStats {
  totalCoaches: number
  totalReviews: number
  totalWaitlist: number
  averageRating: string
  recentActivities: Array<{
    type: string
    name: string
    game: string
    timeAgo: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    async function getUser() {
      const user = await checkAuth()
      setCurrentUser(user)
    }
    getUser()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/stats', {
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setStats(result.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const statCards = stats ? [
    { 
      title: "총 코치 수", 
      value: stats.totalCoaches.toString(), 
      icon: Users, 
      iconBg: "bg-[var(--primaryOpacity01)]",
      iconColor: "text-[var(--primary01)]"
    },
    { 
      title: "총 리뷰 수", 
      value: stats.totalReviews.toString(), 
      icon: MessageSquare, 
      iconBg: "bg-[var(--primaryOpacity01)]",
      iconColor: "text-[var(--systemSuccess01)]"
    },
    { 
      title: "웨이팅 리스트", 
      value: stats.totalWaitlist.toString(), 
      icon: ListChecks, 
      iconBg: "bg-[var(--primaryOpacity01)]",
      iconColor: "text-[var(--systemWarning01)]"
    },
    { 
      title: "평균 평점", 
      value: stats.averageRating, 
      icon: Star, 
      iconBg: "bg-[var(--primaryOpacity01)]",
      iconColor: "text-[var(--textYellow)]"
    },
  ] : []

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 환영 메시지 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold mb-1 text-[var(--text01)]">
            {currentUser?.username || "관리자"}님, 안녕하세요.
          </h1>
          <p className="text-[var(--text04)] text-xs">
            GameCoach.AI 통합 관리 패널
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchStats}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="relative overflow-hidden bg-[var(--layer02)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-[var(--text04)]">
                  <div className="h-4 w-20 bg-[var(--layer01)] animate-pulse rounded"></div>
                </CardTitle>
                <div className="p-2 rounded-lg bg-[var(--layer01)] animate-pulse w-9 h-9"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-[var(--layer01)] animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden bg-[var(--layer02)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-[var(--text04)]">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-[var(--text01)]">{stat.value}</div>
              <p className="text-xs text-[var(--text04)] mt-1">
                지난주 대비 +12%
              </p>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {/* 최근 활동 & 빠른 액세스 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="bg-[var(--layer02)]">
          <CardHeader>
            <CardTitle className="text-lg text-[var(--text01)]">최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b border-[var(--divider01)] last:border-0">
                    <div className="p-2 bg-[var(--layer01)] animate-pulse rounded-lg w-8 h-8"></div>
                    <div className="flex-1">
                      <div className="h-4 w-20 bg-[var(--layer01)] animate-pulse rounded mb-2"></div>
                      <div className="h-3 w-32 bg-[var(--layer01)] animate-pulse rounded mb-1"></div>
                      <div className="h-3 w-16 bg-[var(--layer01)] animate-pulse rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : stats && stats.recentActivities.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b border-[var(--divider01)] last:border-0">
                  <div className="p-2 bg-[var(--primaryOpacity01)] rounded-lg">
                    <UsersRound className="w-4 h-4 text-[var(--textPrimary)]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-xs text-[var(--text01)]">{activity.name}</p>
                    <p className="text-xs text-[var(--text04)]">
                      {activity.type} · {activity.game}
                    </p>
                    <p className="text-xs text-[var(--text04)] mt-1">
                      {activity.timeAgo}
                    </p>
                  </div>
                </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[var(--text04)]">최근 활동이 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[var(--layer02)]">
          <CardHeader>
            <CardTitle className="text-lg text-[var(--text01)]">빠른 액세스</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/admin/coaches">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  코치 추가/수정
                </Button>
              </Link>
              <Link href="/admin/reviews">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  리뷰 관리
                </Button>
              </Link>
              <Link href="/admin/waitlist">
                <Button variant="outline" className="w-full justify-start">
                  <ListChecks className="w-4 h-4 mr-2" />
                  웨이팅 리스트 확인
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full justify-start">
                  사이트로 이동
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 성능 지표 */}
      <Card className="bg-[var(--layer02)]">
        <CardHeader>
          <CardTitle className="text-lg text-[var(--text01)]">주간 성능 지표</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="text-center p-3 bg-[var(--layer01)] rounded-lg">
              <div className="text-xl font-bold text-[var(--textPrimary)]">68%</div>
              <div className="text-xs text-[var(--text04)] mt-1">전환율</div>
            </div>
            <div className="text-center p-3 bg-[var(--layer01)] rounded-lg">
              <div className="text-xl font-bold text-[var(--systemSuccess01)]">92%</div>
              <div className="text-xs text-[var(--text04)] mt-1">만족도</div>
            </div>
            <div className="text-center p-3 bg-[var(--layer01)] rounded-lg">
              <div className="text-xl font-bold text-[var(--primary01)]">24시간</div>
              <div className="text-xs text-[var(--text04)] mt-1">평균 응답 시간</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

