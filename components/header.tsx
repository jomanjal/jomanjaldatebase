"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChatbotModal } from "@/components/chatbot-modal"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { isAuthenticated, getCurrentUser, logout } from "@/lib/auth"

export function Header() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    setAuthenticated(isAuthenticated())
    setCurrentUser(getCurrentUser())
  }, [])

  const handleLogout = () => {
    logout()
    setAuthenticated(false)
    setCurrentUser(null)
    router.push("/")
  }

  return (
    <>
      <header className="w-full bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-xl font-bold text-foreground">GameCoach.AI</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <HoverCard openDelay={0} closeDelay={100}>
                <HoverCardTrigger className="text-foreground hover:text-primary transition-colors cursor-pointer">
                  <span>GCA 소개</span>
                </HoverCardTrigger>
                <HoverCardContent className="w-48 p-2">
                  <div className="space-y-1">
                    <Link href="#company" className="block px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors">
                      회사 소개
                    </Link>
                    <Link href="#team" className="block px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors">
                      팀 소개
                    </Link>
                    <Link href="#history" className="block px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors">
                      연혁
                    </Link>
                    <Link href="#location" className="block px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors">
                      오시는 길
                    </Link>
                  </div>
                </HoverCardContent>
              </HoverCard>
              <Link href="/coaches" className="text-foreground hover:text-primary transition-colors">
                코치 목록
              </Link>
              <Link href="/reviews" className="text-foreground hover:text-primary transition-colors">
                수업후기
              </Link>
              <a href="#notice" className="text-foreground hover:text-primary transition-colors">
                공지사항
              </a>
            </nav>

            {/* Login and AI Matching Buttons */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setIsChatbotOpen(true)}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                AI 매칭
              </Button>
              {authenticated && currentUser?.username === "admin112" && (
                <Link href="/admin">
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    관리자
                  </Button>
                </Link>
              )}
              {authenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-muted-foreground">{currentUser?.username}</span>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="text-foreground hover:text-primary"
                  >
                    로그아웃
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-foreground hover:text-primary"
                  >
                    로그인
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <ChatbotModal isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </>
  )
}
