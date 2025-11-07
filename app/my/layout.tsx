"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { checkAuth, logout, type User } from "@/lib/auth"
import Link from "next/link"
import { 
  LayoutDashboard, 
  BookOpen,
  LogOut,
  UserCircle,
  Home,
  UserCheck,
  Users,
  User,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authenticated, setAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [coachProfile, setCoachProfile] = useState<{ profileImage: string | null } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function verifyAuth() {
      try {
        // 서버에서 토큰 검증
        const user = await checkAuth()
        
        if (!user) {
          router.push("/login")
          return
        }
        
        // 일반 사용자 또는 코치만 접근 가능
        if (user.role !== 'coach' && user.role !== 'user') {
          router.push("/")
          return
        }
        
        setAuthenticated(true)
        setCurrentUser(user)
        
        // 코치인 경우 프로필 이미지 가져오기
        if (user.role === 'coach') {
          try {
            const coachResponse = await fetch('/api/coaches/my', { credentials: 'include' })
            const coachResult = await coachResponse.json()
            if (coachResult.success && coachResult.data) {
              setCoachProfile({ profileImage: coachResult.data.profileImage || null })
            }
          } catch (error) {
            console.error('코치 프로필 로드 실패:', error)
          }
        }
      } catch (error) {
        console.error('Auth verification error:', error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }
    
    verifyAuth()
  }, [router])
  
  // 프로필 이미지 업데이트 이벤트 리스너
  useEffect(() => {
    const handleProfileImageUpdate = (event: CustomEvent) => {
      if (currentUser?.role === 'coach') {
        setCoachProfile({ profileImage: event.detail.profileImage || null })
      }
    }
    
    window.addEventListener('profileImageUpdated', handleProfileImageUpdate as EventListener)
    
    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileImageUpdate as EventListener)
    }
  }, [currentUser])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary01)] mx-auto"></div>
          <p className="mt-4 text-[var(--text04)]">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarContent>
            {/* 프로필 섹션 - 상단에 배치 */}
            <div className="px-6 py-5 bg-[var(--layer02)]/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  {currentUser?.role === 'coach' && coachProfile?.profileImage ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--primary01)]">
                      <Image
                        src={coachProfile.profileImage}
                        alt={currentUser?.username || "프로필"}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-[var(--primary01)] rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-base">
                        {currentUser?.username.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                  {currentUser?.role && (
                    <div className="absolute -top-1 -right-1">
                      <Badge className="bg-[var(--systemSuccess01)] text-white text-[10px] px-1.5 py-0.5 h-5">
                        {currentUser.role === 'coach' ? '코치' : currentUser.role === 'admin' ? '관리자' : '사용자'}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-[var(--text01)]">
                    {currentUser?.username || "사용자"}
                  </h2>
                  <p className="text-xs text-[var(--text04)] mt-0.5">
                    {currentUser?.role === 'coach' ? '코치 계정' : currentUser?.role === 'admin' ? '관리자 계정' : '일반 계정'}
                  </p>
                </div>
              </div>
              {currentUser?.role === 'user' && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-[var(--divider01)] hover:bg-[var(--layer02Hover)] text-[var(--text01)] text-xs"
                  size="sm"
                >
                  전문가로 전환
                </Button>
              )}
            </div>
            
            {/* 메뉴 그룹 - 더 넓은 패딩 */}
            <SidebarGroup className="px-3 py-4">
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  <SidebarMenuItem className="relative">
                    {pathname === '/my' && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--primary01)] rounded-r-full z-10" />
                    )}
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === '/my'}
                      className="relative group rounded-lg px-3 py-2.5 h-auto hover:bg-[var(--primaryOpacity01)] data-[active=true]:bg-[var(--primaryOpacity01)] data-[active=true]:text-[var(--textPrimary)] data-[active=true]:font-medium"
                    >
                      <Link href="/my" className="flex items-center gap-3 w-full">
                        <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">대시보드</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {currentUser?.role === 'coach' && (
                    <>
                      <SidebarMenuItem className="relative">
                        {pathname === '/my/profile' && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--primary01)] rounded-r-full z-10" />
                        )}
                        <SidebarMenuButton 
                          asChild 
                          isActive={pathname === '/my/profile'}
                          className="relative group rounded-lg px-3 py-2.5 h-auto hover:bg-[var(--primaryOpacity01)] data-[active=true]:bg-[var(--primaryOpacity01)] data-[active=true]:text-[var(--textPrimary)] data-[active=true]:font-medium"
                        >
                          <Link href="/my/profile" className="flex items-center gap-3 w-full">
                            <User className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">프로필</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem className="relative">
                        {pathname === '/my/course' && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--primary01)] rounded-r-full z-10" />
                        )}
                        <SidebarMenuButton 
                          asChild 
                          isActive={pathname === '/my/course'}
                          className="relative group rounded-lg px-3 py-2.5 h-auto hover:bg-[var(--primaryOpacity01)] data-[active=true]:bg-[var(--primaryOpacity01)] data-[active=true]:text-[var(--textPrimary)] data-[active=true]:font-medium"
                        >
                          <Link href="/my/course" className="flex items-center gap-3 w-full">
                            <BookOpen className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">강의 관리</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem className="relative">
                        {pathname === '/my/students' && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--primary01)] rounded-r-full z-10" />
                        )}
                        <SidebarMenuButton 
                          asChild 
                          isActive={pathname === '/my/students'}
                          className="relative group rounded-lg px-3 py-2.5 h-auto hover:bg-[var(--primaryOpacity01)] data-[active=true]:bg-[var(--primaryOpacity01)] data-[active=true]:text-[var(--textPrimary)] data-[active=true]:font-medium"
                        >
                          <Link href="/my/students" className="flex items-center gap-3 w-full">
                            <Users className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">수강생 관리</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem className="relative">
                        {pathname === '/my/schedule' && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--primary01)] rounded-r-full z-10" />
                        )}
                        <SidebarMenuButton 
                          asChild 
                          isActive={pathname === '/my/schedule'}
                          className="relative group rounded-lg px-3 py-2.5 h-auto hover:bg-[var(--primaryOpacity01)] data-[active=true]:bg-[var(--primaryOpacity01)] data-[active=true]:text-[var(--textPrimary)] data-[active=true]:font-medium"
                        >
                          <Link href="/my/schedule" className="flex items-center gap-3 w-full">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">일정</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                  {currentUser?.role === 'user' && (
                    <SidebarMenuItem className="relative">
                      {pathname === '/my/enrollments' && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--primary01)] rounded-r-full z-10" />
                      )}
                      <SidebarMenuButton 
                        asChild 
                        isActive={pathname === '/my/enrollments'}
                        className="relative group rounded-lg px-3 py-2.5 h-auto hover:bg-[var(--primaryOpacity01)] data-[active=true]:bg-[var(--primaryOpacity01)] data-[active=true]:text-[var(--textPrimary)] data-[active=true]:font-medium"
                      >
                        <Link href="/my/enrollments" className="flex items-center gap-3 w-full">
                          <UserCheck className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">내 수강 신청</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* 홈으로 이동 링크 */}
            <SidebarGroup className="px-3 py-2">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      asChild 
                      isActive={false}
                      className="relative group rounded-lg px-3 py-2.5 h-auto hover:bg-[var(--primaryOpacity01)]"
                    >
                      <Link href="/" className="flex items-center gap-3 w-full">
                        <Home className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm text-[var(--text01)]">홈으로</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* 푸터 - 로그아웃 버튼만 */}
          <div className="px-6 py-4 mt-auto">
            <Button 
              variant="outline" 
              className="w-full justify-start border-[var(--divider01)] hover:bg-[var(--layer02Hover)] text-[var(--text01)]" 
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </Sidebar>
        
        <main className="flex-1 overflow-auto bg-[var(--layer01)]">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}

