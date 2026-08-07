"use client";

import React from 'react';
import Link from "next/link";
import Image from "next/image";
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
        className={`${fredoka.variable} ${bebasNeue.variable} ${spaceGrotesk.variable} bg-cover bg-top min-h-screen w-full relative flex flex-col pb-16 px-4 sm:px-6 lg:px-8 ml-2 sm:ml-8 md:ml-9 lg:ml-10 -mt-17`}
        style={{ backgroundImage: "url('/editions/WhatsApp Image 2026-07-01 at 03.01.36 copy.jpeg')" }}
      >
        <div className="w-full max-w-6xl mx-auto flex flex-col">

          {/* 1. Heading Container with Stacked Layers */}
          <div className="relative text-left w-full z-10 flex flex-col mt-40 sm:mt-50 md:mt-60 lg:mt-70 gap-7 lg:-translate-x-20">

            {/* INFINITE SECTION */}
            <div className="relative w-[180px] sm:w-[300px] md:w-[350px] lg:w-[550px] cursor-pointer transition-transform duration-300 hover:scale-[1.02]">

              {/* MAIN TEXT LAYER (Relative) */}
              <div className="relative z-10">
                <Image src="/editions/Infinite.svg" alt="INFINITE" width={900} height={200} className="w-full h-auto" priority />
              </div>
            </div>

            {/* AFFINITIES SECTION */}
            <div className="relative w-[250px] sm:w-[400px] md:w-[450px] lg:w-[650px] cursor-pointer transition-transform duration-300 hover:scale-[1.02]">

              {/* MAIN TEXT LAYER (Relative) */}
              <div className="relative z-10">
                <Image src="/editions/affinities.svg" alt="AFFINITIES" width={900} height={200} className="w-full h-auto" priority />
              </div>
            </div>

          </div>

          {/* 2. About the Theme Box */}
          <div className="w-full mt-[250px] sm:mt-[300px] md:mt-[400px] lg:mt-[600px] mb-8 z-10">
            <div className="flex flex-col p-6 sm:p-8 md:p-12 bg-[#BC1918]/10 border-2 sm:border-3 border-[#EB0028CC] rounded-2xl items-center text-white shadow-2xl">
              <h2 className="[font-family:var(--font-bebas-neue)] text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-center mb-6 tracking-wider">
                ABOUT THE THEME
              </h2>
              <p className="[font-family:var(--font-space-grotesk)] text-sm sm:text-base md:text-lg lg:text-2xl text-center text-gray-200 leading-relaxed max-w-4xl mx-auto">
                We at TEDxIIT Patna believe that dreams can become reality when everyone works together.
                We are an amalgamation of ideas - intertwined by the bonds we share. Through
                Infinite Affinities, we celebrate unity and the spirit of togetherness.
                <br /><br />
                We are human only through the humanity of others. If we are to
                accomplish anything—it will, in equal measure, be due to the work
                and achievements of the entire community.
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}