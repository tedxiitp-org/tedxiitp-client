"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { FaInstagram, FaLinkedinIn, FaFacebookF, FaXTwitter } from "react-icons/fa6";

const navLinks = [
    { label: "Home", href: "/" },
    { label: "Events", href: "/events" },
    { label: "Pre-events", href: "/funfair" },
    { label: "Past Editions", href: "/past-editions" },
    { label: "Sponsors", href: "/sponsors" },
    { label: "About Us", href: "/about" },
    { label: "Speakers", href: "/speakers" },
];

const socialLinks = [
    { icon: FaInstagram, href: "https://www.instagram.com/tedxiitpatna" },
    { icon: FaLinkedinIn, href: "https://www.linkedin.com/company/tedxiitpatna" },
    { icon: FaFacebookF, href: "https://www.facebook.com/tedxiitpatna" },
    { icon: FaXTwitter, href: "https://twitter.com/tedxiitpatna" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [hovered, setHovered] = useState<string | null>(null);
    const [lastHovered, setLastHovered] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > window.innerHeight);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Auto-close drawer on navigation
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // Lock body scroll when drawer is open
    useEffect(() => {
        if (open) {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            const scrollY = window.scrollY;
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = "0";
            document.body.style.right = "0";
            document.body.style.overflow = "hidden";
            if (window.innerWidth >= 768 && scrollbarWidth > 0 && scrollbarWidth < 100) { 
                document.body.style.paddingRight = `${scrollbarWidth}px`;
            }
        } else {
            const scrollY = parseInt(document.body.style.top || "0") * -1;
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
            window.scrollTo(0, scrollY);
        }
        return () => {
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
        };
    }, [open]);

    const lastHoveredIndex = lastHovered ? navLinks.findIndex(l => l.label === lastHovered) : -1;

    return (
        <>
            <header className={`sticky top-0 z-40 w-full h-16 md:h-20 flex items-center justify-between px-4 sm:px-6 md:px-8 py-2 md:py-3 overflow-hidden transition-all duration-500 ${open ? "bg-transparent" : scrolled ? "bg-black/40 backdrop-blur-md" : "bg-black"}`}>
                <div className="flex items-center h-full">
                    <Link href="/" className="flex items-center h-full">
                        <Image src="/logo png.svg" alt="TEDxIITPatna" width={527} height={108} className="h-full w-auto object-contain" style={{ width: "auto" }} priority />
                    </Link>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <button
                        onClick={() => setOpen(!open)}
                        className="relative z-[140] size-[36px] md:size-[45px] bg-gradient-to-b from-red-600 to-red-900 rounded-full flex flex-col items-center justify-center gap-[4px] md:gap-[5px] hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-red-600/30 cursor-pointer">
                        <span className={`w-[16px] md:w-5 h-[2px] bg-white rounded-full transition-all duration-300 ${open ? "translate-y-[6px] md:translate-y-[7px] rotate-45" : ""}`} />
                        <span className={`w-[16px] md:w-5 h-[2px] bg-white rounded-full transition-all duration-300 ${open ? "opacity-0" : ""}`} />
                        <span className={`w-[16px] md:w-5 h-[2px] bg-white rounded-full transition-all duration-300 ${open ? "-translate-y-[6px] md:-translate-y-[7px] -rotate-45" : ""}`} />
                    </button>
                </div>
            </header>

            <div
                className={`fixed inset-0 w-screen h-[100dvh] bg-black/95 backdrop-blur-md z-[115] flex px-6 md:px-16 pt-20 md:py-12 transition-all duration-500 ease-in-out ${open ? "opacity-100 translate-x-0 pointer-events-auto visible" : "opacity-0 translate-x-full pointer-events-none invisible"}`}
                style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
                onClick={() => setOpen(false)}
            >
                {/* Desktop Left Info Column */}
                <div
                    className={`hidden md:flex flex-col justify-end gap-4 w-1/2 transition-all duration-700 ease-out transform ${open ? "translate-x-0 opacity-100 delay-150" : "-translate-x-8 opacity-0"}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Image src="/logo png.svg" alt="TEDxIITPatna" width={200} height={45} className="-ml-5" />
                    <div className="mt-8">
                        <p className="text-red-500 font-['Inter'] text-xl font-bold mb-1">Contact Us</p>
                        <Link href="mailto:tedx@iitp.ac.in" className="flex items-center gap-2 text-white font-['Inter'] text-sm hover:text-red-500 transition-colors">
                            ✉ tedx@iitp.ac.in
                        </Link>
                    </div>
                    <div>
                        <p className="text-red-500 font-['Inter'] text-xl font-bold mb-2">Follow us</p>
                        <div className="flex gap-4">
                            {socialLinks.map(({ icon: Icon, href }) => (
                                <Link key={href} href={href} target="_blank" rel="noopener noreferrer" className="text-white text-2xl hover:text-red-500 transition-colors">
                                    <Icon />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content Container (Right Side / Full Mobile) */}
                <div className="flex flex-col justify-between w-full md:w-1/2 h-full min-h-0 overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
                    
                    {/* Top Navigation Links */}
                    <div className="flex flex-col justify-start md:justify-center gap-0 shrink-0 py-2">
                        {navLinks.map(({ label, href }, index) => {
                            const distance = lastHoveredIndex >= 0 ? Math.abs(index - lastHoveredIndex) : index;
                            const undimDelay = !hovered ? distance * 40 : 0;
                            const opacity = !open ? 0 : (hovered && hovered !== label) ? 0.2 : 1;

                            return (
                                <Link key={label} href={href}
                                    onClick={() => setOpen(false)} onMouseEnter={() => {
                                        setHovered(label); setLastHovered(label);
                                    }}
                                    onMouseLeave={() => setHovered(null)}
                                    style={{ transitionDelay: open && !hovered ? `${undimDelay}ms` : "0ms", opacity, }}
                                    className={`text-2xl sm:text-4xl lg:text-5xl font-normal font-['Bebas_Neue'] py-1 sm:py-2 md:py-3 border-b border-white/20 transition-all duration-500 block transform bg-clip-text text-transparent ${hovered === label ? "bg-gradient-to-b from-red-700 from-35% via-white via-50% to-red-400 to-65%" : "bg-gradient-to-b from-white to-white"} ${open ? "translate-y-0" : "translate-y-8"} ${hovered === label ? "translate-x-4" : "translate-x-0"}`} >
                                    {label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Bottom Mobile Footer */}
                    <div
                        className={`md:hidden mt-auto flex flex-col gap-3 shrink-0 pt-4 border-t border-white/10 transition-all duration-700 ease-out transform ${open ? "translate-y-0 opacity-100 delay-300" : "translate-y-4 opacity-0"}`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-red-500 font-['Inter'] text-sm sm:text-base font-bold">Contact:</span>
                            <Link href="mailto:tedx@iitp.ac.in" className="flex items-center gap-1.5 text-white/90 font-['Inter'] text-sm sm:text-base hover:text-red-500 transition-colors">
                                ✉ tedx@iitp.ac.in
                            </Link>
                        </div>
                        <div className="flex items-center gap-3 flex-nowrap">
                            <p className="text-red-500 font-['Inter'] text-sm sm:text-base font-bold whitespace-nowrap">Follow us</p>
                            <div className="flex items-center gap-4 sm:gap-5">
                                {socialLinks.map(({ icon: Icon, href }) => (
                                    <Link key={href} href={href} target="_blank" rel="noopener noreferrer" className="text-white text-xl sm:text-2xl hover:text-red-500 transition-colors">
                                        <Icon />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}