"use client";
import { motion } from "framer-motion";
import HeroHome from "@/src/features/components/home/heroHome";
import BuyTickets from "../features/components/home/buyTickects";
import AboutTheTheme from "../features/components/home/aboutTheTheme";
import SpeakerHome from "../features/components/home/speakerhome";
import MerchBanner from "../components/merch";
import EventBanner from "../components/eventBanner";
import TicketBanner from "../components/tickectsBanner";

export default function IndexPage() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="h-auto bg-cover bg-center bg-no-repeat overflow-x-hidden"
    >
      <section className="relative h-auto overflow-hidden">
        <HeroHome />
      </section>
      <AboutTheTheme />
      <SpeakerHome />
      <BuyTickets />
      <MerchBanner />
      <EventBanner />
      <TicketBanner />
    </motion.main>
  );
}