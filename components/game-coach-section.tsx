"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const gameCategories = [
  {
    id: 1,
    name: "리그 오브 레전드",
    nameEn: "LEAGUE of LEGENDS",
    image: "/league-of-legends-game-interface-with-champions.jpg",
    bgColor: "bg-gradient-to-br from-blue-900/90 via-gray-800/90 to-orange-900/90",
  },
  {
    id: 2,
    name: "발로란트",
    nameEn: "VALORANT",
    image: "/valorant-fps-game-with-agents-and-weapons.jpg",
    bgColor: "bg-gradient-to-br from-red-600/90 via-red-700/90 to-red-800/90",
  },
  {
    id: 3,
    name: "오버워치 2",
    nameEn: "OVERWATCH",
    image: "/overwatch-2-heroes-and-gameplay.jpg",
    bgColor: "bg-gradient-to-br from-gray-800/90 via-orange-900/90 to-gray-700/90",
  },
  {
    id: 4,
    name: "배틀그라운드",
    nameEn: "BATTLEGROUNDS",
    image: "/pubg-battle-royale-gameplay.jpg",
    bgColor: "bg-gradient-to-br from-green-800/90 via-teal-900/90 to-green-700/90",
  },
]

export function GameCoachSection() {
  const router = useRouter()

  const handleGameClick = (gameName: string) => {
    router.push(`/coaches?specialty=${encodeURIComponent(gameName)}`)
  }

  return (
    <section className="py-8 px-4 bg-[var(--layer01)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-6">
          <h2 className="mb-2 text-balance text-[var(--text01)]">전 프로와 코치 출신에게 직접 배우는 게 가능할까요?</h2>
          <p className="text-sm text-[var(--text04)]">프로는 가르치는 방식부터 다릅니다. 압도적인 티어 상승을 경험하세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {gameCategories.map((game) => (
            <div key={game.id} className="group cursor-pointer" onClick={() => handleGameClick(game.name)}>
              <Card className="relative h-48 md:h-56 overflow-hidden rounded-md ">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <Image
                    src={game.image || "/placeholder.svg"}
                    alt={game.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {/* Overlay Gradient */}
                  <div className={`absolute inset-0 ${game.bgColor} opacity-80 group-hover:opacity-70 transition-opacity`} style={{ transition: 'var(--transition)' }} />
                </div>
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between p-4">
                  <div className="flex-1 flex flex-col justify-center items-center text-center">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                      {game.nameEn}
                    </h3>
                    <p className="text-sm md:text-base text-white/90 font-medium">
                      {game.name}
                    </p>
                  </div>
                  
                  {/* Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 font-semibold"
                    style={{ transition: 'var(--transition)' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleGameClick(game.name)
                    }}
                  >
                    코치 찾기
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
