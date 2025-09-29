"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChatbotModal } from "@/components/chatbot-modal"

const gameCategories = [
  {
    id: 1,
    name: "리그 오브 레전드",
    image: "/league-of-legends-game-interface-with-champions.jpg",
    color: "from-blue-500 to-purple-600",
  },
  {
    id: 2,
    name: "발로란트",
    image: "/valorant-fps-game-with-agents-and-weapons.jpg",
    color: "from-red-500 to-pink-600",
  },
  {
    id: 3,
    name: "오버워치 2",
    image: "/overwatch-2-heroes-and-gameplay.jpg",
    color: "from-orange-500 to-yellow-600",
  },
  {
    id: 4,
    name: "배틀그라운드",
    image: "/pubg-battle-royale-gameplay.jpg",
    color: "from-green-500 to-teal-600",
  },
]

export function GameCoachSection() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  return (
    <>
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">게임별 코치를 찾아볼까요?</h2>
            <p className="text-lg text-muted-foreground">전문 코치들이 당신의 실력 향상을 도와드립니다</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gameCategories.map((game) => (
              <div key={game.id} className="group cursor-pointer" onClick={() => setIsChatbotOpen(true)}>
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-90`} />
                  <img src={game.image || "/placeholder.svg"} alt={game.name} className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      코치 찾기
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ChatbotModal isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </>
  )
}
