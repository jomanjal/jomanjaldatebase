import { Search, FilterX, Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmptyStateProps {
  type: "search" | "filter" | "default"
  searchQuery?: string
  onResetFilters?: () => void
}

export function EmptyState({ type, searchQuery, onResetFilters }: EmptyStateProps) {
  if (type === "search") {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-20 h-20 rounded-full bg-[var(--layer02)] flex items-center justify-center mb-4">
          <Search className="w-10 h-10 text-[var(--text04)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--text01)] mb-2">
          검색 결과가 없습니다
        </h3>
        <p className="text-sm text-[var(--text04)] text-center mb-6 max-w-md">
          "{searchQuery}"에 대한 검색 결과를 찾을 수 없습니다.<br />
          다른 검색어를 시도해보세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onResetFilters}
            className="border-[var(--divider01)] hover:bg-[var(--layer02Hover)]"
          >
            검색 초기화
          </Button>
          <Link href="/coaches">
            <Button className="bg-[var(--primary01)] hover:bg-[var(--primary02)] text-white">
              전체 코치 보기
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (type === "filter") {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-20 h-20 rounded-full bg-[var(--layer02)] flex items-center justify-center mb-4">
          <FilterX className="w-10 h-10 text-[var(--text04)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--text01)] mb-2">
          필터 조건에 맞는 코치가 없습니다
        </h3>
        <p className="text-sm text-[var(--text04)] text-center mb-6 max-w-md">
          선택한 필터 조건에 맞는 코치를 찾을 수 없습니다.<br />
          필터를 조정하거나 초기화해보세요.
        </p>
        {onResetFilters && (
          <Button
            onClick={onResetFilters}
            className="bg-[var(--primary01)] hover:bg-[var(--primary02)] text-white"
          >
            필터 초기화
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 rounded-full bg-[var(--layer02)] flex items-center justify-center mb-4">
        <Inbox className="w-10 h-10 text-[var(--text04)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text01)] mb-2">
        등록된 코치가 없습니다
      </h3>
      <p className="text-sm text-[var(--text04)] text-center mb-6 max-w-md">
        아직 등록된 코치가 없습니다.<br />
        곧 멋진 코치들을 만나보실 수 있습니다.
      </p>
    </div>
  )
}



