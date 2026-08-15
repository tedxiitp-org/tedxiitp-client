import type { Metadata } from "next";
import OurJourney from "@/src/components/past-editions/OurJourney";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Past Editions",
  description:
    "Journey through the past editions of TEDxIIT Patna — from Veiled Veracity to Terra Incognita and beyond.",
  alternates: {
    canonical: "https://tedxiitpatna.iitp.ac.in/past-editions",
  },
};

export default function JourneyPage() {
  return <OurJourney />;
}