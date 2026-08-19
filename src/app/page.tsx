import type { Metadata } from "next";
import Link from "next/link";
import HomeHero from "@/features/components/home/heroHome";
import AboutTheTheme from "@/features/components/home/aboutTheTheme";

export const metadata: Metadata = {
  title: "TEDxIIT Patna | Home",
  description:
    "Official website of TEDxIIT Patna. Discovering, debating, and spreading ideas that spark conversation, deepen understanding, and drive meaningful change at IIT Patna.",
  alternates: {
    canonical: "https://tedxiitpatna.iitp.ac.in",
  },
};

export default function IndexPage() {
  return (
    <div className="flex flex-col w-full">
      <div className="relative w-[calc(100%+1rem)] sm:w-[calc(100%+3rem)] -mx-2 sm:-mx-6 -mt-4 mb-4 note_bg py-3 text-center flex justify-center items-center">
        Theme is live now!
        {/* <Link 
          href="/games/mario" 
          className="text-white px-6 py-2 rounded-full font-bold tracking-widest uppercase text-sm sm:text-base font-sans transition-colors shadow-[0_0_15px_rgba(220,38,38,0.6)] border border-red-500/50"
        >
        </Link> */}
      </div>
      <HomeHero />
      <AboutTheTheme />
    </div>
  );
}
