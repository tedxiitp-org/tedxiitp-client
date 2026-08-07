"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bebas_Neue, Space_Grotesk, Fredoka } from 'next/font/google';
import { ChevronLeft } from "lucide-react";

export const bebasNeue = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas-neue' });
export const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
export const fredoka = Fredoka({ weight: '700', subsets: ['latin'], variable: '--font-fredoka' });

export default function TedxThemeSection() {
  return (
    <>
      {/* 1. FIXED BUTTON */}
      <div className="absolute top-14 left-6 sm:top-14 sm:left-10 md:top-20 md:left-10 lg:left-11 lg:top-19 z-[100]">
        <Link
          className="text-[#EB0028] hover:text-[#EB0028CC] transition-colors"
          href="/past-editions"
          onClick={(e) => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              e.preventDefault();
              window.history.back();
            }
          }}
        >
          <ChevronLeft className="w-8 h-8 sm:w-8 sm:h-8 md:w-12 md:h-12 lg:w-17 lg:h-17" />
        </Link>
      </div>

      <div
        className={`${fredoka.variable} ${bebasNeue.variable} ${spaceGrotesk.variable} bg-cover bg-top min-h-screen w-full relative flex flex-col items-center pt-6 pb-12 px-6 sm:px-8 md:px-12 overflow-hidden ml-2 sm:ml-8 md:ml-9 lg:ml-10 -mt-17`}
        style={{
          backgroundImage: "url('/editions/image 62.png')",
          backgroundPosition: "top right"
        }}
      >
        <div className="w-full max-w-6xl mx-auto z-10 flex flex-col  items-start mt-30 sm:mt-40 md:mt-50 lg:mt-70 relative -translate-x-5 sm:-translate-x-4 md:-translate-x-9 lg:-translate-x-10">

          {/* Heading Container with SVGs */}
          <div className="flex flex-col pt-8 sm:pt-16 md:pt-24 w-full text-left select-none">

            {/* SHEDDING OFF SVG */}
            <div className="w-[180px] sm:w-[240px] md:w-[350px] lg:w-[500px] transition-transform duration-300 hover:scale-[1.02] origin-left cursor-pointer">
              <Image
                src="/editions/Shedding off.svg"
                alt="SHEDDING OFF"
                width={900}
                height={200}
                className="w-full h-auto object-contain"
                priority
              />
            </div>

            {/* FEATHERS SVG */}
            <div className="w-[120px] sm:w-[160px] md:w-[250px] lg:w-[360px] transition-transform duration-300 hover:scale-[1.02] origin-left cursor-pointer mt-3 sm:mt-6">
              <Image
                src="/editions/feathers copy.svg"
                alt="FEATHERS"
                width={900}
                height={200}
                className="w-full h-auto object-contain"
                priority
              />
            </div>

          </div>

          {/* About the Theme Box */}
          <div className="w-full mt-80 sm:mt-80 md:mt-100 lg:mt-200 mb-8 z-10">
            <div className="flex flex-col p-6 sm:p-8 md:p-12 bg-[#BC1918]/10 border-[2px] sm:border-[3px] border-[#EB0028CC] rounded-2xl items-start text-white shadow-2xl">

              <h2 className="font-[family-name:var(--font-bebas-neue)] text-4xl sm:text-5xl md:text-6xl tracking-wide text-left mb-6 uppercase w-full">
                ABOUT THE THEME
              </h2>

              <div className="w-full max-w-4xl text-left mb-8 font-serif">
                <p className="text-lg sm:text-xl md:text-2xl text-gray-200 italic font-light leading-relaxed">
                  "The secret of change is to focus all your energy not on fighting the old but on building the new"
                </p>
                <div className="text-left sm:text-right w-full mt-3 sm:pr-8">
                  <span className="text-sm sm:text-base md:text-lg text-[#EB0028] font-sans font-medium tracking-wide">
                    — Socrates
                  </span>
                </div>
              </div>

              <div className="font-[family-name:var(--font-space-grotesk)] text-sm sm:text-base md:text-xl lg:text-2xl text-left text-gray-200 max-w-5xl space-y-6 leading-relaxed w-full">
                <p>
                  TEDxIIT Patna believes that building anything new is possible when we let go of the old.
                  Just as birds shed their feathers, allowing the new ones to embrace, taking them afresh
                  to infinite skies, bringing out change is an inevitable part of one’s life to keep walking
                  the course of life. A change within us to become better.
                </p>
                <p>
                  A change within the society to make this a better place to live in.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}