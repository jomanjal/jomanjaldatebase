import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonCard() {
  return (
    <Card className="overflow-hidden h-full shadow-[var(--shadow-sm)] border-[var(--divider01)]">
      {/* 이미지 영역 */}
      <div className="relative h-36 overflow-hidden rounded-t-md">
        <Skeleton className="w-full h-full" />
      </div>

      <CardContent className="relative p-4 flex flex-col">
        {/* 배지 */}
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>

        {/* 제목 */}
        <Skeleton className="h-5 w-full mb-2 rounded" />
        <Skeleton className="h-4 w-3/4 mb-2 rounded" />

        {/* 평점과 인원수 */}
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>

        {/* 코치 이름 */}
        <Skeleton className="h-4 w-24 mb-2 rounded" />

        {/* 가격 정보 */}
        <div className="mt-auto">
          <Skeleton className="h-6 w-32 mb-2 rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

