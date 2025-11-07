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
    <section className="py-6 sm:py-8 lg:py-12 bg-[var(--layer01)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 2xl:px-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="bg-transparent hover:border-[var(--primary01)] border border-[var(--divider01)] transition-colors"
            >
              <CardContent className="p-4 sm:p-5 text-center">
                <div className="w-10 h-10 bg-transparent border border-[var(--divider01)] rounded-md flex items-center justify-center mx-auto mb-3">
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
