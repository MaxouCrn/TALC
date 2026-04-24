import Hero from "@/components/sections/Hero";
import NewsSection from "@/components/sections/NewsSection";
import ActivitiesSection from "@/components/sections/ActivitiesSection";
import FeedPreview from "@/components/sections/FeedPreview";
import PracticalSection from "@/components/sections/PracticalSection";

export default function Home() {
  return (
    <>
      <Hero />
      <NewsSection />
      <ActivitiesSection />
      <FeedPreview />
      <PracticalSection />
    </>
  );
}
