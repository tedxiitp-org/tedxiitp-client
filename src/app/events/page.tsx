import type { Metadata } from "next";
import EventsClient from "./EventsClient";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Explore upcoming and past events hosted by TEDxIIT Patna, including pre-events, workshops, community wall discussions, and main conferences.",
  alternates: {
    canonical: "https://tedxiitpatna.iitp.ac.in/events",
  },
};

export default function EventsPage() {
  return <EventsClient />;
}