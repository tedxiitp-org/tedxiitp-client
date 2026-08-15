import type { Metadata } from "next";
import LogoLoopSection from "@/src/features/components/home/LogoLoopSection";

export const metadata: Metadata = {
  title: "Sponsors & Partners",
  description: "Partners and sponsors supporting TEDxIIT Patna in bringing world-changing ideas to light.",
  alternates: {
    canonical: "https://tedxiitpatna.iitp.ac.in/sponsors",
  },
};

export default function Sponsors() {
  return <LogoLoopSection />;
}