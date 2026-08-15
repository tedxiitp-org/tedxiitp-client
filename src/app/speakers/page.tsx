import type { Metadata } from "next";
import SpeakersClient from "./SpeakersClient";

export const metadata: Metadata = {
  title: "Past Speakers",
  description:
    "Explore the visionary speakers, innovators, leaders, and artists who have taken the TEDxIIT Patna stage across past editions.",
  alternates: {
    canonical: "https://tedxiitpatna.iitp.ac.in/speakers",
  },
};

export default function SpeakersPage() {
  return <SpeakersClient />;
}
