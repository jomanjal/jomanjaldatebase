import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, TrendingUp } from "lucide-react"

const reviews = [
  {
    name: "김게이머",
    tier: "골드 → 플래티넘",
    rating: 5,
    comment: "AI 매칭이 정말 정확해요! 제 플레이 스타일에 딱 맞는 강사님을 찾아주셨어요.",
    weeks: 6,
  },
  {
    name: "박프로",
    tier: "다이아 → 마스터",
    rating: 5,
    comment: "체계적인 커리큘럼과 데이터 기반 피드백이 인상적이었습니다.",
    weeks: 8,
  },
  {
    name: "이초보",
    tier: "브론즈 → 실버",
    rating: 4,
    comment: "게임 초보였는데 친절하게 기초부터 알려주셔서 금방 늘었어요!",
    weeks: 4,
  },
]

export function ReviewsSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            실제 <span className="text-primary">성과</span>와 후기
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
            데이터로 증명되는 확실한 실력 향상
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-card border-border text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">평균 2.3티어</div>
              <p className="text-muted-foreground">상승 효과</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">6주</div>
              <p className="text-muted-foreground">평균 목표 달성</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">98%</div>
              <p className="text-muted-foreground">만족도</p>
            </CardContent>
          </Card>
        </div>

        {/* Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <Card key={index} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold">{review.name}</h4>
                    <Badge variant="outline" className="text-xs mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {review.tier}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed mb-3">"{review.comment}"</p>

                <div className="text-xs text-primary">{review.weeks}주 코칭 후기</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
