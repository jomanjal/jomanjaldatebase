"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ChatbotModal } from "@/components/chatbot-modal"

const slides = [
  {
    id: 1,
    title: "프로게이머로 성장하고 싶다면?",
    subtitle: "AI 기반 맞춤형 코칭으로 실력을 한 단계 올려보세요",
    cta: "지금 시작하기",
  },
  {
    id: 2,
    title: "AI가 찾아주는 맞춤 코치",
    subtitle: "당신의 실력에 맞는 최고의 강사를 만나보세요",
    cta: "코치 찾기",
  },
  {
    id: 3,
    title: "실력 향상의 새로운 기준",
    subtitle: "체계적인 코칭으로 빠른 성장을 경험하세요",
    cta: "체험해보기",
  },
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <>
      <section className="relative h-[400px] md:h-[450px] overflow-hidden bg-gradient-to-br from-[var(--layer01)] via-[var(--layer02)] to-[var(--layer01)] py-8">
        {/* Carousel Container */}
        <div className="relative w-full h-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
              style={{ transitionDuration: '0.3s' }}
            >
              {/* Background without Image */}
              <div className="absolute inset-0 bg-[var(--primary01)]/8" />
              
              {/* Subtle Pattern */}
              <div className="absolute inset-0 opacity-3" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary01) 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }} />

              {/* Content */}
              <div className="relative z-20 flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-4xl mx-auto">
                  <h1 className="mb-4 text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-[var(--text01)]">
                    {slide.title}
                  </h1>
                  <p className="mb-8 text-sm md:text-base text-[var(--text04)] max-w-2xl mx-auto leading-relaxed">
                    {slide.subtitle}
                  </p>
                  <Button
                    size="lg"
                    className="bg-[var(--primary01)] hover:bg-[var(--primary02)] text-white px-8 py-4 text-base font-semibold rounded-md"
                    onClick={() => setIsChatbotOpen(true)}
                  >
                    {slide.cta}
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows - Updated for light background */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-[var(--layer02)] hover:bg-[var(--layer02Hover)] border border-[var(--divider01)] rounded-full p-2.5 shadow-[var(--shadow-sm)]"
            aria-label="이전 슬라이드"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--text01)]" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-[var(--layer02)] hover:bg-[var(--layer02Hover)] border border-[var(--divider01)] rounded-full p-2.5 shadow-[var(--shadow-sm)]"
            aria-label="다음 슬라이드"
          >
            <ChevronRight className="w-5 h-5 text-[var(--text01)]" />
          </button>

          {/* Dots Indicator - Updated for light background */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`rounded-full transition-all ${
                  index === currentSlide 
                    ? "bg-[var(--primary01)] w-7 h-2 shadow-[0_0_8px_var(--primaryOpacity03)]" 
                    : "bg-[var(--divider01)] w-2 h-2 hover:bg-[var(--primaryOpacity02)]"
                }`}
                style={{ transition: 'var(--transition)' }}
                aria-label={`슬라이드 ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <ChatbotModal isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </>
  )
}
