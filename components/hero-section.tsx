"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ChatbotModal } from "@/components/chatbot-modal"

const slides = [
  {
    id: 1,
    title: "프로게이머로 성장하고 싶다면?",
    subtitle: "프로게이머로 성장하고 싶다면?",
    image: "/professional-korean-esports-player-clean.png",
    cta: "지금 시작하기",
  },
  {
    id: 2,
    title: "AI가 찾아주는 맞춤 코치",
    subtitle: "당신의 실력에 맞는 최고의 강사를 만나보세요",
    image: "/ai-coaching-interface-with-game-analytics-and-perf.jpg",
    cta: "코치 찾기",
  },
  {
    id: 3,
    title: "실력 향상의 새로운 기준",
    subtitle: "체계적인 코칭으로 빠른 성장을 경험하세요",
    image: "/gaming-skill-improvement-charts-and-training-inter.jpg",
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
      <section className="relative h-[600px] overflow-hidden bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900">
        {/* Carousel Container */}
        <div className="relative w-full h-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={slide.image || "/placeholder.svg"}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-black/40" />
              </div>

              {/* Content */}
              <div className="relative z-10 flex items-center justify-center h-full px-4">
                <div className="text-center text-white max-w-4xl">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance">{slide.title}</h1>
                  <p className="text-xl md:text-2xl mb-8 text-balance opacity-90">{slide.subtitle}</p>
                  <Button
                    size="lg"
                    className="bg-white text-slate-900 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-lg"
                    onClick={() => setIsChatbotOpen(true)}
                  >
                    {slide.cta}
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <ChatbotModal isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </>
  )
}
