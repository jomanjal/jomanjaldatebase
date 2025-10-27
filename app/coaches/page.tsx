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
    name: "Jomanjal",
    game: "발로란트",
    tier: "레디언트",
    experience: "3년",
    rating: 5.0,
    students: 200,
    price: "30,000원/시간",
    specialties: ["전략", "에이밍"],
    description: "발로란트 베타부터 플레이한 베테랑 코치입니다.",
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

