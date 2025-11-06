"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChatbotModal } from "@/components/chatbot-modal"

export function CTAHighlightSection() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-[var(--layer01)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 2xl:px-32 text-center">
        <h2 className="mb-2 text-balance text-[var(--text01)]">
          AI 코칭, 지금 바로 <span className="text-[var(--textPrimary)]">경험해보세요</span>
        </h2>

        <p className="text-sm text-[var(--text04)] mb-6 max-w-2xl mx-auto text-balance">
          당신의 게임 실력 향상 여정이 여기서 시작됩니다
        </p>

        <Button
          size="lg"
          className="bg-[var(--primary01)] hover:bg-[var(--primary02)] text-white px-8 py-3 text-base font-semibold rounded-md"
          onClick={() => setIsChatbotOpen(true)}
        >
          AI 매칭 시작하기
        </Button>

        <p className="text-sm text-[var(--text04)] mt-4">출시 알림을 가장 먼저 받아보세요</p>
      </div>

      <ChatbotModal isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </section>
  )
}
