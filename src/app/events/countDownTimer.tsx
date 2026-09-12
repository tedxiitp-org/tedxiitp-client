"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Set your target date/time here ──────────────────────────────
export const TARGET_DATE = new Date("2026-09-13T09:00:00");

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

function getTimeLeft(target: Date): TimeLeft {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    };
}

function FlipUnit({ value, label }: { value: number; label: string }) {
    const padded = String(value).padStart(2, "0");

    // displayValue = what the TOP half currently shows. It only catches up to
    // `padded` once the flap animation finishes — not the instant the prop changes.
    const [displayValue, setDisplayValue] = useState(padded);
    // flapValue = the OLD value shown on the animating flap, while it's mid-flip.
    const [flapValue, setFlapValue] = useState<string | null>(null);

    useEffect(() => {
        if (padded !== displayValue && flapValue === null) {
            setFlapValue(displayValue); // capture what top/bottom currently show
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [padded]);

    const isFlipping = flapValue !== null;

    return (
        <div className="flex flex-col items-center">
            <div
                className="relative w-[110px] h-[130px] md:w-[170px] md:h-[200px] rounded-xl bg-zinc-800 shadow-lg"
                style={{ perspective: "500px" }}
            >
                {/* ── Top half: shows displayValue, which lags until the flap finishes ── */}
                <div className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden rounded-t-xl bg-zinc-800">
                    <div className="absolute top-0 left-0 right-0 h-[200%] flex items-center justify-center">
                        <span className="text-6xl md:text-8xl font-bold text-white select-none">
                            {displayValue}
                        </span>
                    </div>
                </div>

                {/* ── Bottom half: also shows displayValue — stays in sync with top until the flap reveals the new one ── */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden rounded-b-xl bg-zinc-700">
                    <div className="absolute bottom-0 left-0 right-0 h-[200%] flex items-center justify-center">
                        <span className="text-6xl md:text-8xl font-bold text-white select-none">
                            {displayValue}
                        </span>
                    </div>
                </div>

                {/* ── The flap: OLD value's bottom half, hinged at the center seam, rotates up and away.
                     When it finishes, BOTH halves flip to the new value at once. ── */}
                <AnimatePresence>
                    {isFlipping && (
                        <motion.div
                            key={flapValue + "-flap"}
                            initial={{ rotateX: 0 }}
                            animate={{ rotateX: 90 }}
                            transition={{ duration: 0.45, ease: "easeIn" }}
                            onAnimationComplete={() => {
                                setDisplayValue(padded);
                                setFlapValue(null);
                            }}
                            style={{
                                transformOrigin: "top",
                                transformStyle: "preserve-3d",
                                backfaceVisibility: "hidden",
                            }}
                            className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden rounded-b-xl bg-zinc-700 z-20"
                        >
                            <div className="absolute bottom-0 left-0 right-0 h-[200%] flex items-center justify-center">
                                <span className="text-6xl md:text-8xl font-bold text-white select-none">
                                    {flapValue}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* center divider line */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-black/50 z-30" />
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-600 z-30" />
                <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rounded-full bg-zinc-600 z-30" />
            </div>

            {/* red label bar */}
            <div className="mt-0 w-full bg-red-600 text-white text-xs md:text-base font-bold tracking-widest py-2 md:py-2.5 rounded-b-md text-center -mt-1">
                {label}
            </div>
        </div>
    );
}

export default function CountdownTimer() {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        setTimeLeft(getTimeLeft(TARGET_DATE)); // real value, computed client-side only
        const interval = setInterval(() => {
            setTimeLeft(getTimeLeft(TARGET_DATE));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex gap-6 md:gap-10 justify-center flex-wrap w-full">
            <FlipUnit value={timeLeft.days} label="DAYS" />
            <FlipUnit value={timeLeft.hours} label="HOURS" />
            <FlipUnit value={timeLeft.minutes} label="MINUTES" />
            <FlipUnit value={timeLeft.seconds} label="SECONDS" />
        </div>
    );
}