import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

const instructors = [
  {
    name: "김프로",
    image: "/professional-gamer-avatar.png",
    tier: "그랜드마스터",
    style: "공격적 플레이",
    rating: 4.9,
    reviews: 127,
    specialty: "LoL 미드라이너",
  },
  {
    name: "박코치",
    image: "/esports-coach-avatar.jpg",
    tier: "챌린저",
    style: "전략적 분석",
    rating: 4.8,
    reviews: 89,
    specialty: "발로란트 IGL",
  },
  {
    name: "이선생",
    image: "/gaming-instructor-avatar.jpg",
    tier: "다이아몬드",
    style: "친근한 설명",
    rating: 4.7,
    reviews: 156,
    specialty: "오버워치 서포터",
  },
  {
    name: "최마스터",
    image: "/game-master-avatar.jpg",
    tier: "마스터",
    style: "체계적 훈련",
    rating: 4.9,
    reviews: 203,
    specialty: "스타크래프트2",
  },
]

export function InstructorProfileSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            검증된 <span className="text-primary">프로 강사진</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
            각 분야 최고의 실력을 갖춘 강사들이 당신의 성장을 도와드립니다
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {instructors.map((instructor, index) => (
            <Card key={index} className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <img
                    src={instructor.image || "/placeholder.svg"}
                    alt={instructor.name}
                    className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-primary/20"
                  />
                  <h3 className="text-lg font-semibold">{instructor.name}</h3>
                  <p className="text-sm text-muted-foreground">{instructor.specialty}</p>
                </div>

                <div className="space-y-2 mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {instructor.tier}
                  </Badge>
                  <Badge variant="outline" className="text-xs ml-2">
                    {instructor.style}
                  </Badge>
                </div>

                <div className="flex items-center justify-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{instructor.rating}</span>
                  <span className="text-muted-foreground">({instructor.reviews})</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" disabled>
            더 많은 강사 보기 (준비중)
          </Button>
        </div>
      </div>
    </section>
  )
}
