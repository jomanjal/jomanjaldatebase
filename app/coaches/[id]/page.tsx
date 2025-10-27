"use client"

import { Header } from "@/components/header"
import { FooterSection } from "@/components/footer-section"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Users, Clock, MapPin, Trophy } from "lucide-react"
import Link from "next/link"

// 강사 데이터 (나중에 API로 대체)
const coaches = [
  {
    id: 1,
    name: "Jomanjal",
    game: "발로란트",
    tier: "레디언트",
    experience: "3년",
    rating: 5.0,
    students: 200,
    price: "30,000원/시간",
    specialties: ["전략", "에이밍"],
    description: "발로란트 베타부터 플레이한 베테랑 코치입니다.",
    image: "/api/placeholder/150/150",
    location: "온라인",
    totalLessons: 350,
    successRate: 92,
    bio: "발로란트 베타 테스트부터 함께한 베테랑 코치입니다. 다양한 티어의 학생들을 성공적으로 지도하며, 전략적 사고와 실전 에이밍에 특화된 코칭을 제공합니다."
  }
]

export default function CoachDetailPage({ params }: { params: { id: string } }) {
  const coachId = parseInt(params.id)
  const coach = coaches.find(c => c.id === coachId)

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

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* 강사 프로필 헤더 */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* 프로필 이미지 */}
            <div className="relative">
              <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center border-4 border-primary/30">
                <span className="text-5xl font-bold text-primary">
                  {coach.name.charAt(0)}
                </span>
              </div>
              <div className="absolute -bottom-2 right-0 bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-bold">
                {coach.tier}
              </div>
            </div>

            {/* 프로필 정보 */}
            <div className="flex-1 text-center md:text-left">
              <div className="mb-2">
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  {coach.name}
                </h1>
                <p className="text-xl text-muted-foreground">
                  {coach.game} 전문 코치
                </p>
              </div>

              <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{coach.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  <span>{coach.students}+ 수강생</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span>경력 {coach.experience}</span>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap justify-center md:justify-start">
                {coach.specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 가격 및 액션 */}
            <div className="flex flex-col items-center md:items-end gap-4">
              <div className="text-center md:text-right">
                <div className="text-3xl font-bold text-primary mb-1">
                  {coach.price}
                </div>
                <p className="text-sm text-muted-foreground">1시간 기준</p>
              </div>
              <Button size="lg" className="w-full md:w-auto px-8">
                상담 신청하기
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 왼쪽: 상세 정보 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 소개 */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">코치 소개</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {coach.bio}
                  </p>
                </CardContent>
              </Card>

              {/* 코칭 스타일 */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">코칭 스타일</h2>
                  <p className="text-muted-foreground">
                    {coach.description}
                  </p>
                </CardContent>
              </Card>

              {/* 강의 정보 (추가 예정) */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">강의 정보</h2>
                  <p className="text-muted-foreground text-center py-8">
                    강의 내용은 추후 추가될 예정입니다.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 오른쪽: 통계 및 정보 */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">성과 지표</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-muted-foreground">강의 진행</span>
                        <span className="text-sm font-medium">{coach.totalLessons}회</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-muted-foreground">성공률</span>
                        <span className="text-sm font-medium">{coach.successRate}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-muted-foreground">평점</span>
                        <span className="text-sm font-medium flex items-center gap-1">
                          {coach.rating.toFixed(1)}
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">기본 정보</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{coach.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{coach.experience} 경력</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-muted-foreground" />
                      <span>{coach.tier}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  )
}
