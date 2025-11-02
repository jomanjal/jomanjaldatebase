"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageSquare, ListChecks, TrendingUp, UsersRound, Star, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

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
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    { 
      title: "총 리뷰 수", 
      value: stats.totalReviews.toString(), 
      icon: MessageSquare, 
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    { 
      title: "웨이팅 리스트", 
      value: stats.totalWaitlist.toString(), 
      icon: ListChecks, 
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950"
    },
    { 
      title: "평균 평점", 
      value: stats.averageRating, 
      icon: Star, 
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    },
  ] : []

  return (
    <div className="p-8 space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">관리자 대시보드</h1>
          <p className="text-muted-foreground mt-1">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                </CardTitle>
                <div className="p-2 rounded-lg bg-muted animate-pulse w-9 h-9"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                지난주 대비 +12%
              </p>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {/* 최근 활동 & 빠른 액세스 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <div className="p-2 bg-muted animate-pulse rounded-lg w-8 h-8"></div>
                    <div className="flex-1">
                      <div className="h-4 w-20 bg-muted animate-pulse rounded mb-2"></div>
                      <div className="h-3 w-32 bg-muted animate-pulse rounded mb-1"></div>
                      <div className="h-3 w-16 bg-muted animate-pulse rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : stats && stats.recentActivities.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <UsersRound className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.type} · {activity.game}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.timeAgo}
                    </p>
                  </div>
                </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">최근 활동이 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>빠른 액세스</CardTitle>
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
      <Card>
        <CardHeader>
          <CardTitle>주간 성능 지표</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">68%</div>
              <div className="text-sm text-muted-foreground mt-1">전환율</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">92%</div>
              <div className="text-sm text-muted-foreground mt-1">만족도</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">24시간</div>
              <div className="text-sm text-muted-foreground mt-1">평균 응답 시간</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

