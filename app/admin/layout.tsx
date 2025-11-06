"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { checkAuth, getCurrentUser, logout, type User } from "@/lib/auth"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  ListChecks,
  LogOut,
  Shield,
  UserCircle,
  Home
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authenticated, setAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
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
        
        // 관리자 권한 확인
        if (user.role !== 'admin') {
          router.push("/login")
          return
        }
        
        setAuthenticated(true)
        setCurrentUser(user)
      } catch (error) {
        console.error('Auth verification error:', error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }
    
    verifyAuth()
  }, [router])

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
                  <div className="w-12 h-12 bg-[var(--primary01)] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-base">
                      {currentUser?.username.charAt(0).toUpperCase() || "A"}
                    </span>
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Badge className="bg-[var(--systemDanger01)] text-white text-[10px] px-1.5 py-0.5 h-5">
                      관리자
                    </Badge>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-[var(--text01)]">
                    {currentUser?.username || "관리자"}
                  </h2>
                  <p className="text-xs text-[var(--text04)] mt-0.5">
                    관리자 계정
                  </p>
                </div>
              </div>
            </div>
            
            {/* 메뉴 그룹 - 더 넓은 패딩 */}
            <SidebarGroup className="px-3 py-4">
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  <SidebarMenuItem className="relative">
                    {pathname === '/admin' && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--primary01)] rounded-r-full z-10" />
                    )}
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === '/admin'}
                      className="relative group rounded-lg px-3 py-2.5 h-auto hover:bg-[var(--primaryOpacity01)] data-[active=true]:bg-[var(--primaryOpacity01)] data-[active=true]:text-[var(--textPrimary)] data-[active=true]:font-medium"
                    >
                      <Link href="/admin" className="flex items-center gap-3 w-full">
                        <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">대시보드</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem className="relative">
                    {pathname === '/admin/users' && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--primary01)] rounded-r-full z-10" />
                    )}
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === '/admin/users'}
                      className="relative group rounded-lg px-3 py-2.5 h-auto hover:bg-[var(--primaryOpacity01)] data-[active=true]:bg-[var(--primaryOpacity01)] data-[active=true]:text-[var(--textPrimary)] data-[active=true]:font-medium"
                    >
                      <Link href="/admin/users" className="flex items-center gap-3 w-full">
                        <UserCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">유저 관리</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem className="relative">
                    {pathname === '/admin/coaches' && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--primary01)] rounded-r-full z-10" />
                    )}
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === '/admin/coaches'}
                      className="relative group rounded-lg px-3 py-2.5 h-auto hover:bg-[var(--primaryOpacity01)] data-[active=true]:bg-[var(--primaryOpacity01)] data-[active=true]:text-[var(--textPrimary)] data-[active=true]:font-medium"
                    >
                      <Link href="/admin/coaches" className="flex items-center gap-3 w-full">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">코치 관리</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem className="relative">
                    {pathname === '/admin/reviews' && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--primary01)] rounded-r-full z-10" />
                    )}
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === '/admin/reviews'}
                      className="relative group rounded-lg px-3 py-2.5 h-auto hover:bg-[var(--primaryOpacity01)] data-[active=true]:bg-[var(--primaryOpacity01)] data-[active=true]:text-[var(--textPrimary)] data-[active=true]:font-medium"
                    >
                      <Link href="/admin/reviews" className="flex items-center gap-3 w-full">
                        <MessageSquare className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">리뷰 관리</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem className="relative">
                    {pathname === '/admin/waitlist' && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--primary01)] rounded-r-full z-10" />
                    )}
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === '/admin/waitlist'}
                      className="relative group rounded-lg px-3 py-2.5 h-auto hover:bg-[var(--primaryOpacity01)] data-[active=true]:bg-[var(--primaryOpacity01)] data-[active=true]:text-[var(--textPrimary)] data-[active=true]:font-medium"
                    >
                      <Link href="/admin/waitlist" className="flex items-center gap-3 w-full">
                        <ListChecks className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">웨이팅 리스트</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
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

