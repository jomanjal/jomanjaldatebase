import { Github, Twitter, Youtube } from "lucide-react"

export function FooterSection() {
  return (
    <footer className="py-12 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-primary mb-2">GameCoach.AI</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            AI 기술로 게임 코칭의 새로운 패러다임을 제시합니다
          </p>
        </div>

        <div className="flex justify-center gap-6 mb-8">
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            <Youtube className="w-5 h-5" />
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            <Github className="w-5 h-5" />
          </a>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>본 데모는 예시 UI이며 실제 동작하지 않습니다.</p>
          <p className="mt-1">© 2025 GameCoach.AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
