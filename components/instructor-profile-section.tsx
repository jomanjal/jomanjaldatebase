"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Coach {
  id: number
  name: string
  specialty: string
  tier: string
  rating: number
  reviews: number
  thumbnailImage: string | null
  specialties: string[]
}

export function InstructorProfileSection() {
  const [instructors, setInstructors] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInstructors() {
      try {
        const params = new URLSearchParams()
        params.append('verified', 'true')
        params.append('active', 'true')
        params.append('limit', '6') // 최대 6명만 표시

        const response = await fetch(`/api/coaches?${params.toString()}`)
        const result = await response.json()

        if (result.success && result.data) {
          setInstructors(result.data.slice(0, 6)) // 6명만 표시
        }
      } catch (error) {
        console.error('강사 데이터 로드 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInstructors()
  }, [])

  if (loading) {
    return (
      <section className="py-8 px-4 bg-[var(--layer01)]">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-6">
            <h2 className="mb-2 text-balance text-[var(--text01)]">
              검증된 <span className="text-[var(--textPrimary)]">프로 강사진</span>
            </h2>
            <p className="text-[var(--text04)] text-sm max-w-2xl mx-auto text-balance">
              각 분야 최고의 실력을 갖춘 강사들이 당신의 성장을 도와드립니다
            </p>
          </div>
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary01)]" />
          </div>
        </div>
      </section>
    )
  }

  if (instructors.length === 0) {
    return null
  }

  return (
    <section className="py-8 px-4 bg-[var(--layer01)]" style={{ transition: 'var(--transition)' }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-6">
          <h2 className="mb-2 text-balance text-[var(--text01)]">
            검증된 <span className="text-[var(--textPrimary)]">프로 강사진</span>
          </h2>
          <p className="text-[var(--text04)] text-sm max-w-2xl mx-auto text-balance">
            각 분야 최고의 실력을 갖춘 강사들이 당신의 성장을 도와드립니다
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="grid grid-cols-1 gap-3 max-w-md">
            {instructors.map((instructor) => (
              <Link href={`/coaches/${instructor.id}`} key={instructor.id} className="block">
                  <Card className="bg-[var(--layer02)] hover:bg-[var(--layer02Hover)] cursor-pointer ">
                  <CardContent className="p-4">
                    <div className="text-center mb-2.5">
                      <div className="relative w-32 h-32 mx-auto mb-2.5">
                        <Image
                          src={instructor.thumbnailImage || "/uploads/coaches/1762077719977_qq.jpg"}
                          alt={instructor.name}
                          fill
                          className="object-cover rounded-full "
                          sizes="128px"
                        />
                      </div>
                      <h3 className="text-base font-semibold text-[var(--text01)]">{instructor.name}</h3>
                      <p className="text-sm text-[var(--text04)]">{instructor.specialty}</p>
                    </div>

                    <div className="space-y-2 mb-2.5">
                      <Badge variant="secondary" className="text-xs bg-[var(--layerNotNormal)] text-[var(--text01)]">
                        {instructor.tier}
                      </Badge>
                      {instructor.specialties && instructor.specialties.length > 0 && (
                        <Badge variant="outline" className="text-xs ml-2 border-[var(--divider01)] text-[var(--text04)]">
                          {instructor.specialties.slice(0, 2).join(', ')}
                          {instructor.specialties.length > 2 && '...'}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-[var(--textYellow)] text-[var(--textYellow)]" />
                      <span className="font-medium text-[var(--text01)]">{instructor.rating > 0 ? instructor.rating.toFixed(1) : '0.0'}</span>
                      <span className="text-[var(--text04)]">({instructor.reviews})</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/coaches">
            <Button variant="outline" size="lg" className="border-[var(--divider01)] text-[var(--text01)] hover:bg-[var(--layer02Hover)]">
              더 많은 강사 보기
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
