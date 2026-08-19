"use client";

import { useState, useRef, useEffect, UIEvent } from "react";
import { motion } from "framer-motion";
import SpeakerCard from "@/src/components/pastSpeakers/SpeakerCard";
import SpeakerModal from "@/src/components/pastSpeakers/Modal";
import { Dialog } from "@/src/components/ui/dialog";
import { speakerServices } from "@/services/speakerServices";
import { Speaker } from "@/types/speaker";
import SpeakersSkeleton from "@/src/components/pastSpeakers/Skeleton";

const YEARS = ["2025", "2024", "2023", "2022", "2021", "2019"];

export default function SpeakersClient() {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [scrollingYear, setScrollingYear] = useState("2025");

  const [activeIdx, setActiveIdx] = useState(0);
  const [currentSpeakers, setSpeakers] = useState<Speaker[] | null>(null);
  const [modalSpeaker, setModalSpeaker] = useState<Speaker | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const yearsRef = useRef<HTMLDivElement>(null);

  const isInternalScrolling = useRef(false);
  const scrollDebounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const dataFetchTimeout = useRef<NodeJS.Timeout | null>(null);

  const dragTracker = useRef({
    isDragging: false,
    startX: 0,
    currentX: 0,
    startScrollLeft: 0,
    startTime: 0,
  });

  useEffect(() => {
    const fetchSpeakers = async () => {
      if (carouselRef.current) {
        carouselRef.current.scrollLeft = 0;
      }
      setActiveIdx(0);
      setSpeakers(null);

      const res = await speakerServices.getSpeakersByYear(selectedYear);
      setSpeakers(res);
    };
    fetchSpeakers();
  }, [selectedYear]);

  useEffect(() => {
    const defaultIdx = YEARS.indexOf("2025");
    if (defaultIdx !== -1) {
      setTimeout(() => {
        centerElementByIndex(yearsRef.current, defaultIdx, "auto");
      }, 100);
    }
  }, []);

  const getCenteredElementIndex = (container: HTMLDivElement): number => {
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    const children = Array.from(container.children) as HTMLElement[];

    let closestIndex = 0;
    let minDistance = Infinity;

    children.forEach((child, index) => {
      const childRect = child.getBoundingClientRect();
      const childCenter = childRect.left + childRect.width / 2;
      const distance = Math.abs(containerCenter - childCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  const centerElementByIndex = (
    container: HTMLDivElement | null,
    index: number,
    behavior: "smooth" | "auto" = "smooth"
  ) => {
    if (!container) return;
    const children = container.children;
    if (children[index]) {
      if (behavior === "smooth") isInternalScrolling.current = true;

      const target = children[index] as HTMLElement;
      const targetOffset = target.offsetLeft;
      const targetWidth = target.offsetWidth;
      const containerWidth = container.offsetWidth;

      container.scrollTo({
        left: targetOffset - containerWidth / 2 + targetWidth / 2,
        behavior: behavior,
      });

      if (behavior === "smooth") {
        if (scrollDebounceTimeout.current) clearTimeout(scrollDebounceTimeout.current);
        scrollDebounceTimeout.current = setTimeout(() => {
          isInternalScrolling.current = false;
        }, 350);
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    container.setPointerCapture(e.pointerId);
    dragTracker.current = {
      isDragging: true,
      startX: e.pageX - container.offsetLeft,
      currentX: e.pageX - container.offsetLeft,
      startScrollLeft: container.scrollLeft,
      startTime: Date.now(),
    };
    container.style.scrollSnapType = "none";
    container.style.scrollBehavior = "auto";
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragTracker.current.isDragging) return;
    
    const container = e.currentTarget;
    const x = e.pageX - container.offsetLeft;
    dragTracker.current.currentX = x;
    const distance = x - dragTracker.current.startX;

    const walkMultiplier = 1.5;
    container.scrollLeft = dragTracker.current.startScrollLeft - distance * walkMultiplier;

    const centerIndex = getCenteredElementIndex(container);
    if (container === yearsRef.current) {
      if (YEARS[centerIndex] && YEARS[centerIndex] !== scrollingYear) {
        setScrollingYear(YEARS[centerIndex]);
      }
    }
  };

  const handlePointerUpOrLeave = (e: React.PointerEvent<HTMLDivElement>, type: "years" | "speakers") => {
    if (!dragTracker.current.isDragging) return;
    
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}

    const container = e.currentTarget;
    container.style.scrollSnapType = "x mandatory";
    container.style.scrollBehavior = "smooth";

    const centerIndex = getCenteredElementIndex(container);
    if (type === "years") {
      if (dataFetchTimeout.current) clearTimeout(dataFetchTimeout.current);

      const targetedYear = YEARS[centerIndex];
      if (targetedYear) {
        setScrollingYear(targetedYear);
        if (targetedYear !== selectedYear) {
          setSelectedYear(targetedYear);
        }
      }
      centerElementByIndex(yearsRef.current, centerIndex, "smooth");
    } else {
      if (centerIndex !== activeIdx) {
        setActiveIdx(centerIndex);
      }
      centerElementByIndex(carouselRef.current, centerIndex, "smooth");
    }

    dragTracker.current.isDragging = false;
    setTimeout(() => {
      dragTracker.current.startX = 0;
      dragTracker.current.currentX = 0;
    }, 50);
  };

  const handleSpeakersScroll = (e: UIEvent<HTMLDivElement>) => {
    if (isInternalScrolling.current || dragTracker.current.isDragging) return;

    const centerIndex = getCenteredElementIndex(e.currentTarget);
    if (centerIndex !== activeIdx) {
      setActiveIdx(centerIndex);
    }
  };

  const handleYearsScroll = (e: UIEvent<HTMLDivElement>) => {
    if (isInternalScrolling.current || dragTracker.current.isDragging) return;

    const targetContainer = e.currentTarget;
    const centerIndex = getCenteredElementIndex(targetContainer);
    const currentOverYear = YEARS[centerIndex];
    if (currentOverYear && currentOverYear !== scrollingYear) {
      setScrollingYear(currentOverYear);
    }
    if (dataFetchTimeout.current) clearTimeout(dataFetchTimeout.current);
    dataFetchTimeout.current = setTimeout(() => {
      if (currentOverYear && currentOverYear !== selectedYear) {
        setSelectedYear(currentOverYear);
      }
    }, 200);
  };

  const handleYearClick = (year: string, idx: number) => {
    const distanceMoved = Math.abs(dragTracker.current.currentX - dragTracker.current.startX);
    if (distanceMoved < 10) {
      if (dataFetchTimeout.current) clearTimeout(dataFetchTimeout.current);
      setScrollingYear(year);
      setSelectedYear(year);
      centerElementByIndex(yearsRef.current, idx, "smooth");
    }
  };

  return (
    <div className="min-h-screen text-white gap-2 sm:gap-4 flex flex-col items-center overflow-hidden relative ">
      <h2 className="lg:text-[100px] md:text-[80px] sm:text-[70px] text-[50px] xl:text-[110px] uppercase tracking-[0.04rem] sm:tracking-[0.08rem] text-center font-bebas text-[#F3E9DC] leading-tight">
        Past Speakers
      </h2>

      <div className="w-full overflow-hidden relative px-2">
        <div
          ref={yearsRef}
          onScroll={handleYearsScroll}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={(e) => handlePointerUpOrLeave(e, "years")}
          onPointerLeave={(e) => handlePointerUpOrLeave(e, "years")}
          className="flex gap-3 sm:gap-5 lg:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar cursor-grab active:cursor-grabbing touch-pan-y"
          style={{
            paddingLeft: "calc(50% - 40px)",
            paddingRight: "calc(50% - 40px)",
            scrollSnapType: "x mandatory",
          }}
        >
          {YEARS.map((year, idx) => {
            const isVisualSelected = scrollingYear === year;
            return (
              <button
                key={year}
                onClick={() => handleYearClick(year, idx)}
                className={`relative px-5 sm:px-8 lg:px-10 py-1.5 text-[18px] sm:text-[22px] lg:text-[28px] font-albertSans tracking-wider rounded-full border snap-center flex-shrink-0 transition-all duration-500 ease-out select-none
                    ${isVisualSelected ? "border-[#B3031C] text-white " : "border-[#B3031C] text-zinc-500 hover:text-zinc-300 scale-95"}`}
              >
                {isVisualSelected && (
                  <motion.div
                    layoutId="activeYearBg"
                    className="absolute inset-0 bg-gradient-to-r from-[#EB0028] to-[#B3031C] rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  />
                )}
                {year}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full relative flex items-center justify-center h-[420px] sm:h-[420px] overflow-hidden select-none mt-4 sm:mt-6">
        <div
          ref={carouselRef}
          onScroll={handleSpeakersScroll}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={(e) => handlePointerUpOrLeave(e, "speakers")}
          onPointerLeave={(e) => handlePointerUpOrLeave(e, "speakers")}
          className="flex items-center overflow-x-auto snap-x snap-mandatory scroll-smooth w-full no-scrollbar h-full cursor-grab active:cursor-grabbing touch-pan-y"
          style={{
            paddingLeft: "calc(50% - 200px)",
            paddingRight: "calc(50% - 200px)",
            scrollSnapType: "x mandatory"
          }}
        >
          {!currentSpeakers ? (
            <SpeakersSkeleton />
          ) : (
            currentSpeakers.map((speaker, idx) => (
              <div key={speaker._id} className="snap-center flex-shrink-0 select-none">
                <SpeakerCard
                  speaker={speaker}
                  isSelected={idx === activeIdx}
                  onClick={() => {
                    const clickDuration = Date.now() - dragTracker.current.startTime;
                    const distanceMoved = Math.abs(dragTracker.current.currentX - dragTracker.current.startX);
                    if (clickDuration < 250 && distanceMoved < 10) {
                      setActiveIdx(idx);
                      centerElementByIndex(carouselRef.current, idx, "smooth");
                    }
                  }}
                  onOpenModal={() => setModalSpeaker(speaker)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Speaker detail modal — rendered outside carousel to avoid pointer capture issues */}
      <Dialog open={!!modalSpeaker} onOpenChange={(open) => { if (!open) setModalSpeaker(null); }}>
        {modalSpeaker && <SpeakerModal speaker={modalSpeaker} />}
      </Dialog>
    </div>
  );
}
