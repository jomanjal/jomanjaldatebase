"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatbotModal } from "@/components/chatbot-modal"
import { Search, Sparkles, Moon, Sun } from "lucide-react"
import { checkAuth, getCurrentUser, logout, type User } from "@/lib/auth"
import { useTheme } from "next-themes"

// useSearchParams를 사용하는 카테고리 네비게이션 컴포넌트
function CategoryNavigation() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const gameCategories = [
    { id: 'all', name: '전체' },
    { id: 1, name: '리그 오브 레전드' },
    { id: 2, name: '발로란트' },
    { id: 3, name: '오버워치 2' },
    { id: 4, name: '배틀그라운드' },
  ]

  return (
    <div className="border-t border-[var(--divider01)] bg-[var(--layer01)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-3 overflow-x-auto scrollbar-hide h-12 scroll-smooth snap-x snap-mandatory" aria-label="게임 카테고리 네비게이션">
          {gameCategories.map((category) => {
            const isActive = pathname === '/coaches' && 
              ((category.id === 'all' && !searchParams.get('game')) ||
               (category.id !== 'all' && searchParams.get('game') === String(category.id)))
            return (
              <Link
                key={category.id}
                href={category.id === 'all' ? '/coaches' : `/coaches?game=${category.id}`}
                className={`text-sm whitespace-nowrap transition-colors shrink-0 snap-start relative pb-1 ${
                  isActive 
                    ? 'text-[var(--textPrimary)] font-semibold' 
                    : 'text-[var(--text01)] hover:text-[var(--textPrimary)]'
                }`}
                aria-label={`${category.name} 카테고리 보기`}
              >
                {category.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--textPrimary)] rounded-full" />
                )}
              </Link>
            )
          })}
          <Link
            href="/reviews"
            className={`text-sm whitespace-nowrap transition-colors shrink-0 ml-auto pb-1 relative ${
              pathname === '/reviews'
                ? 'text-[var(--textPrimary)] font-semibold'
                : 'text-[var(--text01)] hover:text-[var(--textPrimary)]'
            }`}
            aria-label="수업후기 페이지로 이동"
          >
            수업후기
            {pathname === '/reviews' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--textPrimary)] rounded-full" />
            )}
          </Link>
        </nav>
      </div>
    </div>
  )
}

export function Header() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function loadUser() {
      // 서버에서 토큰 검증하여 사용자 정보 가져오기
      const user = await checkAuth()
      if (user) {
        setAuthenticated(true)
        setCurrentUser(user)
      } else {
        setAuthenticated(false)
        setCurrentUser(null)
      }
    }
    loadUser()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    setAuthenticated(false)
    setCurrentUser(null)
    router.push("/")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/coaches?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push("/coaches")
    }
  }

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 bg-[var(--layer01)] border-b border-[var(--divider01)] ${
          scrolled ? 'shadow-[var(--shadow-sm)]' : ''
        }`}
      >
        {/* Top Header Section */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center space-x-2 shrink-0 hover:opacity-80 transition-opacity cursor-pointer" 
              aria-label="GameCoach.AI 홈으로 이동"
            >
              <div className="relative w-9 h-9 bg-[var(--primary01)] rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-base" aria-hidden="true">G</span>
              </div>
              <span className="text-xl font-bold text-[var(--text01)] tracking-tight hidden sm:inline">GameCoach.AI</span>
            </Link>

            {/* Mobile Search Button */}
            <Button
              type="button"
              onClick={() => setIsMobileSearchOpen(true)}
              className="md:hidden shrink-0 h-9 w-9 p-0 bg-[var(--layer02)] hover:bg-[var(--layer02Hover)] border border-[var(--divider01)]"
              aria-label="검색 열기"
            >
              <Search className="w-4 h-4 text-[var(--text01)]" />
            </Button>

            {/* Search Bar with AI Button - Desktop */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4 hidden md:flex" role="search" aria-label="코치 검색">
              <div className="relative w-full flex items-center bg-[var(--layer02)] border border-[var(--divider01)] rounded-md overflow-hidden focus-within:border-[var(--primary01)] focus-within:ring-2 focus-within:ring-[var(--primary01)]/20">
                <Search className="absolute left-3 text-[var(--text04)] w-5 h-5 pointer-events-none" aria-hidden="true" />
                <Input
                  type="text"
                  placeholder="코치 이름, 게임, 티어로 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
                  aria-label="코치 이름 검색"
                />
                <div className="h-6 w-px bg-[var(--divider01)] mx-2" aria-hidden="true" />
                <Button
                  type="button"
                  onClick={() => setIsChatbotOpen(true)}
                  className="h-10 px-4 bg-[var(--primary01)] hover:bg-[var(--primary02)] text-white font-semibold rounded-r-md border-0 shrink-0"
                  aria-label="AI 추천 받기"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" aria-hidden="true" />
                  AI 추천
                </Button>
              </div>
            </form>

            {/* Actions - Right Side */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Theme Toggle */}
              {mounted && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="h-9 w-9 p-0 hover:bg-[var(--primaryOpacity01)]"
                  aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-[var(--text01)]" />
                  ) : (
                    <Moon className="w-4 h-4 text-[var(--text01)]" />
                  )}
                </Button>
              )}
              {authenticated ? (
                <>
                  {/* 마이페이지 링크 - 관리자 제외 */}
                  {currentUser?.role !== 'admin' && (
                    <Link href="/my">
                      <span className="text-sm text-[var(--text01)] hover:text-[var(--textPrimary)] transition-colors hidden sm:inline">
                        마이페이지
                      </span>
                    </Link>
                  )}
                  {currentUser?.role === 'admin' && (
                    <Link href="/admin">
                      <span className="text-sm text-[var(--text01)] hover:text-[var(--textPrimary)] transition-colors">
                        관리자
                      </span>
                    </Link>
                  )}
                  <span className="text-sm text-[var(--text04)] hidden sm:inline">{currentUser?.username}</span>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="text-sm text-[var(--text01)] hover:text-[var(--textPrimary)] hover:bg-[var(--primaryOpacity01)] px-3"
                    aria-label="로그아웃"
                  >
                    로그아웃
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <span className="text-sm text-[var(--text01)] hover:text-[var(--textPrimary)] transition-colors">
                      로그인
                    </span>
                  </Link>
                  <Link href="/login">
                    <Button
                      size="sm"
                      className="bg-[var(--text01)] hover:bg-[var(--text02)] dark:bg-[var(--text03)] dark:hover:bg-[var(--text04)] text-white px-4 h-8 text-sm"
                      aria-label="회원가입"
                    >
                      회원가입
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <Suspense fallback={
          <div className="border-t border-[var(--divider01)] bg-[var(--layer01)]">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex items-center gap-3 h-12" aria-label="게임 카테고리 네비게이션">
                <div className="h-4 w-16 bg-[var(--layer02)] rounded animate-pulse" />
              </nav>
            </div>
          </div>
        }>
          <CategoryNavigation />
        </Suspense>
      </header>

      {/* Mobile Search Modal */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-[var(--modalBackground)]" onClick={() => setIsMobileSearchOpen(false)} aria-hidden="true" />
          <div className="absolute top-0 left-0 right-0 bg-[var(--layer01)] border-b border-[var(--divider01)] p-4">
            <form onSubmit={(e) => { handleSearch(e); setIsMobileSearchOpen(false); }} className="flex gap-2" role="search">
              <div className="relative flex-1 flex items-center bg-[var(--layer02)] border border-[var(--divider01)] rounded-md overflow-hidden">
                <Search className="absolute left-3 text-[var(--text04)] w-5 h-5 pointer-events-none" aria-hidden="true" />
                <Input
                  type="text"
                  placeholder="코치 이름, 게임, 티어로 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 flex-1 border-0 bg-transparent focus-visible:ring-2 focus-visible:ring-[var(--primary01)]/50 h-10"
                  autoFocus
                  aria-label="코치 이름 검색"
                />
              </div>
              <Button
                type="submit"
                className="bg-[var(--primary01)] hover:bg-[var(--primary02)] text-white shrink-0"
                aria-label="검색 실행"
              >
                검색
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsMobileSearchOpen(false)}
                className="shrink-0"
                aria-label="검색 닫기"
              >
                취소
              </Button>
            </form>
          </div>
        </div>
      )}

      <div className="h-28" /> {/* Spacer for fixed header (16 + 12) */}

      <ChatbotModal isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </>
  )
}
