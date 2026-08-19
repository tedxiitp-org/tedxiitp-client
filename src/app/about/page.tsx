import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Discover the history, mission, and vision of TEDxIIT Patna. Learn how we bring together visionaries, innovators, and thinkers since 2016.",
  alternates: {
    canonical: "https://tedxiitpatna.iitp.ac.in/about",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}