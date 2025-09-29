"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChatbotModal } from "@/components/chatbot-modal"

export function CTAHighlightSection() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  return (
    <section className="py-20 px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-balance">
          AI 코칭, 지금 바로 <span className="text-primary">경험해보세요</span>
        </h2>

        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
          당신의 게임 실력 향상 여정이 여기서 시작됩니다
        </p>

        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-6 text-xl font-semibold rounded-xl glow-animation"
          onClick={() => setIsChatbotOpen(true)}
        >
          웨이팅 리스트 등록하기
        </Button>

        <p className="text-sm text-muted-foreground mt-4">출시 알림을 가장 먼저 받아보세요</p>
      </div>

      <ChatbotModal isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </section>
  )
}
