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
    <section className="py-8 px-4 bg-[var(--layer01)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-6">
          <h2 className="mb-2 text-balance text-[var(--text01)]">AI 매칭 프로세스</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="bg-[var(--layer02)] hover:bg-[var(--layer02Hover)] ">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-[var(--layer01)] rounded-md flex items-center justify-center mx-auto mb-2">
                    <step.icon className="w-5 h-5 text-[var(--textPrimary)]" />
                  </div>
                  <h3 className="text-sm font-semibold mb-2 text-[var(--text01)]">{step.title}</h3>
                  <p className="text-[var(--text01)] font-medium mb-2 text-xs">{step.description}</p>
                  <p className="text-[var(--text04)] text-xs leading-relaxed">{step.detail}</p>
                </CardContent>
              </Card>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-1.5 w-3 h-0.5 bg-[var(--primaryOpacity02)]" />
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button
            size="sm"
            className="bg-[var(--primary01)] hover:bg-[var(--primary02)] text-white px-6 py-2 text-sm font-semibold rounded-md"
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
