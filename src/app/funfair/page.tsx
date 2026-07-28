"use client";

import React, { useState } from 'react';
import { Bebas_Neue, Space_Grotesk } from "next/font/google";


interface PolaroidPhoto {
  id: number | string;
  frameSrc: string;
}

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

// Original thumbnails from your code (excluding the first one which is spotlight by default)
const FUNFAIR_PHOTOS: PolaroidPhoto[] = [
  { id: 2, frameSrc: "/funfair/Group 48095539.png" },
  { id: 3, frameSrc: "/funfair/Group 48095540.png" },
  { id: 4, frameSrc: "/funfair/Group 48095541.png" },
  { id: 5, frameSrc: "/funfair/Group 48095542.png" },
  { id: 6, frameSrc: "/funfair/Group 48095543.png" },
  { id: 7, frameSrc: "/funfair/Group 48095544.png" },
];

export default function FunFairSection() {
  // 1. Separate the Spotlight image from the Thumbnails
  const [spotlight, setSpotlight] = useState<PolaroidPhoto>({
    id: 1,
    frameSrc: "/funfair/Group 48095538.png"
  });

  const [thumbnails, setThumbnails] = useState<PolaroidPhoto[]>(FUNFAIR_PHOTOS);

  // 2. The Complete Swap Logic
  const handleSwap = (clickedIndex: number) => {
    const clickedThumbnail = thumbnails[clickedIndex];
    const oldSpotlight = spotlight;

    // Put the clicked thumbnail into the spotlight
    setSpotlight(clickedThumbnail);

    // Put the old spotlight into the clicked thumbnail's spot in the grid
    setThumbnails((prevThumbnails) => {
      const newThumbnails = [...prevThumbnails];
      newThumbnails[clickedIndex] = oldSpotlight;
      return newThumbnails;
    });
  };

  return (
    <section className="flex flex-col items-center w-full px-5 pt-0 md:pt-4 pb-10 text-white bg-transparent box-border">

      {/* Title Header Layout Area */}
      <div className="text-center w-full max-w-[850px] mb-8">
        <h1 className={`${bebasNeue.className} font-bold scale-y-[1.2] text-5xl md:text-[72px] mb-5`}>
          <span className="text-[#e61c1c]">FUN</span> FAIR
        </h1>

        <p className={`${spaceGrotesk.className} tracking-normal text-base md:text-[17.5px] font-light leading-relaxed mx-auto mb-10`}>
          Every TEDx journey begins long before the first speaker steps onto the stage. Funfair is where that journey comes to life, a vibrant celebration that transforms the campus into a hub of energy, creativity, and connection. Explore interactive games, engaging activities, curated photo spots, and delightful surprises around every corner. Whether you’re here to play, create, or simply soak in the atmosphere, Funfair sets the tone for an unforgettable TEDxIIT Patna experience, where conversations begin long before ideas take the stage.
        </p>
      </div>

      {/* Main Interactive Stage Workspace */}
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_1.5fr] gap-10 w-full max-w-[1100px] items-center">

        {/* LEFT COLUMN: Spotlight */}
        <div className="flex flex-col gap-4 w-full items-center lg:items-start">
          <span className={`${bebasNeue.className} text-[#e61c1c] text-xl md:text-2xl tracking-wide uppercase`}>
            A trip down the memory lane... ↴
          </span>

          <div className="relative w-full max-w-[440px] aspect-square flex justify-center">
            {/* The single Spotlight Image/Frame */}
            <div
              className="absolute inset-0 bg-[length:100%_100%] bg-no-repeat transition-all duration-300"
              style={{ backgroundImage: `url('${spotlight.frameSrc}')` }}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Grid Thumbnails */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
          {thumbnails.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => handleSwap(index)}
              className="relative w-full aspect-[23/21] cursor-pointer transition-transform duration-200 flex justify-center scale-100 hover:scale-[1.03]"
            >
              {/* The single Thumbnail Image/Frame */}
              <div
                className="absolute inset-0 bg-[length:100%_100%] bg-no-repeat"
                style={{ backgroundImage: `url('${photo.frameSrc}')` }}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
