"use client";
import { motion } from "framer-motion";
import HeroHome from "@/src/features/components/home/heroHome";
import BuyTickets from "../features/components/home/buyTickects";
import AboutTheTheme from "../features/components/home/aboutTheTheme";
import SpeakerHome from "../features/components/home/speakerhome";
import MerchBanner from "../components/merch";
import EventBanner from "../components/eventBanner";
import TicketBanner from "../components/tickectsBanner";
import ComingSoon from "../components/coming-soon/ComingSoon";

export default function IndexPage() {
  return (
    <div className="flex flex-col w-full">
      <div className="relative w-[calc(100%+1rem)] sm:w-[calc(100%+3rem)] -mx-2 sm:-mx-6 -mt-4 mb-4 note_bg text-white py-3 text-center font-bold tracking-widest uppercase text-sm sm:text-base font-sans">
        Games coming Soon!
      </div>
      <ComingSoon/>
    </div>
  );
}
