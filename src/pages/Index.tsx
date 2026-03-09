import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import PricingSection from "@/components/landing/PricingSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { usePricingEnabled } from "@/hooks/usePricingEnabled";

const Index = () => {
  const pricingEnabled = usePricingEnabled();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <Features />
      {pricingEnabled && <PricingSection />}
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
