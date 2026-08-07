"use client";
import React, {
    useRef,
    useEffect,
    useState,
    useCallback,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaLinkedinIn, FaFacebookF, FaXTwitter } from "react-icons/fa6";
import { useJourneyStore } from "@/src/store/useJourneyStore";

const MAX_G = 9.8;
const ACTIVATE_THRESHOLD = 0.015;
const DEACTIVATE_THRESHOLD = 0.005;

interface BodyState {
    id: string;
    x: number;
    y: number;
    angle: number;
    width: number;
    height: number;
}

// ─── Tile content ─────────────────────────────────────────────────────────────
function TileContent({ id }: { id: string }) {
    switch (id) {
        case "logo":
            return <Image src="/logo png.svg" alt="TEDxIIT Patna" width={527} height={108} className="w-full h-full object-contain" />;
        case "follow-us":
            return <span className="font-['Inter'] text-lg sm:text-xl lg:text-2xl font-bold text-red-600">Follow us</span>;
        case "ig": return <FaInstagram className="text-xl lg:text-3xl text-black" />;
        case "li": return <FaLinkedinIn className="text-xl lg:text-3xl text-black" />;
        case "fb": return <FaFacebookF className="text-xl lg:text-3xl text-black" />;
        case "tw": return <FaXTwitter className="text-xl lg:text-3xl text-black" />;
        case "contact-us":
            return <span className="font-['Inter'] text-lg sm:text-xl lg:text-2xl font-bold text-white">Contact Us</span>;
        case "speaker-label":
            return <span className="font-['Inter'] text-[10px] sm:text-xs text-red-500 font-semibold uppercase tracking-wider mb-0.5">Speaker Queries</span>;
        case "speaker-email":
            return (
                <div className="flex items-center gap-2 text-white/90 font-['Inter'] text-xs sm:text-sm lg:text-lg font-normal group">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 transition-all duration-300 group-hover:scale-150 group-hover:bg-red-500 group-hover:shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    <Image src="/mail.svg" alt="mail" width={18} height={18} className="w-4 h-4 lg:w-5 lg:h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                    <span className="group-hover:text-red-500 transition-colors duration-300">curation.tedxiitpatna@iitp.ac.in</span>
                </div>
            );
        case "sponsor-label":
            return <span className="font-['Inter'] text-[10px] sm:text-xs text-red-500 font-semibold uppercase tracking-wider mb-0.5">Sponsor Queries</span>;
        case "sponsor-email":
            return (
                <div className="flex items-center gap-2 text-white/90 font-['Inter'] text-xs sm:text-sm lg:text-lg font-normal group">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 transition-all duration-300 group-hover:scale-150 group-hover:bg-red-500 group-hover:shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    <Image src="/mail.svg" alt="mail" width={18} height={18} className="w-4 h-4 lg:w-5 lg:h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                    <span className="group-hover:text-red-500 transition-colors duration-300">sponsorship.tedxiitpatna@iitp.ac.in</span>
                </div>
            );
        case "quick-links":
            return <span className="font-['Inter'] text-lg sm:text-xl lg:text-2xl font-bold text-red-600">Quick Links</span>;
        case "link-home":
            return (
                <div className="flex items-center gap-2 text-white font-['Inter'] text-sm sm:text-base lg:text-lg group">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 transition-all duration-300 group-hover:scale-150 group-hover:bg-red-500 group-hover:shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    <span className="text-white/90 group-hover:text-red-500 transition-colors duration-300">Home</span>
                </div>
            );
        case "link-about":
            return (
                <div className="flex items-center gap-2 text-white font-['Inter'] text-sm sm:text-base lg:text-lg group">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 transition-all duration-300 group-hover:scale-150 group-hover:bg-red-500 group-hover:shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    <span className="text-white/90 group-hover:text-red-500 transition-colors duration-300">About Us</span>
                </div>
            );
        case "link-speakers":
            return (
                <div className="flex items-center gap-2 text-white font-['Inter'] text-sm sm:text-base lg:text-lg group">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 transition-all duration-300 group-hover:scale-150 group-hover:bg-red-500 group-hover:shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    <span className="text-white/90 group-hover:text-red-500 transition-colors duration-300">Speakers</span>
                </div>
            );
        case "ted-website":
            return (
                <div className="flex items-center gap-1.5 text-white font-['Inter'] text-sm sm:text-base lg:text-lg">
                    <span>TED Website</span>
                </div>
            );
        case "terms":
            return (
                <div className="flex items-center gap-1.5 text-white font-['Inter'] text-sm sm:text-base lg:text-lg">
                    <span>Terms and Conditions</span>
                </div>
            );
        case "about-tedx":
            return (
                <div className="flex items-center gap-1.5 text-white font-['Inter'] text-sm sm:text-base lg:text-lg">
                    <span>About TEDx</span>
                </div>
            );
        case "refund":
            return (
                <div className="flex items-center gap-1.5 text-white font-['Inter'] text-sm sm:text-base lg:text-lg">
                    <span>Refund Policy</span>
                </div>
            );
        case "copyright": return <span className="font-['Inter'] text-[10px] sm:text-xs lg:text-sm font-normal text-white">© 2026 TEDxIIT Patna. All rights reserved.</span>;
        case "license": return <span className="font-['Inter'] text-[10px] sm:text-xs lg:text-sm font-medium text-white">*This Independent TEDx Event Is Operated Under License From TED.</span>;
        default: return null;
    }
}

// ─── Ghost layout (invisible, for measuring positions) ────────────────────────
function GhostLayout({ itemRefs }: { itemRefs: React.MutableRefObject<Map<string, HTMLElement>> }) {
    const setRef = (id: string) => (el: HTMLElement | null) => {
        if (el) itemRefs.current.set(id, el);
    };
    return (
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start px-6 sm:px-12 lg:px-16 py-8 lg:py-8 gap-8 lg:gap-8 w-full" aria-hidden>
            {/* Left Column */}
            <div className="flex flex-col gap-3 lg:gap-4 w-full lg:w-auto items-center lg:items-start text-center lg:text-left shrink-0">
                <div ref={setRef("logo")} className="w-56 sm:w-72 lg:w-[384px]">
                    <Image src="/logo png.svg" alt="TEDxIIT Patna" width={527} height={108} className="w-full h-auto object-contain" />
                </div>
                <div className="flex flex-col gap-2 lg:gap-3 mt-2 lg:mt-6 items-center lg:items-start">
                    <Link href={"https://www.ted.com/"} ref={setRef("ted-website")} className="w-fit"><span className="font-['Inter'] text-sm sm:text-base lg:text-lg text-white hover:text-red-500 transition-colors duration-300">TED Website</span></Link>
                    <Link href={"https://www.ted.com/participate/organize-a-local-tedx-event/before-you-start/tedx-rules"} ref={setRef("terms")} className="w-fit"><span className="font-['Inter'] text-sm sm:text-base lg:text-lg text-white hover:text-red-500 transition-colors duration-300">Terms and Conditions</span></Link>
                    <Link href={"https://www.ted.com/about/programs-initiatives/tedx-program"} ref={setRef("about-tedx")} className="w-fit"><span className="font-['Inter'] text-sm sm:text-base lg:text-lg text-white hover:text-red-500 transition-colors duration-300">About TEDx</span></Link>
                    <Link href={"/refund"} ref={setRef("refund")} className="w-fit"><span className="font-['Inter'] text-sm sm:text-base lg:text-lg text-white hover:text-red-500 transition-colors duration-300">Refund Policy</span></Link>
                </div>
            </div>

            {/* Divider 1 - Horizontal on Mobile/Tablet, Vertical on Desktop */}
            <div className="lg:hidden w-full max-w-md h-[1px] bg-gradient-to-r from-transparent via-red-800/40 to-transparent my-1" />
            <div className="hidden lg:block self-stretch w-[3px]" style={{ background: "repeating-linear-gradient(to bottom, rgba(153,27,27,0.5) 0px, rgba(153,27,27,0.5) 4px, transparent 8px, transparent 18px)" }} />

            {/* Middle Column */}
            <div className="flex flex-col items-center gap-3 lg:gap-4 w-full lg:w-auto -mt-1 shrink-0">
                <div ref={setRef("follow-us")}><span className="font-['Inter'] text-lg sm:text-xl lg:text-2xl font-bold text-red-600">Follow us</span></div>
                <div className="flex gap-4 lg:gap-6">
                    <Link href={"https://www.instagram.com/tedxiitpatna/"} ref={setRef("ig")} className="size-9 sm:size-10 bg-white rounded flex items-center justify-center text-black text-xl lg:text-3xl"><FaInstagram className="text-black" /></Link>
                    <Link href={"https://www.linkedin.com/company/tedxiitpatna/posts/?feedView=all"} ref={setRef("li")} className="size-9 sm:size-10 bg-white rounded flex items-center justify-center text-black text-xl lg:text-3xl"><FaLinkedinIn className="text-black" /></Link>
                    <Link href={"https://www.facebook.com/tedxiitpatna/"} ref={setRef("fb")} className="size-9 sm:size-10 bg-white rounded flex items-center justify-center text-black text-xl lg:text-3xl"><FaFacebookF className="text-black" /></Link>
                    <Link href={"https://x.com/TEDxIIT Patna"} ref={setRef("tw")} className="size-9 sm:size-10 bg-white rounded flex items-center justify-center text-black text-xl lg:text-3xl"><FaXTwitter className="text-black" /></Link>
                </div>
                <div className="w-full max-w-xs h-[1px] bg-red-800/30 my-1" />
                <div ref={setRef("contact-us")}><span className="font-['Inter'] text-lg sm:text-xl lg:text-2xl font-bold text-white">Contact Us</span></div>
                <div className="flex flex-col sm:flex-row lg:flex-col gap-6 sm:gap-8 lg:gap-4 items-center justify-center w-full">
                    <div className="flex flex-col items-center text-center">
                        <div ref={setRef("speaker-label")} className="mb-1"><span className="font-['Inter'] text-[10px] sm:text-xs text-red-500 font-semibold uppercase tracking-wider">General Queries</span></div>
                        <div ref={setRef("speaker-email")}>
                            <Link href={"mailto:tedxiitpatna@iitp.ac.in"} className="group flex items-center gap-2 text-white/90 font-['Inter'] text-xs sm:text-sm lg:text-lg font-normal transition-all duration-300 ease-out hover:translate-x-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 transition-all duration-300 group-hover:scale-150 group-hover:bg-red-500 group-hover:shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                <Image src="/mail.svg" alt="mail" width={18} height={18} className="w-4 h-4 lg:w-5 lg:h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                                <span className="group-hover:text-red-500 transition-colors duration-300">tedxiitpatna@iitp.ac.in</span>
                            </Link>
                        </div>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div ref={setRef("speaker-label")} className="mb-1"><span className="font-['Inter'] text-[10px] sm:text-xs text-red-500 font-semibold uppercase tracking-wider">Speaker Queries</span></div>
                        <div ref={setRef("speaker-email")}>
                            <Link href={"mailto:curation.tedxiitpatna@iitp.ac.in"} className="group flex items-center gap-2 text-white/90 font-['Inter'] text-xs sm:text-sm lg:text-lg font-normal transition-all duration-300 ease-out hover:translate-x-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 transition-all duration-300 group-hover:scale-150 group-hover:bg-red-500 group-hover:shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                <Image src="/mail.svg" alt="mail" width={18} height={18} className="w-4 h-4 lg:w-5 lg:h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                                <span className="group-hover:text-red-500 transition-colors duration-300">curation.tedxiitpatna@iitp.ac.in</span>
                            </Link>
                        </div>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div ref={setRef("sponsor-label")} className="mb-1"><span className="font-['Inter'] text-[10px] sm:text-xs text-red-500 font-semibold uppercase tracking-wider">Sponsor Queries</span></div>
                        <div ref={setRef("sponsor-email")}>
                            <Link href={"mailto:sponsorship.tedxiitpatna@iitp.ac.in"} className="group flex items-center gap-2 text-white/90 font-['Inter'] text-xs sm:text-sm lg:text-lg font-normal transition-all duration-300 ease-out hover:translate-x-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 transition-all duration-300 group-hover:scale-150 group-hover:bg-red-500 group-hover:shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                <Image src="/mail.svg" alt="mail" width={18} height={18} className="w-4 h-4 lg:w-5 lg:h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                                <span className="group-hover:text-red-500 transition-colors duration-300">sponsorship.tedxiitpatna@iitp.ac.in</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Divider 2 - Horizontal on Mobile/Tablet, Vertical on Desktop */}
            <div className="lg:hidden w-full max-w-md h-[1px] bg-gradient-to-r from-transparent via-red-800/40 to-transparent my-1" />
            <div className="hidden lg:block self-stretch w-[3px]" style={{ background: "repeating-linear-gradient(to bottom, rgba(153,27,27,0.5) 0px, rgba(153,27,27,0.5) 4px, transparent 8px, transparent 18px)" }} />

            {/* Right Column */}
            <div className="flex flex-col gap-2 w-full lg:w-auto items-center lg:items-start text-center lg:text-left shrink-0">
                <div ref={setRef("quick-links")} className="w-fit"><span className="font-['Inter'] text-lg sm:text-xl lg:text-2xl font-bold text-red-600">Quick Links</span></div>
                <Link href={"/"} ref={setRef("link-home")} className="w-fit mt-1 lg:mt-2 group flex items-center gap-2 transition-all duration-300 ease-out hover:translate-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 transition-all duration-300 group-hover:scale-150 group-hover:bg-red-500 group-hover:shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    <span className="font-['Inter'] text-sm sm:text-base lg:text-lg text-white/90 group-hover:text-red-500 transition-colors duration-300">Home</span>
                </Link>
                <Link href={"/about"} ref={setRef("link-about")} className="w-fit mt-1 lg:mt-2 group flex items-center gap-2 transition-all duration-300 ease-out hover:translate-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 transition-all duration-300 group-hover:scale-150 group-hover:bg-red-500 group-hover:shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    <span className="font-['Inter'] text-sm sm:text-base lg:text-lg text-white/90 group-hover:text-red-500 transition-colors duration-300">About Us</span>
                </Link>
                <Link href={"/speakers"} ref={setRef("link-speakers")} className="w-fit mt-1 lg:mt-2 group flex items-center gap-2 transition-all duration-300 ease-out hover:translate-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 transition-all duration-300 group-hover:scale-150 group-hover:bg-red-500 group-hover:shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    <span className="font-['Inter'] text-sm sm:text-base lg:text-lg text-white/90 group-hover:text-red-500 transition-colors duration-300">Speakers</span>
                </Link>
            </div>
        </div>
    );
}


// ─── Main component ───────────────────────────────────────────────────────────
export default function FooterGravityContent() {
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const licenseRef = useRef<HTMLDivElement>(null);
    const copyrightRef = useRef<HTMLDivElement>(null);

    const engineRef = useRef<any>(null);
    const MatterRef = useRef<any>(null);       // cached Matter module
    const rafRef = useRef<number | null>(null);
    const bodiesMapRef = useRef<Map<string, any>>(new Map());
    const origRectsRef = useRef<Map<string, DOMRect>>(new Map());

    // ── Interaction state ───────────────────────────────────────────────────
    const dragBodyRef = useRef<any>(null);
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    // Track last few pointer positions to compute throw velocity
    const pointerHistoryRef = useRef<{ x: number; y: number; t: number }[]>([]);

    const [bodyStates, setBodyStates] = useState<BodyState[]>([]);
    const [physicsActive, setPhysicsActive] = useState(false);
    const [returning, setReturning] = useState(false);
    const [dragId, setDragId] = useState<string | null>(null);
    const [activeHeight, setActiveHeight] = useState<number | null>(null);

    const rulerProgress = useJourneyStore((state) => state.rulerProgress);

    // ── Start physics ───────────────────────────────────────────────────────
    const startPhysics = useCallback(async () => {
        if (engineRef.current) return;
        const Matter = (await import("matter-js")).default;
        MatterRef.current = Matter;

        const container = containerRef.current;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const W = containerRect.width;
        const H = containerRect.height * 0.75; // reduce fall space by 25%
        setActiveHeight(H);

        const allRefs = new Map<string, HTMLDivElement>(itemRefs.current);
        if (licenseRef.current) allRefs.set("license", licenseRef.current);
        if (copyrightRef.current) allRefs.set("copyright", copyrightRef.current);

        const origRects = new Map<string, DOMRect>();
        allRefs.forEach((el, id) => {
            const rect = el.getBoundingClientRect();
            origRects.set(id, new DOMRect(
                rect.left - containerRect.left,
                rect.top - containerRect.top,
                rect.width,
                rect.height
            ));
        });
        origRectsRef.current = origRects;

        const engine = Matter.Engine.create({ gravity: { x: 0, y: rulerProgress * MAX_G } });
        engineRef.current = engine;

        const bodies: any[] = [];
        const bodiesMap = new Map<string, any>();

        origRects.forEach((rect, id) => {
            if (rect.width < 2 || rect.height < 2) return;
            const body = Matter.Bodies.rectangle(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                rect.width, rect.height,
                { restitution: 0.45, friction: 0.55, frictionAir: 0.016, density: 0.002, label: id }
            );
            bodies.push(body);
            bodiesMap.set(id, body);
        });
        bodiesMapRef.current = bodiesMap;

        const floor = Matter.Bodies.rectangle(W / 2, H + 25, W + 200, 50, { isStatic: true });
        const ceiling = Matter.Bodies.rectangle(W / 2, -25, W + 200, 50, { isStatic: true });
        const wallL = Matter.Bodies.rectangle(-25, H / 2, 50, H * 4, { isStatic: true });
        const wallR = Matter.Bodies.rectangle(W + 25, H / 2, 50, H * 4, { isStatic: true });
        Matter.Composite.add(engine.world, [...bodies, floor, ceiling, wallL, wallR]);

        // Random initial nudge
        bodies.forEach((b) => Matter.Body.applyForce(b, b.position, { x: (Math.random() - 0.5) * 0.005, y: 0 }));

        let lastT = performance.now();
        const loop = (t: number) => {
            const dt = Math.min(t - lastT, 33);
            lastT = t;
            engine.gravity.y = useJourneyStore.getState().rulerProgress * MAX_G;
            Matter.Engine.update(engine, dt);

            const states: BodyState[] = [];
            bodiesMap.forEach((body, id) => {
                const rect = origRects.get(id)!;
                states.push({ id, x: body.position.x - rect.width / 2, y: body.position.y - rect.height / 2, angle: body.angle, width: rect.width, height: rect.height });
            });
            setBodyStates(states);
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        setPhysicsActive(true);
        setReturning(false);
    }, [rulerProgress]);

    // ── Stop physics ────────────────────────────────────────────────────────
    const stopPhysics = useCallback(async () => {
        if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
        if (engineRef.current) {
            const Matter = (await import("matter-js")).default;
            Matter.Engine.clear(engineRef.current);
            engineRef.current = null;
        }
        bodiesMapRef.current.clear();
        dragBodyRef.current = null;
        setDragId(null);
        setReturning(true);
        setTimeout(() => { setPhysicsActive(false); setReturning(false); setBodyStates([]); setActiveHeight(null); }, 500);
    }, []);

    // ── Pointer interaction helpers ─────────────────────────────────────────
    const getContainerXY = useCallback((e: React.PointerEvent | PointerEvent) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return null;
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }, []);

    const findBodyAtPoint = useCallback((px: number, py: number) => {
        const Matter = MatterRef.current;
        const engine = engineRef.current;
        if (!Matter || !engine) return null;
        const allBodies = Matter.Composite.allBodies(engine.world).filter((b: any) => !b.isStatic);
        const direct = allBodies.find((b: any) => Matter.Vertices.contains(b.vertices, { x: px, y: py }));
        if (direct) return direct;
        // On touch/mobile, check within a 35px radius around the body bounds for easy grabbing
        return allBodies.find((b: any) => {
            const dx = b.position.x - px;
            const dy = b.position.y - py;
            const radius = Math.max(b.bounds.max.x - b.bounds.min.x, b.bounds.max.y - b.bounds.min.y) / 2 + 35;
            return (dx * dx + dy * dy) <= (radius * radius);
        }) ?? null;
    }, []);

    const handleOverlayPointerDown = useCallback((e: React.PointerEvent) => {
        if (!physicsActive) return;
        const pos = getContainerXY(e);
        if (!pos) return;
        const hit = findBodyAtPoint(pos.x, pos.y);
        if (!hit) return;

        dragBodyRef.current = hit;
        dragOffsetRef.current = { x: pos.x - hit.position.x, y: pos.y - hit.position.y };
        pointerHistoryRef.current = [{ x: pos.x, y: pos.y, t: performance.now() }];
        setDragId(hit.label);
        e.currentTarget.setPointerCapture(e.pointerId);
        // Temporarily kill velocity while grabbing
        MatterRef.current?.Body.setVelocity(hit, { x: 0, y: 0 });
    }, [physicsActive, getContainerXY, findBodyAtPoint]);

    const handleOverlayPointerMove = useCallback((e: React.PointerEvent) => {
        const body = dragBodyRef.current;
        const Matter = MatterRef.current;
        if (!body || !Matter) return;
        const pos = getContainerXY(e);
        if (!pos) return;

        const targetX = pos.x - dragOffsetRef.current.x;
        const targetY = pos.y - dragOffsetRef.current.y;

        // Smoothly pull toward cursor using velocity (more natural than teleport)
        Matter.Body.setVelocity(body, {
            x: (targetX - body.position.x) * 0.5,
            y: (targetY - body.position.y) * 0.5,
        });
        Matter.Body.setPosition(body, { x: targetX, y: targetY });

        // Track last 5 positions for throw velocity
        const history = pointerHistoryRef.current;
        history.push({ x: pos.x, y: pos.y, t: performance.now() });
        if (history.length > 5) history.shift();
    }, [getContainerXY]);

    const handleOverlayPointerUp = useCallback(() => {
        const body = dragBodyRef.current;
        const Matter = MatterRef.current;
        if (!body || !Matter) return;

        // Calculate throw velocity from pointer history
        const history = pointerHistoryRef.current;
        if (history.length >= 2) {
            const oldest = history[0];
            const newest = history[history.length - 1];
            const dt = Math.max(newest.t - oldest.t, 1);
            const vx = ((newest.x - oldest.x) / dt) * 16; // scale to feel snappy
            const vy = ((newest.y - oldest.y) / dt) * 16;
            Matter.Body.setVelocity(body, { x: vx, y: vy });
        }

        dragBodyRef.current = null;
        pointerHistoryRef.current = [];
        setDragId(null);
    }, []);

    // Single-click blast: apply a strong random impulse to any clicked body
    const handleOverlayClick = useCallback((e: React.MouseEvent) => {
        if (dragId) return; // was a drag, not a click
        const Matter = MatterRef.current;
        const engine = engineRef.current;
        if (!Matter || !engine) return;
        const pos = getContainerXY(e as unknown as React.PointerEvent);
        if (!pos) return;
        const hit = findBodyAtPoint(pos.x, pos.y);
        if (!hit) return;
        // Random explosive kick
        const angle = Math.random() * Math.PI * 2;
        const force = 0.08 + Math.random() * 0.06;
        Matter.Body.applyForce(hit, hit.position, {
            x: Math.cos(angle) * force,
            y: Math.sin(angle) * force - 0.05, // bias upward
        });
        Matter.Body.setAngularVelocity(hit, (Math.random() - 0.5) * 0.4);
    }, [dragId, getContainerXY, findBodyAtPoint]);

    // ── Watch rulerProgress ─────────────────────────────────────────────────
    useEffect(() => {
        if (rulerProgress > ACTIVATE_THRESHOLD && !physicsActive && !returning) startPhysics();
        else if (rulerProgress <= DEACTIVATE_THRESHOLD && physicsActive && !returning) stopPhysics();
    }, [rulerProgress, physicsActive, returning, startPhysics, stopPhysics]);

    // ── Cleanup on unmount ──────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            if (engineRef.current) import("matter-js").then(({ default: M }) => M.Engine.clear(engineRef.current));
        };
    }, []);

    const gDisplay = (rulerProgress * MAX_G).toFixed(1);
    const showHUD = rulerProgress > 0.005;

    return (
        <div ref={containerRef} className="relative w-full overflow-hidden transition-[height] duration-500 ease-out" style={{ height: activeHeight ? `${activeHeight}px` : undefined }}>

            {/* ── Ghost layout — invisible when physics active, used for measurement ── */}
            <div className="transition-opacity duration-500" style={{ opacity: physicsActive ? 0 : 1, pointerEvents: physicsActive ? "none" : "auto" }}>
                <GhostLayout itemRefs={itemRefs} />
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left px-6 sm:px-12 lg:px-16 py-4 border-t border-white/10 text-white">
                    <div ref={licenseRef}><p className="font-['Inter'] text-[10px] sm:text-xs lg:text-sm font-medium">*This Independent TEDx Event Is Operated Under License From TED.</p></div>
                    <div ref={copyrightRef}><p className="font-['Inter'] text-[10px] sm:text-xs lg:text-sm font-normal">© 2026 TEDxIIT Patna. All rights reserved.</p></div>
                </div>
            </div>

            {/* ── Interactive physics overlay ── */}
            {physicsActive && (
                <>
                    {/* Transparent hit-area for pointer events */}
                    <div
                        className="absolute inset-0 z-[60]"
                        style={{ cursor: dragId ? "grabbing" : "grab", touchAction: "none" }}
                        onPointerDown={handleOverlayPointerDown}
                        onPointerMove={handleOverlayPointerMove}
                        onPointerUp={handleOverlayPointerUp}
                        onPointerLeave={handleOverlayPointerUp}
                        onClick={handleOverlayClick}
                    />

                    {/* Tile overlays — positioned by Matter.js bodies */}
                    {bodyStates.map((s) => {
                        const isIcon = ["ig", "li", "fb", "tw"].includes(s.id);
                        const isLogo = s.id === "logo";
                        const isDragged = s.id === dragId;
                        return (
                            <div
                                key={s.id}
                                className="absolute flex items-center justify-center transition-opacity duration-300"
                                style={{
                                    left: s.x, top: s.y, width: s.width, height: s.height,
                                    transform: `rotate(${s.angle}rad)`,
                                    transformOrigin: "center center",
                                    willChange: "transform",
                                    opacity: returning ? 0 : 1,
                                    background: isLogo ? "transparent" : isIcon ? "white" : "rgba(10,10,10,0.75)",
                                    borderRadius: isIcon ? 6 : 4,
                                    backdropFilter: isLogo ? "none" : "blur(4px)",
                                    boxShadow: isDragged
                                        ? "0 0 0 2px rgba(220,38,38,0.8), 0 8px 32px rgba(0,0,0,0.5)"
                                        : "0 2px 12px rgba(0,0,0,0.4)",
                                    border: isDragged ? "1px solid rgba(220,38,38,0.5)" : "1px solid rgba(255,255,255,0.06)",
                                    zIndex: isDragged ? 70 : 50,
                                    pointerEvents: "none", // hit-area overlay handles events
                                    padding: "2px 6px",
                                    boxSizing: "border-box",
                                    transition: "box-shadow 0.15s ease, border 0.15s ease",
                                }}
                            >
                                <TileContent id={s.id} />
                            </div>
                        );
                    })}
                </>
            )}

            {/* ── Gravity HUD ── */}
            <div
                className="fixed bottom-14 right-4 md:right-8 z-[200] pointer-events-none select-none transition-all duration-300"
                style={{ opacity: showHUD ? 1 : 0, transform: showHUD ? "scale(1) translateY(0)" : "scale(0.75) translateY(12px)" }}
            >
                <div className="relative rounded-xl border border-red-700/50 bg-black/85 backdrop-blur-md px-3 py-2 md:px-4 md:py-3 flex flex-col items-center gap-0.5 shadow-xl shadow-red-900/25 min-w-[96px] md:min-w-[116px]">
                    <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.018) 3px, rgba(255,255,255,0.018) 4px)" }} />
                    <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-red-500 font-semibold font-mono z-10">Gravity</span>
                    <span className="text-xl md:text-[28px] font-mono font-black text-white leading-none tabular-nums z-10">{gDisplay}</span>
                    <span className="text-[9px] md:text-[10px] text-red-400/80 font-mono tracking-widest z-10">m/s²</span>
                    <div className="w-full h-[3px] bg-red-900/30 rounded-full mt-1.5 overflow-hidden z-10">
                        <div className="h-full rounded-full transition-[width] duration-75" style={{ width: `${rulerProgress * 100}%`, background: "linear-gradient(90deg, #dc2626, #f87171)" }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
