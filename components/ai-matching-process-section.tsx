"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Brain, Trophy } from "lucide-react"
import { ChatbotModal } from "@/components/chatbot-modal"

const steps = [
  {
    icon: MessageCircle,
    title: "Chatbot Onboarding",
    description: "목표·성향 입력",
    detail: "간단한 대화를 통해 당신의 게임 목표와 성향을 파악합니다",
  },
  {
    icon: Brain,
    title: "AI Instructor Matching",
    description: "AI 강사 매칭",
    detail: "수집된 데이터를 바탕으로 최적의 강사를 AI가 추천합니다",
  },
  {
    icon: Trophy,
    title: "Coaching & Tracking",
    description: "코칭 & 성과 추적",
    detail: "맞춤형 코칭을 받으며 실시간으로 성장을 확인할 수 있습니다",
  },
]

export function AIMatchingProcessSection() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  return (
    <section className="py-20 px-4 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">AI 매칭 프로세스</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
            3단계로 완성되는 당신만의 게임 코칭 여정
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-primary font-medium mb-3">{step.description}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.detail}</p>
                </CardContent>
              </Card>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/30" />
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold rounded-xl"
            onClick={() => setIsChatbotOpen(true)}
          >
            AI 매칭 시작하기
          </Button>
        </div>
      </div>

      <ChatbotModal isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </section>
  )
}
