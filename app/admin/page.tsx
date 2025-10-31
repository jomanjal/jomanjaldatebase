"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageSquare, ListChecks, TrendingUp, UsersRound, Star } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
  // 임시 데이터 (나중에 API로 교체)
  const stats = [
    { 
      title: "총 코치 수", 
      value: "15", 
      icon: Users, 
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    { 
      title: "총 리뷰 수", 
      value: "247", 
      icon: MessageSquare, 
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    { 
      title: "웨이팅 리스트", 
      value: "42", 
      icon: ListChecks, 
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950"
    },
    { 
      title: "평균 평점", 
      value: "4.8", 
      icon: Star, 
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    },
  ]

  const recentActivities = [
    {
      type: "코치 등록",
      name: "김프로",
      game: "리그 오브 레전드",
      time: "2시간 전"
    },
    {
      type: "리뷰 작성",
      name: "박게이머",
      game: "발로란트",
      time: "5시간 전"
    },
    {
      type: "웨이팅 리스트",
      name: "이코치",
      game: "오버워치 2",
      time: "1일 전"
    },
  ]

  return (
    <div className="p-8 space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold">관리자 대시보드</h1>
        <p className="text-muted-foreground mt-1">
          GameCoach.AI 통합 관리 패널
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
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
        ))}
      </div>

      {/* 최근 활동 & 빠른 액세스 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
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
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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

