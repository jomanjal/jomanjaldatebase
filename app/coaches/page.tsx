"use client"

import { Header } from "@/components/header"
import { FooterSection } from "@/components/footer-section"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Percent, Star, User } from "lucide-react"
import Link from "next/link"

// 예시 코치 데이터
const coaches = [
  {
    id: 1,
    name: "Jomanjal",
    game: "발로란트",
    tier: "레디언트",
    experience: "3년",
    rating: 5.0,
    reviews: 8,
    students: 200,
    purchases: 9,
    price: 25000,
    originalPrice: 50000,
    discount: 50,
    title: "수강생 200+ 이 경험한",
    description: "에임실력 상승 🔥",
    image: "/asd.jpg"
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
        <div className="max-w-[280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8">
            {coaches.map((coach) => (
              <Link href={`/coaches/${coach.id}`} key={coach.id} className="block">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full bg-card border-0">
                  {/* 헤더 이미지 영역 */}
                  <div className="relative h-32 overflow-hidden">
                    <img 
                      src={coach.image || "/asd.jpg"} 
                      alt={coach.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <CardContent className="p-4 bg-card pt-0">
                    {/* 배지 */}
                    <div className="flex gap-2 mb-2">
                      <Badge className="bg-green-500 hover:bg-green-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        온라인
                      </Badge>
                      <Badge className="bg-red-500 hover:bg-red-500">
                        <Percent className="w-3 h-3 mr-1" />
                        할인
                      </Badge>
                    </div>

                    {/* 제목 */}
                    <h3 className="text-sm font-bold text-foreground mb-2 leading-tight">
                      [소장] {coach.title} {coach.description}
                    </h3>

                    {/* 평점과 인원수 */}
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-purple-500 text-purple-500" />
                        <span className="text-xs font-medium">{coach.rating.toFixed(1)} ({coach.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="text-xs">{coach.purchases}</span>
                      </div>
                    </div>

                    {/* 코치 이름 */}
                    <p className="text-xs text-muted-foreground mb-2">{coach.name}</p>

                    {/* 가격 정보 */}
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="destructive" className="text-xs px-2 py-0">{coach.discount}%</Badge>
                        <span className="text-xs text-muted-foreground line-through">₩{coach.originalPrice.toLocaleString()}</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        ₩{coach.price.toLocaleString()}
                      </div>
                    </div>

                    {/* 좋아요 버튼 */}
                    <div className="absolute bottom-2 right-2">
                      <Heart className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  )
}

