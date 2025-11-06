import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Target, Coffee } from "lucide-react"

const useCases = [
  {
    icon: TrendingUp,
    title: "플래티넘에서 다이아로",
    subtitle: "20대 대학생 A씨",
    description: "AI 매칭을 통해 공격적 플레이 스타일에 맞는 강사를 만나 4주 만에 다이아몬드 승급에 성공했습니다.",
    result: "4주 만에 승급",
    badge: "실력 향상",
  },
  {
    icon: Target,
    title: "프로를 준비하는",
    subtitle: "20대 아마추어 B씨",
    description: "체계적인 훈련 프로그램과 전담 코치 매칭으로 프로팀 트라이아웃 합격의 꿈을 이뤘습니다.",
    result: "프로팀 합격",
    badge: "프로 도전",
  },
  {
    icon: Coffee,
    title: "게임을 즐기고 싶은",
    subtitle: "30대 직장인 C씨",
    description: "주말 레슨으로 부담 없이 실력을 늘리며 게임을 통한 스트레스 해소에 성공했습니다.",
    result: "스트레스 해소",
    badge: "캐주얼 코칭",
  },
]

export function UseCaseSection() {
  return (
    <section className="py-8 px-4 bg-[var(--layer01)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-6">
          <h2 className="mb-2 text-balance text-[var(--text01)]">
            <span className="text-[var(--textPrimary)]">성공 스토리</span>
          </h2>
          <p className="text-[var(--text04)] text-sm max-w-2xl mx-auto text-balance">
            GameCoach.AI와 함께한 유저들의 실제 경험담
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {useCases.map((useCase, index) => (
            <Card key={index} className="bg-[var(--layer02)] hover:bg-[var(--layer02Hover)] ">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-10 h-10 bg-[var(--layer01)] rounded-md flex items-center justify-center">
                    <useCase.icon className="w-5 h-5 text-[var(--textPrimary)]" />
                  </div>
                  <div>
                    <Badge variant="secondary" className="text-xs mb-1 bg-[var(--layerNotNormal)] text-[var(--text01)]">
                      {useCase.badge}
                    </Badge>
                    <h3 className="font-semibold text-base text-[var(--text01)]">{useCase.title}</h3>
                    <p className="text-sm text-[var(--text04)]">{useCase.subtitle}</p>
                  </div>
                </div>

                <p className="text-[var(--text04)] text-sm leading-relaxed mb-2.5">{useCase.description}</p>

                <div className="bg-[var(--primaryOpacity01)] rounded-md p-2 text-center">
                  <span className="text-[var(--textPrimary)] font-semibold text-sm">{useCase.result}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
