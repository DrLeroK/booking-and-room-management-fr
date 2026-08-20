import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { HeroSection } from "@/components/public/HeroSection";
import { Testimonials } from "@/components/public/Testimonials";
import { Gallery } from "@/components/public/Gallery";
import { FAQ } from "@/components/public/FAQ";
import { Amenities } from "@/components/public/Amenities";
import { StatsSection } from "@/components/public/StatsSection";
import { WhyChooseUs } from "@/components/public/WhyChooseUs";
import { Partners } from "@/components/public/Partners";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <Amenities />
        <WhyChooseUs />
        <Testimonials />
        <Gallery />
        <Partners />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
