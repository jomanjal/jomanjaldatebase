"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { FooterSection } from "@/components/footer-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Users, Clock, MapPin, Trophy, Check, Gift } from "lucide-react"
import Link from "next/link"

// 강사 데이터 (나중에 API로 대체)
const coaches = [
  {
    id: 1,
    name: "Jomanjal",
    game: "발로란트",
    tier: "레디언트",
    experience: "3년",
    rating: 5.0,
    students: 200,
    price: "30,000원/시간",
    specialties: ["전략", "에이밍"],
    description: "발로란트 베타부터 플레이한 베테랑 코치입니다.",
    image: "/api/placeholder/150/150",
    location: "온라인",
    totalLessons: 350,
    successRate: 92,
    bio: "발로란트 베타 테스트부터 함께한 베테랑 코치입니다. 다양한 티어의 학생들을 성공적으로 지도하며, 전략적 사고와 실전 에이밍에 특화된 코칭을 제공합니다."
  }
]

export default function CoachDetailPage({ params }: { params: { id: string } }) {
  const coachId = parseInt(params.id)
  const coach = coaches.find(c => c.id === coachId)
  const [sortBy, setSortBy] = useState("latest")

  if (!coach) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <section className="py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">코치를 찾을 수 없습니다</h1>
          <Link href="/coaches">
            <Button>코치 목록으로 돌아가기</Button>
          </Link>
        </section>
        <FooterSection />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* 메인 콘텐츠 */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">에임, 피지컬 강의 국내 No.1</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 좌측: 탭 콘텐츠 */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="intro" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="intro">강의 소개</TabsTrigger>
                  <TabsTrigger value="curriculum">커리큘럼</TabsTrigger>
                  <TabsTrigger value="reviews">후기 8</TabsTrigger>
                </TabsList>

                {/* 강의 소개 탭 */}
                <TabsContent value="intro" className="space-y-6">
                  {/* 소개이미지 - Introduction.png */}
                  <img 
                    src="/Introduction.png" 
                    alt="강의 소개 이미지" 
                    className="w-full rounded-lg" 
                  />

                  {/* 강의 소개 */}
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-4">강의 소개</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        저의 에임강의는 다른 강사님들과는 많이 다른 독자적인 커리큘럼입니다! 
                        수준 높은 강의이며 초보자부터 프로 레벨까지 누구에게나 도움 될 수 있는 구성입니다.
                      </p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Aim Lab을 활용한 루틴과 과제</li>
                        <li>• 10가지 시나리오</li>
                        <li>• 약 2500자의 설명</li>
                        <li>• 목표 점수 제공</li>
                        <li>• 무제한 소장 가능한 글로 된 자료</li>
                        <li>• 마이크 및 디스코드 불필요</li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* 강의 대상 */}
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-4">강의 대상은 누가 될까요?</h2>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">나는 분명 뇌지컬은 좋은거 같은데 에임이 안좋다.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">왜 게임을 못 이기는지 모르겠다.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">내 에임 수준을 알고싶다.</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* 강의 효과 */}
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-4">강의 효과는 얼마나 될까요?</h2>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">
                            제 수업을 들었던 200명이 넘는 수강생분들이 에임상승과 랭크상승을 경험하셨습니다, 고민 하지 마세요!
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* 게임 정보 */}
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-4">강의 상세 게임 정보</h2>
                      <p className="text-sm text-muted-foreground mb-4">감시자, 전략가, 척후대, 타격대</p>
                      <div className="grid grid-cols-6 gap-3">
                        {/* 발로란트 캐릭터 아이콘들 */}
                        {['R', 'RZ', 'V', 'G', 'N', 'D'].map((char, idx) => (
                          <div key={idx} className="aspect-square bg-primary/10 rounded-lg flex items-center justify-center text-xs font-bold">
                            {char}
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" className="mt-4">더보기 (+18)</Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 커리큘럼 탭 */}
                <TabsContent value="curriculum">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-6">커리큘럼 총 1시간</h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <span className="font-medium">
                            1. [소장] 마이크를 사용하지 않고도 배울 수 있는 과제 형식의 독보적 커리큘럼
                          </span>
                          <span className="text-muted-foreground text-sm">1시간</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 후기 탭 */}
                <TabsContent value="reviews">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">후기 8</h2>
                        <div className="flex gap-2">
                          <Button
                            variant={sortBy === "latest" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSortBy("latest")}
                          >
                            최신순
                          </Button>
                          <Button
                            variant={sortBy === "high" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSortBy("high")}
                          >
                            평점 높은 순
                          </Button>
                          <Button
                            variant={sortBy === "low" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSortBy("low")}
                          >
                            평점 낮은 순
                          </Button>
                        </div>
                      </div>

                      {/* 후기 목록 */}
                      <div className="space-y-6">
                        {/* 후기 아이템 */}
                        {[
                          { name: "심지훈1**", date: "2025-10-17", rating: 5, content: "매우 친절하시고 강의 내용이 알찹니다. 저티어분들 매우 추천 드립니다!" },
                          { name: "잠수_바**", date: "2025-10-16", rating: 5, content: "에임 성장을 위한 강의!" },
                          { name: "Boom**", date: "2025-10-10", rating: 5, content: "너무 친절하고 좋습니다 강추!" },
                          { name: "skej**", date: "2025-10-09", rating: 5, content: "친절하시고 빠르게 진행되어서 좋습니다" },
                        ].map((review, idx) => (
                          <div key={idx} className="border-b pb-6 last:border-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex gap-1">
                                {[...Array(review.rating)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                              <span className="font-semibold">{review.name}</span>
                              <span className="text-sm text-muted-foreground">{review.date}</span>
                            </div>
                            <p className="text-muted-foreground">{review.content}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* 우측: 사이드바 (sticky) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* asd.jpg 이미지 */}
                <img 
                  src="/asd.jpg" 
                  alt="사이드바 이미지" 
                  className="w-full rounded-lg max-h-64 object-cover" 
                />

                {/* 할인 배너 */}
                <div className="bg-blue-500 text-white p-4 rounded-lg flex items-center gap-2">
                  <Gift className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">최대 10만원 할인! 신규 가입 쿠폰팩 즉시 받기</span>
                </div>

                {/* 강의 구매 카드 */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-muted-foreground">9명이 구매한 강의</span>
                    </div>
                    
                    <div className="flex gap-2 mb-4">
                      <Badge variant="outline">온라인</Badge>
                      <Badge variant="destructive">할인</Badge>
                    </div>

                    <h3 className="text-lg font-bold mb-2">
                      [소장] 수강생 200+ 이 경험한 에임 실력 상승 🔥
                    </h3>

                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-4 h-4 fill-purple-500 text-purple-500" />
                      <span className="font-semibold">5.0</span>
                      <span className="text-sm text-muted-foreground">(8)</span>
                      <span className="text-sm text-muted-foreground ml-2">9</span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground line-through">60,000</span>
                        <Badge variant="destructive" className="text-xs">50%</Badge>
                      </div>
                      <div className="text-3xl font-bold text-green-600">30,000</div>
                    </div>

                    <Button 
                      className="w-full mb-4 bg-gray-800 text-white hover:bg-gray-700"
                      onClick={() => window.open('https://open.kakao.com/o/s6kCFbZh', '_blank')}
                    >
                      강의 구매
                    </Button>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>• 총 1개의 커리큘럼 (1시간)</div>
                    </div>
                  </CardContent>
                </Card>

                {/* 코치 정보 */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="font-bold text-primary">{coach.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h4 className="font-bold">{coach.name}</h4>
                        <p className="text-sm text-muted-foreground">발로란트</p>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full mb-4"
                      onClick={() => window.open('https://open.kakao.com/o/s6kCFbZh', '_blank')}
                    >
                      상담하기
                    </Button>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-purple-500 text-purple-500" />
                        <span>5.0 (8)</span>
                      </div>
                      <div>👑 2개의 경력</div>
                      <div>🏳 0개의 강의</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  )
}
