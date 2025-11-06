import { Github, Twitter, Youtube } from "lucide-react"

export function FooterSection() {
  return (
    <footer className="py-10 px-4 bg-[var(--layer01)] border-t border-[var(--divider01)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-[var(--textPrimary)] mb-2">GameCoach.AI</h3>
          <p className="text-[var(--text04)] text-sm max-w-md mx-auto">
            AI 기술로 게임 코칭의 새로운 패러다임을 제시합니다
          </p>
        </div>

        <div className="flex justify-center gap-6 mb-8">
          <a href="#" className="text-[var(--text04)] hover:text-[var(--textPrimary)]">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="#" className="text-[var(--text04)] hover:text-[var(--textPrimary)]">
            <Youtube className="w-5 h-5" />
          </a>
          <a href="#" className="text-[var(--text04)] hover:text-[var(--textPrimary)]">
            <Github className="w-5 h-5" />
          </a>
        </div>

        <div className="text-center text-xs text-[var(--text04)]">
          <p>본 데모는 예시 UI이며 실제 동작하지 않습니다.</p>
          <p className="mt-1">© 2025 GameCoach.AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
