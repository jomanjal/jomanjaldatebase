import { Header } from "@/components/header"
import { GameCoachSection } from "@/components/game-coach-section"
import { KeyBenefitsSection } from "@/components/key-benefits-section"
import { AIMatchingProcessSection } from "@/components/ai-matching-process-section"
import { InstructorProfileSection } from "@/components/instructor-profile-section"
import { UseCaseSection } from "@/components/use-case-section"
import { ReviewsSection } from "@/components/reviews-section"
import { FooterSection } from "@/components/footer-section"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--layer01)]" style={{ transition: 'var(--transition)' }}>
      <Header />
      <GameCoachSection />
      <KeyBenefitsSection />
      <AIMatchingProcessSection />
      <InstructorProfileSection />
      <UseCaseSection />
      <ReviewsSection />
      <FooterSection />
    </main>
  )
}
