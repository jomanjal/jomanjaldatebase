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
    <section className="py-20 px-4 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            <span className="text-primary">성공 스토리</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
            GameCoach.AI와 함께한 유저들의 실제 경험담
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <Card key={index} className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <useCase.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <Badge variant="secondary" className="text-xs mb-1">
                      {useCase.badge}
                    </Badge>
                    <h3 className="font-semibold text-lg">{useCase.title}</h3>
                    <p className="text-sm text-muted-foreground">{useCase.subtitle}</p>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{useCase.description}</p>

                <div className="bg-primary/10 rounded-lg p-3 text-center">
                  <span className="text-primary font-semibold">{useCase.result}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
