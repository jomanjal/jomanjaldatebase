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
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              검증된 <span className="text-primary">프로 강사진</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
              각 분야 최고의 실력을 갖춘 강사들이 당신의 성장을 도와드립니다
            </p>
          </div>
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    )
  }

  if (instructors.length === 0) {
    return null
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            검증된 <span className="text-primary">프로 강사진</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
            각 분야 최고의 실력을 갖춘 강사들이 당신의 성장을 도와드립니다
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="grid grid-cols-1 gap-6 max-w-md">
            {instructors.map((instructor) => (
              <Link href={`/coaches/${instructor.id}`} key={instructor.id} className="block">
                <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="relative w-40 h-40 mx-auto mb-3">
                        <Image
                          src={instructor.thumbnailImage || "/uploads/coaches/1762077719977_qq.jpg"}
                          alt={instructor.name}
                          fill
                          className="object-cover rounded-full border-2 border-primary/20"
                          sizes="160px"
                        />
                      </div>
                      <h3 className="text-lg font-semibold">{instructor.name}</h3>
                      <p className="text-sm text-muted-foreground">{instructor.specialty}</p>
                    </div>

                    <div className="space-y-2 mb-4">
                      <Badge variant="secondary" className="text-xs">
                        {instructor.tier}
                      </Badge>
                      {instructor.specialties && instructor.specialties.length > 0 && (
                        <Badge variant="outline" className="text-xs ml-2">
                          {instructor.specialties.slice(0, 2).join(', ')}
                          {instructor.specialties.length > 2 && '...'}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{instructor.rating > 0 ? instructor.rating.toFixed(1) : '0.0'}</span>
                      <span className="text-muted-foreground">({instructor.reviews})</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/coaches">
            <Button variant="outline" size="lg">
              더 많은 강사 보기
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
