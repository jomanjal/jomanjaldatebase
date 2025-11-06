"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Star, User, Percent } from "lucide-react"

interface CoachCardProps {
  coach: {
    id: number
    name: string
    description: string | null
    rating: number
    reviews: number
    students: number
    price: number | null
    discount: number | null
    thumbnailImage: string | null
    specialties?: string[]
  }
  calculatedPrice?: number
  calculatedOriginalPrice?: number
  calculatedDiscount?: number
  searchQuery?: string
  highlightSearchTerm?: (text: string, searchTerm: string) => React.ReactNode
}

export function CoachCard({ 
  coach, 
  calculatedPrice, 
  calculatedOriginalPrice, 
  calculatedDiscount,
  searchQuery,
  highlightSearchTerm 
}: CoachCardProps) {
  const price = calculatedPrice
  const originalPrice = calculatedOriginalPrice
  const discount = calculatedDiscount

  const [isLiked, setIsLiked] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <Link href={`/coaches/${coach.id}`} className="block group" aria-label={`${coach.name} 코치 상세보기`}>
      <Card className="overflow-hidden hover:border-[var(--primary01)] cursor-pointer h-full border border-[var(--divider01)] transition-colors">
        {/* 헤더 이미지 영역 */}
        <div className="relative h-32 overflow-hidden rounded-t-md">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-[var(--layer02)] animate-pulse" />
          )}
          <Image
            src={coach.thumbnailImage || "/uploads/coaches/1762077719977_qq.jpg"}
            alt={`${coach.name} 코치 프로필`}
            fill
            className={`object-cover ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, (max-width: 1536px) 20vw, 16vw"
            onLoad={() => setImageLoaded(true)}
          />
          {discount && discount > 0 && (
            <div className="absolute top-3 right-3" aria-label={`${discount}% 할인`}>
              <Badge className="bg-[var(--discount)] text-white text-xs px-2.5 py-1 border-0 rounded-md font-semibold">
                <Percent className="w-3 h-3 mr-1" aria-hidden="true" />
                {discount}% OFF
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="relative p-4 flex flex-col">
          {/* 배지 */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge className="bg-transparent text-[var(--text01)] text-xs px-2.5 py-1 border border-[var(--divider01)] rounded-md font-medium">
              <MapPin className="w-3 h-3 mr-1" aria-hidden="true" />
              온라인
            </Badge>
          </div>

          {/* 제목 */}
          <h3 className="text-base font-semibold text-[var(--text01)] mb-3 leading-tight line-clamp-2 transition-colors">
            {searchQuery && highlightSearchTerm
              ? highlightSearchTerm(coach.description || `${coach.name} 코치`, searchQuery)
              : (coach.description || `${coach.name} 코치`)
            }
          </h3>

          {/* 평점과 인원수 */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5" aria-label={`평점 ${coach.rating > 0 ? coach.rating.toFixed(1) : '0.0'}, 리뷰 ${coach.reviews}개`}>
              <Star className="w-4 h-4 fill-[var(--textYellow)] text-[var(--textYellow)] flex-shrink-0" aria-hidden="true" />
              <span className="text-sm font-semibold whitespace-nowrap text-[var(--text01)]">
                {coach.rating > 0 ? coach.rating.toFixed(1) : '0.0'}
              </span>
              <span className="text-xs text-[var(--text04)]">({coach.reviews})</span>
            </div>
            <div className="flex items-center gap-1.5" aria-label={`수강생 ${coach.students}명`}>
              <User className="w-4 h-4 flex-shrink-0 text-[var(--text04)]" aria-hidden="true" />
              <span className="text-sm whitespace-nowrap text-[var(--text04)] font-medium">{coach.students}</span>
            </div>
          </div>

          {/* 코치 이름 */}
          <p className="text-sm text-[var(--text04)] mb-3 truncate font-medium">
            {searchQuery && highlightSearchTerm
              ? highlightSearchTerm(coach.name, searchQuery)
              : coach.name
            }
          </p>

          {/* 가격 정보 */}
          <div className="mt-auto">
            {price && (
              <div className="mb-2">
                {discount && discount > 0 && originalPrice ? (
                  <div>
                    <div className="text-base font-bold text-[var(--text01)] mb-2">
                      {price.toLocaleString()}원
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--discount)] font-bold bg-[var(--discount)]/10 px-2 py-0.5 rounded">
                        {discount}% 할인
                      </span>
                      <span className="text-xs text-[var(--text04)] line-through" aria-label={`원가 ${originalPrice.toLocaleString()}원`}>
                        {originalPrice.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-base font-bold text-[var(--text01)]">
                    {price.toLocaleString()}원
                  </div>
                )}
              </div>
            )}

            {/* 좋아요 버튼 */}
            <div className="flex justify-end">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsLiked(!isLiked)
                }}
                className="p-1.5 rounded-md hover:bg-[var(--primaryOpacity01)] transition-colors"
                aria-label={isLiked ? "좋아요 취소" : "좋아요"}
              >
                <Heart 
                  className={`w-5 h-5 transition-all duration-200 ${
                    isLiked 
                      ? 'fill-[var(--textPrimary)] text-[var(--textPrimary)]' 
                      : 'text-[var(--text04)] hover:text-[var(--textPrimary)]'
                  } hover:scale-110 transform`}
                />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

