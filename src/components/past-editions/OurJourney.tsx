"use client";
import Link from "next/link";
import React, { useRef, useEffect, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Image from "next/image";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useRouter } from "next/navigation";
import { useJourneyStore } from "@/src/store/useJourneyStore";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const editions = [
    { id: 1, year: 2025, title: "Kaleidoscopic Interludes", description: `"Kaleidoscopic" evokes vibrant, ever-shifting patterns-glimpses of identity refracted through time and experience. "Interludes" suggests pauses in life's rhythm-transitional moments that carry quiet transformation."`, side: "right", image: "/images/ki_correct.png", island: "/island/island1.svg", islandClass: "-right-64 scale-100 rotate-[15deg]", dotClass: "left-[400px] top-1/2", href: "/kaleidoscopicInterludes" },
    { id: 2, year: 2024, title: "Veiled Veracity", description: `"Veiled Veracity" reminds us that even in confusion, hope leads us to clarity. It urges us to confront illusions and seek truth with courage. "Veiled" hints at hidden truths, while "Veracity" emphasizes honesty in our search for meaning`, side: "left", image: "/images/VV.png", island: "/island/island2.svg", islandClass: "-left-64 scale-90 -rotate-30 -top-10", dotClass: "left-[512px] top-1/2", href: "/veiledVeracity" },
    { id: 3, year: 2023, title: "Prisms of Perception", description: `Prisms of Perception" explores how our view of the world, like light through a prism, is shaped by various factors. It shows that by shifting perspective, we reveal new ideas and solutions, fostering innovation and understanding.`, side: "right", image: "/images/PoP.png", island: "/island/island3.svg", islandClass: "-right-48 scale-90 -rotate-192 -top-28", dotClass: "right-96 top-10", href: "/prismOfPerception" },
    { id: 4, year: 2022, title: "Infinite Affinities", description: `At TEDxIIT Patna, we believe dreams become reality together. Infinite Affinities celebrates unity, shared effort, and the humanity that connects us. Each of us has a role-to inspire a brighter future.`, side: "left", image: "/images/IA.png", island: "/island/island1.svg", islandClass: "-left-48 scale-100 rotate-96 -top-8", dotClass: "left-[448px] top-1/2", href: "/infiniteAffinities" },
    { id: 5, year: 2021, title: "Roar", description: `The 3rd Edition of TEDxIIT Patna, Roar - The Acoustic of Strength, celebrated resilience and inner power. When we overcome fear and take charge of our thoughts, we unlock the strength to face any challenge. Unleash your inner roar and join us on the path to a stronger self.`, side: "right", image: "/images/Ro.png", island: "/island/island1.svg", islandClass: "-right-64 scale-100 -rotate-0", dotClass: "right-[560px] top-1/2", href: "/roar" },
    { id: 6, year: 2019, title: "Metamorphosis", description: `The 2nd Edition of TEDxIIT Patna, Metamorphosis, embraced change as a constant force. It highlighted how transformation brings growth and how adapting is key. Experts explored its impact on technology, entertainment, and societal values.`, side: "left", image: "/images/MM.png", island: "/island/island2.svg", islandClass: "-left-60 scale-94 -rotate-34 -top-10", dotClass: "left-[580px] top-[270px]", href: "/metamorphosis" },
    { id: 7, year: 2016, title: "Shedding Off Feathers", description: `TEDxIIT Patna believes that building anything new is possible when we let go of the old. Just as birds shed their feathers, allowing the new ones to embrace, taking them afresh to infinite skies, bringing out change is an inevitable part of one's life to keep walking the course of life.`, side: "right", image: "/images/SoF.png", island: "/island/island3.svg", islandClass: "-right-56 scale-108 -rotate-12 -top-10", dotClass: "right-[626px] top-[160px]", href: "/shedding" },
];

export default function OurJourney() {
    const timelineRef = useRef<HTMLDivElement>(null);
    const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
    const segmentsRef = useRef<(SVGLineElement | null)[]>([]);
    const islandsRef = useRef<(HTMLDivElement | null)[]>([]);
    const boatRef = useRef<HTMLDivElement>(null);
    const boatInnerRef = useRef<HTMLDivElement>(null);
    const boatPathRef = useRef<SVGSVGElement>(null);
    const pathRef = useRef<SVGPathElement>(null);

    const overlayRef = useRef<HTMLDivElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
    const flyInTl = useRef<gsap.core.Timeline | null>(null);

    const router = useRouter();
    const rulerProgress = useJourneyStore((state) => state.rulerProgress);
    const resetJourney = useJourneyStore((state) => state.resetJourney);

    // Manual rotation state for 3D gallery
    const [rotationY, setRotationY] = useState(0);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const currentRot = useRef(0);
    useLayoutEffect(() => {
        resetJourney();
    }, [resetJourney]);
    useEffect(() => {
        // Smooth scroll setup
        const lenis = new Lenis({ duration: 2 });

        lenis.on('scroll', ScrollTrigger.update);

        function update(time: number) {
            lenis.raf(time * 1000);
        }

        gsap.ticker.add(update);
        gsap.ticker.lagSmoothing(0);

        if (!timelineRef.current) return;
        if (typeof window === "undefined") return;

        const isMobile = window.innerWidth < 768;

        if (isMobile) {
            // Mobile: fade up per row
            document.querySelectorAll(".edition-row").forEach(row => {
                gsap.fromTo(row,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0,
                        duration: 0.6,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: row,
                            start: "top 85%",
                            once: true,
                        }
                    }
                );
            });

            // Mobile: animate divider lines
            document.querySelectorAll(".mobile-divider").forEach(divider => {
                gsap.fromTo(divider,
                    { scaleY: 0, opacity: 0 },
                    {
                        scaleY: 1, opacity: 1,
                        duration: 0.4,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: divider,
                            start: "top 90%",
                            once: true,
                        }
                    }
                );
            });

        } else {
            // Desktop: hide all rows initially
            document.querySelectorAll(".edition-row").forEach(row => {
                gsap.set(row, { opacity: 0 });
            });

            // Desktop: show first dot and first row on load
            if (dotsRef.current[0]) gsap.set(dotsRef.current[0], { opacity: 1 });
            const firstRow = document.querySelector(".edition-row") as HTMLElement;
            if (firstRow) gsap.set(firstRow, { opacity: 1, y: 0 });

            // Desktop: checkpoint + boat
            setTimeout(() => {
                // Checkpoint animation
                editions.slice(0, -1).forEach((_, index) => {
                    const currentDot = dotsRef.current[index];
                    const nextDot = dotsRef.current[index + 1];
                    const segment = segmentsRef.current[index];
                    const nextEntry = document.querySelectorAll(".edition-row")[index + 1] as HTMLElement;
                    const nextIsland = islandsRef.current[index + 1];

                    if (!currentDot || !nextDot || !segment || !timelineRef.current) return;

                    const containerTop = timelineRef.current.getBoundingClientRect().top + window.scrollY;
                    const fromY = currentDot.getBoundingClientRect().top + window.scrollY - containerTop;
                    const toY = nextDot.getBoundingClientRect().top + window.scrollY - containerTop;

                    segment.setAttribute("y1", String(fromY));
                    segment.setAttribute("y2", String(fromY));

                    ScrollTrigger.create({
                        trigger: nextEntry,
                        start: "top 100%",
                        once: true,
                        preventOverlaps: true,
                        fastScrollEnd: true,
                        onEnter: () => {
                            const tl = gsap.timeline();
                            tl.to(segment, { attr: { y2: toY }, duration: 0.6, ease: "power4.out" })
                                .to(nextDot, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out" }, "-=0.1")
                                .fromTo(nextIsland, { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, "-=0.2")
                                .fromTo(nextEntry,
                                    { opacity: 0, y: 30 },
                                    { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.1"
                                );
                        }
                    });
                });

                // Boat Path Animation
                if (boatRef.current && pathRef.current && timelineRef.current) {
                    const containerTop = timelineRef.current.getBoundingClientRect().top + window.scrollY;

                    const dotPositions = dotsRef.current.map(dot => {
                        if (!dot) return { x: 0, y: 0 };
                        const rect = dot.getBoundingClientRect();
                        return {
                            x: rect.left + rect.width / 2 - timelineRef.current!.getBoundingClientRect().left,
                            y: rect.top + window.scrollY - containerTop + rect.height / 2,
                        };
                    });

                    let pathD = `M ${dotPositions[0].x} ${dotPositions[0].y}`;

                    const p0 = dotPositions[0];
                    const p1 = dotPositions[1];
                    const p2 = dotPositions[2];
                    const p3 = dotPositions[3];
                    const p4 = dotPositions[4];
                    const p5 = dotPositions[5];
                    const p6 = dotPositions[6];

                    const dy0 = p1.y - p0.y;
                    pathD += ` C ${p0.x - 400} ${p0.y + dy0 * 0.4}, ${p1.x + 100} ${p1.y - dy0 * 0.2}, ${p1.x} ${p1.y}`;

                    const dy1 = p2.y - p1.y;
                    pathD += ` C ${p1.x + 150} ${p1.y + dy1 * 0.3}, ${p2.x - 100} ${p2.y - dy1 * 0.2}, ${p2.x} ${p2.y}`;

                    const dy2 = p3.y - p2.y;
                    pathD += ` C ${p2.x - 600} ${p2.y + dy2 * 0.4}, ${p3.x + 150} ${p3.y - dy2 * 0.2}, ${p3.x} ${p3.y}`;

                    const dy3 = p4.y - p3.y;
                    pathD += ` C ${p3.x + 600} ${p3.y + dy3 * 0.3}, ${p4.x - 150} ${p4.y - dy3 * 0.2}, ${p4.x} ${p4.y}`;

                    const dy4 = p5.y - p4.y;
                    pathD += ` C ${p4.x - 100} ${p4.y + dy4 * 0.4}, ${p5.x + 100} ${p5.y - dy4 * 0.2}, ${p5.x} ${p5.y}`;

                    const dy5 = p6.y - p5.y;
                    pathD += ` C ${p5.x + 200} ${p5.y + dy5 * 0.3}, ${p6.x - 400} ${p6.y - dy5 * 0.2}, ${p6.x} ${p6.y}`;

                    pathRef.current.setAttribute("d", pathD);

                    const pathLength = pathRef.current.getTotalLength();
                    pathRef.current.style.strokeDasharray = String(pathLength);
                    pathRef.current.style.strokeDashoffset = String(pathLength);

                    gsap.to(pathRef.current, {
                        strokeDashoffset: 0,
                        ease: "none",
                        scrollTrigger: {
                            trigger: timelineRef.current,
                            start: "top center",
                            endTrigger: dotsRef.current[6],
                            end: "center center",
                            scrub: true,
                        }
                    });

                    gsap.set(boatRef.current, { opacity: 1 });

                    gsap.to(boatInnerRef.current, {
                        rotate: 5,
                        duration: 1.5,
                        ease: "sine.inOut",
                        yoyo: true,
                        repeat: -1,
                    });

                    gsap.to(boatRef.current, {
                        motionPath: {
                            path: "#boatPath",
                            align: "#boatPath",
                            autoRotate: false,
                            alignOrigin: [0.5, 0.5],
                        },
                        ease: "none",
                        scrollTrigger: {
                            trigger: timelineRef.current,
                            start: "top center",
                            endTrigger: dotsRef.current[6],
                            end: "center center",
                            scrub: true,
                        }
                    });
                }
            }, 200);
        }

        // Setup 3D Gallery Fly-In Timeline
        if (carouselRef.current && cardsRef.current.length > 0 && overlayRef.current) {
            flyInTl.current = gsap.timeline({ paused: true });

            const finalZ = isMobile ? 250 : 400;

            cardsRef.current.forEach((card, i) => {
                if (!card) return;
                const angle = (360 / editions.length) * i;

                // Final destination state
                gsap.set(card, {
                    "--card-rot": `${angle}deg`,
                    "--card-z": `${finalZ}px`,
                    "--card-x": "0px",
                    "--card-y": "0px",
                    "--card-scale": 1,
                    "--card-opacity": 1,
                });

                // Fly-in animation
                flyInTl.current?.from(card, {
                    "--card-z": "-1500px",
                    "--card-y": `${gsap.utils.random(-1000, 1000)}px`,
                    "--card-x": `${gsap.utils.random(-1000, 1000)}px`,
                    "--card-rot": `${angle + gsap.utils.random(-180, 180)}deg`,
                    "--card-opacity": 0,
                    "--card-scale": 0.1,
                    duration: 1,
                    ease: "power3.inOut"
                }, 0);
            });

            flyInTl.current.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0);
        }

        return () => {
            lenis.destroy();
            gsap.ticker.remove(update);
            ScrollTrigger.getAll().forEach(t => t.kill());
            gsap.globalTimeline.clear();
        };
    }, []);

    // Effect to toggle body overflow scroll lock
    useEffect(() => {
        if (rulerProgress > 0.02) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [rulerProgress]);

    const handlePointerDown = (e: React.PointerEvent) => {
        isDragging.current = true;
        startX.current = e.clientX;
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging.current) return;
        const diff = e.clientX - startX.current;
        setRotationY(currentRot.current + diff * 0.3);
    };

    const handlePointerUp = () => {
        isDragging.current = false;
        currentRot.current = rotationY;
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (rulerProgress >= 0.4) {
            setRotationY(prev => prev - e.deltaY * 0.1);
            currentRot.current = rotationY - e.deltaY * 0.1;
        }
    };

    // Calculate normalized progress (0 to 1) for the fly-in transition
    const t = Math.min(rulerProgress / 0.4, 1);
    const isOverlayActive = rulerProgress > 0.02;

    return (
        <>
            {/* 3D Gallery Overlay */}
            <div
                ref={overlayRef}
                className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center pt-10"
                style={{
                    opacity: t,
                    pointerEvents: rulerProgress >= 0.4 ? "auto" : "none",
                    display: isOverlayActive ? "flex" : "none"
                }}
            >
                {/* 3D Perspective Container — free of opacity and backdrop-filter to prevent 3D flattening */}
                <div
                    style={{
                        perspective: "2000px",
                        transformStyle: "preserve-3d",
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        touchAction: "none"
                    }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    onWheel={handleWheel}
                >
                    {/* 3D Carousel Rotator */}
                    <div
                        ref={carouselRef}
                        className="relative w-[240px] h-[340px] md:w-[300px] md:h-[420px]"
                        style={{
                            transformStyle: "preserve-3d",
                            transform: `rotateY(${rotationY}deg)`,
                            transition: isDragging.current ? "none" : "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                        }}
                    >
                        {editions.map((edition, i) => {
                            const angle = (360 / editions.length) * i;
                            const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
                            const finalZ = isMobile ? 250 : 400;

                            // Calculate transform parameters dynamically based on progress t
                            const cardZ = -1500 + (finalZ + 1500) * t;
                            const cardRot = angle - 180 * (1 - t);
                            const cardOpacity = t;
                            const cardScale = 0.1 + 0.9 * t;

                            return (
                                <div
                                    key={edition.id}
                                    ref={el => { cardsRef.current[i] = el; }}
                                    className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center rounded-2xl border-[2.5px] border-[#EB0028]/40 bg-black/80 backdrop-blur-md p-4 hover:border-[#EB0028] transition-colors cursor-pointer group shadow-lg"
                                    onClick={() => router.push(edition.href)}
                                    style={{
                                        transform: `rotateY(${cardRot}deg) translateZ(${cardZ}px) scale(${cardScale})`,
                                        opacity: cardOpacity,
                                    }}
                                >
                                    {/* Image container */}
                                    <div className="w-full flex-[1.5] rounded-xl mb-4 overflow-hidden border border-white/10 group-hover:border-[#EB0028]/50 transition-colors relative">
                                        <Image
                                            src={edition.image}
                                            alt={edition.title}
                                            fill
                                            sizes="(max-width: 768px) 240px, 300px"
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            priority={i === 0}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    </div>
                                    <div className="flex-[1] flex flex-col items-center w-full">
                                        <h2 className="text-[#F3E9DC] font-bebas text-2xl md:text-3xl uppercase text-center mb-1 leading-none drop-shadow-md">
                                            {edition.title}
                                        </h2>
                                        <span className="text-[#EB0028] font-space font-bold text-sm md:text-base mb-2">{edition.year}</span>
                                        <p className="text-white/70 text-[10px] md:text-xs text-center line-clamp-4 font-space px-2">
                                            {edition.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Hint Text */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 font-space text-xs tracking-widest pointer-events-none">
                    {rulerProgress >= 0.4 ? "DRAG TO ROTATE" : "KEEP SCROLLING RULER..."}
                </div>
            </div>

            {/* Original Boat Background */}
            <section
                className="relative w-full min-h-screen px-4 py-16 overflow-x-hidden"
                style={{
                    backgroundImage: `url('/images/bg1.png'), url('/images/bg2.png')`,
                    backgroundRepeat: 'repeat-y, repeat-y',
                    backgroundPosition: 'top, center',
                    backgroundSize: '100%, 100%',
                }}
            >
                <div className="absolute inset-0 bg-black/40 z-0" />

                <h1 className="relative z-10 mx-auto mb-16 md:mb-24 text-[45px] sm:text-[70px] md:text-[90px] lg:text-[110px] xl:text-[120px] font-bebas font-normal tracking-wide text-center text-[#F3E9DC] uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                    Past Editions
                </h1>

                <div ref={timelineRef} className="relative z-10 max-w-5xl mx-auto overflow-visible">
                    <svg
                        className="hidden absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none w-[2px]"
                        style={{ height: "100%" }}
                        overflow="visible"
                    >
                        {editions.slice(0, -1).map((_, index) => (
                            <line
                                key={index}
                                ref={el => { segmentsRef.current[index] = el; }}
                                x1="1" y1="0"
                                x2="1" y2="0"
                                stroke="rgba(255,255,255,1)"
                                strokeWidth="1.5"
                            />
                        ))}
                    </svg>

                    <svg
                        ref={boatPathRef}
                        className="hidden md:block absolute left-0 top-0 pointer-events-none w-full"
                        style={{ height: "100%" }}
                        overflow="visible"
                    >
                        <path
                            ref={pathRef}
                            id="boatPath"
                            fill="none"
                            stroke="rgba(255,255,255,1)"
                        />
                    </svg>

                    <div
                        ref={boatRef}
                        className="hidden md:block absolute z-20 pointer-events-none opacity-0"
                    >
                        <div ref={boatInnerRef}>
                            <Image
                                src="/sship.png"
                                alt="ship"
                                width={100}
                                height={100}
                                className="object-contain"
                            />
                        </div>
                    </div>

                    {editions.map((edition, index) => (
                        <div key={edition.id}>
                            <div className="edition-row relative flex flex-col md:flex-row items-center mb-0 md:mb-64 overflow-visible">
                                <div
                                    ref={el => { islandsRef.current[index] = el; }}
                                    className={`hidden md:block absolute -z-10 pointer-events-none ${edition.islandClass}`}
                                >
                                    <Image src={edition.island} alt="" width={800} height={800} className="opacity-60" />
                                </div>

                                <div className="journey-entry entry-left w-full md:w-1/2 md:pr-16 flex flex-col justify-center items-center md:items-start mb-4 md:mb-0 md:mt-16">
                                    {edition.side === "left" && (
                                        <Link href={edition.href} className="flex flex-col items-center md:items-start w-full cursor-pointer hover:opacity-80 transition-opacity">
                                            <Image src={edition.image} alt={edition.title} width={720} height={720} className="object-contain mb-0 w-full md:w-[320px]" priority />
                                            <div style={{ fontFamily: 'var(--font-space)' }}>
                                                <h2 className="text-white font-bold text-lg uppercase text-center md:text-left">{edition.title} ({edition.year})</h2>
                                                <p className="text-white/60 text-sm mt-2 text-center md:text-left">{edition.description}</p>
                                            </div>
                                        </Link>
                                    )}
                                </div>

                                <div
                                    ref={el => { dotsRef.current[index] = el; }}
                                    className={`hidden md:block absolute z-10 opacity-0 ${edition.dotClass}`}
                                >
                                    <Image src="/locateicon2.svg" alt="" width={80} height={80} className="object-contain" />
                                </div>

                                <div className="journey-entry entry-right w-full md:w-1/2 md:pl-16 flex flex-col justify-center items-center md:items-end md:mt-16">
                                    {edition.side === "right" && (
                                        <Link href={edition.href} className="flex flex-col items-center md:items-end w-full cursor-pointer hover:opacity-80 transition-opacity">
                                            <Image src={edition.image} alt={edition.title} width={720} height={720} className="object-contain mb-0 w-full md:w-[320px]" priority />
                                            <div style={{ fontFamily: 'var(--font-space)' }}>
                                                <h2 className="text-white font-bold text-lg uppercase text-center md:text-right">{edition.title} ({edition.year})</h2>
                                                <p className="text-white/60 text-sm mt-2 text-center md:text-right">{edition.description}</p>
                                            </div>
                                        </Link>
                                    )}
                                </div>
                            </div>
                            {index < editions.length - 1 && (
                                <div className="mobile-divider md:hidden w-px h-40 bg-white/30 mx-auto my-8" />
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}