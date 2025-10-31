import { Card, CardContent } from "@/components/ui/card"
import { Target, BookOpen, TrendingUp, DollarSign } from "lucide-react"

const benefits = [
  {
    icon: Target,
    title: "최적 매칭",
    description: "AI가 성향·목표 기반 강사 추천",
  },
  {
    icon: BookOpen,
    title: "맞춤 학습",
    description: "나만의 커리큘럼",
  },
  {
    icon: TrendingUp,
    title: "데이터 성장",
    description: "티어 상승 지표 추적",
  },
  {
    icon: DollarSign,
    title: "합리적 비용",
    description: "시간·예산 맞춤 코칭",
  },
]

export function KeyBenefitsSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">GameCoach.AI만의 특별함</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI 기술과 전문 코치의 만남으로 더 효과적인 게임 실력 향상을 경험하세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
