"use client";

import React from "react";
import AboutTed from "@/src/components/about/AboutTed";
import TeamSection from "@/src/components/about/TeamSection";
import { motion } from "framer-motion";

export default function AboutClient() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="flex flex-col gap-8 sm:gap-10"
    >
      <div className="flex flex-row items-center justify-center">
        <span className="text-[#F3E9DC] font-bebas text-[30px] sm:text-[60px] md:text-[70px] lg:text-[90px] font-normal not-italic ">
          ABOUT&nbsp;&nbsp;
          <span className="text-[#EB0028] font-cormorant text-[30px] sm:text-[60px] md:text-[70px] lg:text-[90px] font-bold">
            TEDxIIT Patna
          </span>
        </span>
      </div>
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-[10px] sm:text-[18px] md:text-[22px] lg:text-[28px] font-space font-light tracking-[0.01em] text-center text-white">
          Since 2016, TEDxIIT Patna has served as a crucible for ideas, dialogue, and imagination-bridging disciplines and perspectives to spark conversations that endure. With a consistent footfall of 1500+ attendees across past editions, it has become a space where curiosity meets clarity, and complexity gives way to connection. Through changing times and shifting landscapes, the platform has remained committed to elevating diverse voices and celebrating the nuance in thought. It stands not just as an event, but as an evolving archive of insight-where fleeting moments of expression form lasting interludes in the broader narrative of innovation and understanding.
        </p>
      </div>

      {/* Separate, state-of-the-art Team Section with LinkedIn & Department Filter */}
      <TeamSection />

      <AboutTed />
    </motion.div>
  );
}
