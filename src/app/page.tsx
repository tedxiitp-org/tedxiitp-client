"use client";
import { motion } from "framer-motion";
import Link from "next/link";
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
      <div className="relative w-[calc(100%+1rem)] sm:w-[calc(100%+3rem)] -mx-2 sm:-mx-6 -mt-4 mb-4 note_bg py-3 text-center flex justify-center items-center">
        <Link 
          href="/games/mario" 
          className="text-white px-6 py-2 rounded-full font-bold tracking-widest uppercase text-sm sm:text-base font-sans transition-colors shadow-[0_0_15px_rgba(220,38,38,0.6)] border border-red-500/50"
        >
          Mario is out now play it!
        </Link>
      </div>
      <ComingSoon/>
    </div>
  );
}
