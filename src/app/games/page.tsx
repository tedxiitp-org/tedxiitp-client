import type { Metadata } from "next";
import GamesClient from "./GamesClient";

export const metadata: Metadata = {
  title: "Games",
  description:
    "Play interactive games created by TEDxIIT Patna including Super Mario and compete on the global leaderboard.",
  alternates: {
    canonical: "https://tedxiitpatna.iitp.ac.in/games",
  },
};

export default function GamesPage() {
  return <GamesClient />;
}
