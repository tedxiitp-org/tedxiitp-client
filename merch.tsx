"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

export default function MerchBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <section className="w-full px-4 py-4 sm:py-8">
      {/* Dynamic height: Auto-resizes on mobile, locks into fixed constraints on larger screens */}
      <div className="relative mx-auto max-w-7xl min-h-[300px] sm:h-[280px] lg:h-[300px] overflow-hidden rounded-3xl border border-red-700/30 bg-[#0B0B0B] p-6 sm:p-0 flex items-center">

        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-4 z-30 rounded-full bg-white/10 p-2 text-white transition hover:bg-red-600"
          aria-label="Close banner"
        >
          <X size={18} />
        </button>

        {/* Decorative Background Glows */}
        <div className="absolute -left-20 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-red-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-red-700/20 blur-3xl pointer-events-none" />

        {/* Main Content Container - Stacks on mobile, Row on sm+ */}
        <div className="relative flex flex-col-reverse sm:flex-row h-full w-full items-center justify-between gap-6 sm:gap-0 px-0 sm:px-8 lg:px-12 z-10">

          {/* Left Text Block */}
          <div className="w-full sm:max-w-[55%] text-center sm:text-left">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-red-500 font-semibold block">
              TEDx IIT Patna
            </span>

            <h1 className="mt-2 text-2xl sm:text-4xl lg:text-5xl font-black leading-none text-white uppercase">
              merchandise
              <br />
              <span className="text-red-600">IS LIVE!</span>
            </h1>

            <p className="mt-3 text-sm lg:text-base text-zinc-300 leading-relaxed max-w-md mx-auto sm:mx-0">
              Own exclusive TEDx merchandise and carry the spirit of
              innovation wherever you go.
            </p>

            <Link
              href="/cart"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 lg:px-6 lg:py-3 text-sm lg:text-base font-semibold text-white transition hover:bg-red-500"
            >
              Grab your Merch Now
            </Link>
          </div>

          {/* Right Image Block */}
          <div className="relative flex h-[140px] sm:h-full w-full sm:w-[45%] items-center justify-center">
            {/* Background Big X */}
            <div className="absolute text-[120px] sm:text-[230px] lg:text-[280px] font-black text-red-600/10 leading-none select-none pointer-events-none">
              X
            </div>

            <Image
              src="/merch.svg"
              alt="TEDx Merch"
              width={450}
              height={450}
              className="relative z-10 h-[130px] sm:h-[210px] lg:h-[250px] w-auto object-contain"
              priority
            />
          </div>

        </div>
      </div>
    </section>
  );
}