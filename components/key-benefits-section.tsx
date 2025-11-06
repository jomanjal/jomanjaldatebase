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
    <section className="py-8 px-4 bg-[var(--layer01)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="bg-[var(--layer02)] hover:bg-[var(--layer02Hover)] "
            >
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-[var(--layer01)] rounded-md flex items-center justify-center mx-auto mb-2">
                  <benefit.icon className="w-5 h-5 text-[var(--textPrimary)]" />
                </div>
                <h3 className="text-sm font-semibold mb-1 text-[var(--text01)]">{benefit.title}</h3>
                <p className="text-xs text-[var(--text04)] leading-relaxed">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
