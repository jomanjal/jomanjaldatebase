"use client"

import { Header } from "@/components/header"
import { FooterSection } from "@/components/footer-section"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Users, Trophy, Clock } from "lucide-react"

// 예시 코치 데이터
const coaches = [
  {
    id: 1,
    name: "김프로",
    game: "리그 오브 레전드",
    tier: "챌린저",
    experience: "5년",
    rating: 4.9,
    students: 120,
    price: "50,000원/시간",
    specialties: ["정글", "미드", "라인전"],
    description: "프로팀 코치 출신으로 정글과 미드 라인 전문가입니다.",
    image: "/api/placeholder/150/150"
  },
  {
    id: 2,
    name: "발로마스터",
    game: "발로란트",
    tier: "레디언트",
    experience: "3년",
    rating: 4.8,
    students: 85,
    price: "45,000원/시간",
    specialties: ["듀얼리스트", "전략", "에이밍"],
    description: "발로란트 베타부터 플레이한 베테랑 코치입니다.",
    image: "/api/placeholder/150/150"
  },
  {
    id: 3,
    name: "오버워치킹",
    game: "오버워치 2",
    tier: "그랜드마스터",
    experience: "4년",
    rating: 4.7,
    students: 95,
    price: "40,000원/시간",
    specialties: ["딜러", "탱커", "팀워크"],
    description: "오버워치 1부터 2까지 모든 메타를 경험한 전문가입니다.",
    image: "/api/placeholder/150/150"
  },
  {
    id: 4,
    name: "배그고수",
    game: "배틀그라운드",
    tier: "다이아몬드",
    experience: "6년",
    rating: 4.6,
    students: 110,
    price: "35,000원/시간",
    specialties: ["사격", "위치선정", "생존"],
    description: "배틀그라운드의 모든 맵과 무기를 완벽히 숙지한 코치입니다.",
    image: "/api/placeholder/150/150"
  },
  {
    id: 5,
    name: "롤천재",
    game: "리그 오브 레전드",
    tier: "그랜드마스터",
    experience: "7년",
    rating: 4.9,
    students: 150,
    price: "55,000원/시간",
    specialties: ["탑", "서포터", "매크로"],
    description: "롤드컵 관전 경험과 다수의 프로 선수 지도 경험이 있습니다.",
    image: "/api/placeholder/150/150"
  },
  {
    id: 6,
    name: "발로여신",
    game: "발로란트",
    tier: "이모탈",
    experience: "2년",
    rating: 4.8,
    students: 70,
    price: "42,000원/시간",
    specialties: ["센티넬", "컨트롤러", "정보수집"],
    description: "여성 코치로서 다양한 관점에서 게임을 분석합니다.",
    image: "/api/placeholder/150/150"
  }
]

export default function CoachesPage() {
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

      {/* 코치 목록 */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coaches.map((coach) => (
              <Card key={coach.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* 코치 프로필 */}
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl font-bold text-primary">
                        {coach.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {coach.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {coach.game} • {coach.tier}
                      </p>
                    </div>
                  </div>

                  {/* 코치 정보 */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      경력 {coach.experience}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      수강생 {coach.students}명
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="w-4 h-4 mr-2 text-yellow-500" />
                      평점 {coach.rating}
                    </div>
                  </div>

                  {/* 전문 분야 */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-foreground mb-2">전문 분야</p>
                    <div className="flex flex-wrap gap-1">
                      {coach.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* 설명 */}
                  <p className="text-sm text-muted-foreground mb-4">
                    {coach.description}
                  </p>

                  {/* 가격 및 버튼 */}
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-primary">
                      {coach.price}
                    </div>
                    <Button className="bg-primary hover:bg-primary/90">
                      상담 신청
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  )
}

