"use client";

import { useEffect, useRef, useState } from "react";
import SpeakerCard from "@/src/components/pastSpeakers/SpeakerCard";
import SpeakerModal from "@/src/components/pastSpeakers/Modal";
import SpeakersSkeleton from "@/src/components/pastSpeakers/Skeleton";
import { Dialog } from "@/src/components/ui/dialog";
import { speakerServices } from "@/services/speakerServices";
import { Speaker } from "@/types/speaker";

const YEARS = ["2026", "2025", "2024", "2023", "2022", "2021", "2019"];

export default function SpeakersClient() {
  const [selectedYear, setSelectedYear] = useState("2026");
  const [speakers, setSpeakers] = useState<Speaker[] | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalSpeaker, setModalSpeaker] = useState<Speaker | null>(null);

  // Refs for cards carousel
  const containerRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Refs for years carousel
  const yearContainerRef = useRef<HTMLDivElement>(null);
  const yearRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const yearScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProgrammaticScroll = useRef(false);

  useEffect(() => {
    let isCurrent = true;
    setSpeakers(null);
    setActiveIndex(0);

    speakerServices.getSpeakersByYear(selectedYear).then((result) => {
      if (isCurrent) setSpeakers(result);
    });

    return () => {
      isCurrent = false;
    };
  }, [selectedYear]);

  // Smooth debounced scroll listener for Year Selector
  const handleYearScroll = () => {
    if (isProgrammaticScroll.current) return;

    if (yearScrollTimeoutRef.current) {
      clearTimeout(yearScrollTimeoutRef.current);
    }

    // Wait until scrolling decelerates/settles before switching state
    yearScrollTimeoutRef.current = setTimeout(() => {
      if (!yearContainerRef.current) return;

      const containerRect = yearContainerRef.current.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      let closestIndex = 0;
      let minDistance = Infinity;

      yearRefs.current.forEach((el, index) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const distance = Math.abs(containerCenter - center);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      const newYear = YEARS[closestIndex];
      if (newYear && newYear !== selectedYear) {
        setSelectedYear(newYear);
      }
    }, 120);
  };

  // Scroll clicked year directly to the center
  const scrollToYear = (year: string, index: number) => {
    setSelectedYear(year);
    isProgrammaticScroll.current = true;

    const el = yearRefs.current[index];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }

    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 500);
  };

  // Track center-most speaker card
  const handleCardScroll = () => {
    if (!containerRef.current || !speakers || speakers.length === 0) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    cardRefs.current.forEach((cardEl, index) => {
      if (!cardEl) return;
      const cardRect = cardEl.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(containerCenter - cardCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  const scrollToCard = (index: number) => {
    setActiveIndex(index);
    const cardEl = cardRefs.current[index];
    if (cardEl && containerRef.current) {
      cardEl.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-black py-8 text-white sm:py-12">
      <h1 className="font-bebas text-center text-5xl uppercase tracking-wide text-[#F3E9DC] sm:text-7xl lg:text-8xl">
        Past Speakers
      </h1>

      {/* Smooth Scrollable Year Selector */}
      <div
        ref={yearContainerRef}
        onScroll={handleYearScroll}
        className="mt-6 flex w-full items-center gap-6 overflow-x-auto px-[calc(50%-60px)] py-5 scroll-smooth snap-x snap-proximity no-scrollbar [touch-action:pan-x] sm:gap-8 sm:px-[calc(50%-80px)]"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {YEARS.map((year, index) => {
          const isSelected = selectedYear === year;
          return (
            <button
              key={year}
              ref={(el) => {
                yearRefs.current[index] = el;
              }}
              type="button"
              onClick={() => scrollToYear(year, index)}
              className={`snap-center shrink-0 rounded-full border font-albertSans tracking-wider select-none transform-gpu transition-all duration-500 ease-out ${
                isSelected
                  ? "scale-110 sm:scale-120 border-[#B3031C] bg-gradient-to-r from-[#EB0028] to-[#B3031C] px-6 py-2 sm:px-8 sm:py-2.5 text-lg sm:text-2xl font-bold text-white shadow-xl shadow-red-600/25"
                  : "scale-95 border-[#B3031C]/40 bg-zinc-950/40 px-5 py-1.5 sm:px-6 sm:py-2 text-sm sm:text-lg text-zinc-500 hover:text-zinc-300 hover:scale-100"
              }`}
            >
              {year}
            </button>
          );
        })}
      </div>

      {/* Cards Carousel */}
      <section
        ref={containerRef}
        onScroll={handleCardScroll}
        className="mt-8 flex min-h-[440px] w-full items-center gap-4 overflow-x-auto px-[calc(50%-40vw)] scroll-smooth snap-x snap-mandatory no-scrollbar sm:gap-6 sm:px-[calc(50%-200px)]"
      >
        {!speakers ? (
          <SpeakersSkeleton />
        ) : speakers.length === 0 ? (
          <p className="w-full text-center font-sourceSans text-zinc-400">
            No speakers available for {selectedYear}.
          </p>
        ) : (
          speakers.map((speaker, index) => (
            <div
              key={speaker._id ?? speaker.name}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className="snap-center shrink-0 select-none flex items-center justify-center"
            >
              <SpeakerCard
                speaker={speaker}
                isSelected={index === activeIndex}
                onClick={() => scrollToCard(index)}
                onOpenModal={() => setModalSpeaker(speaker)}
              />
            </div>
          ))
        )}
      </section>

      <Dialog open={!!modalSpeaker} onOpenChange={(open) => !open && setModalSpeaker(null)}>
        {modalSpeaker && <SpeakerModal speaker={modalSpeaker} />}
      </Dialog>
    </main>
  );
}