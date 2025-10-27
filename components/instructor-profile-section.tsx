import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

const instructors = [
  {
    name: "발로마스터",
    image: "/esports-coach-avatar.jpg",
    tier: "레디언트",
    style: "듀얼리스트 전략",
    rating: 4.8,
    reviews: 85,
    specialty: "발로란트",
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

        <div className="flex justify-center mb-12">
          <div className="grid grid-cols-1 gap-6 max-w-md">
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
