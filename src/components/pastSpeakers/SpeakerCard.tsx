"use client";

import { useState, useEffect } from "react";
import { Speaker } from "@/types/speaker";
import Image from "next/image";

interface SpeakerCardProps {
  speaker: Speaker;
  isSelected: boolean;
  onClick: () => void;
  onOpenModal: () => void;
}

export default function SpeakerCard({ speaker, isSelected, onClick, onOpenModal }: SpeakerCardProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const desktopSelectedWidth = 400;
  const desktopUnselectedWidth = 250;

  const cardWidth = isMobile
    ? (isSelected ? "80vw" : "55vw")
    : (isSelected ? desktopSelectedWidth : desktopUnselectedWidth);

  const cardHeight = isMobile
    ? (isSelected ? "350px" : "220px")
    : (isSelected ? 400 : 250);

  return (
    <div
      style={{
        width: cardWidth,
        height: cardHeight,
        zIndex: isSelected ? 10 : 0,
      }}
      className="relative flex-shrink-0 origin-center transition-all duration-300 ease-in-out"
    >
      <div
        onClick={() => {
          if (!isSelected) onClick();
        }}
        style={{ height: cardHeight }}
        className={`relative w-full h-full overflow-hidden transition-all duration-300 ease-in-out cursor-pointer ${
          isSelected ? "rounded-[16px]" : "rounded-none"
        }`}
      >
        <div className="absolute inset-0 bg-neutral-900" />

        {speaker.image ? (
          <Image
            src={speaker.image}
            alt={speaker.name || "Speaker"}
            fill
            onLoad={() => setIsLoaded(true)}
            className={`object-cover transition-all duration-700 ease-out ${
              isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            } ${
              isSelected ? "grayscale-0 contrast-110" : "grayscale tracking-wide"
            }`}
            sizes="(max-width: 640px) 80vw, (max-width: 768px) 250px, 400px"
            priority={isSelected}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs tracking-wider uppercase text-neutral-500">
            Coming Soon
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

        {isSelected && (
          <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center px-4 text-center text-white z-20 transition-all duration-300">
            <h3 className="font-bold text-[20px] sm:text-[24px] tracking-[0.08rem] font-sourceSans max-w-full truncate px-2">
              {speaker.name || "Speaker"}
            </h3>
            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onOpenModal();
              }}
              className="mt-2 cursor-pointer bg-gradient-to-r from-[#EB0028] to-[#B3031C] hover:from-[#B3031C] hover:to-[#B3031C] text-[14px] sm:text-[16px] font-medium font-sourceSans px-4 py-1.5 rounded-full relative z-30"
            >
              Know More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}