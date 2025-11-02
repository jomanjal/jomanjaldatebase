import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { GameCoachSection } from "@/components/game-coach-section"
import { KeyBenefitsSection } from "@/components/key-benefits-section"
import { AIMatchingProcessSection } from "@/components/ai-matching-process-section"
import { InstructorProfileSection } from "@/components/instructor-profile-section"
import { UseCaseSection } from "@/components/use-case-section"
import { ReviewsSection } from "@/components/reviews-section"
import { CTAHighlightSection } from "@/components/cta-highlight-section"
import { FooterSection } from "@/components/footer-section"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <GameCoachSection />
      <KeyBenefitsSection />
      <AIMatchingProcessSection />
      <InstructorProfileSection />
      <UseCaseSection />
      <ReviewsSection />
      <CTAHighlightSection />
      <FooterSection />
    </main>
  )
}
