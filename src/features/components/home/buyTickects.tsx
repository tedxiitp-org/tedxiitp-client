import Image from "next/image"
import { Bebas_Neue, Space_Grotesk, Inter } from "next/font/google"
import Link from "next/link"

export default function BuyTickets() {
    return (
        <div className="px-4 md:px-10 py-10">
            <h1 className="uppercase text-5xl md:text-7xl text-white text-center mb-8 font-bebas">
                buy tickets
            </h1>

            <div
                className="
            relative
            bg-black
            flex flex-col md:flex-row
            border border-[#B3031C] rounded-[20px]
            w-full max-w-4xl mx-auto
            min-h-[460px] md:h-[350px]
            overflow-visible
            shadow-[0_0_20px_rgba(179,3,28,0.25)]
            "
            >


                <div
                    className="
            absolute
            -bottom-1
            -left-[4px]
            w-8
            h-8
            bg-black
            border-r
            border-t
            border-[#B3031C]
            rounded-tr-full
            z-30
            "
                />

                {/* Right ticket notch */}
                <div
                    className="
            absolute
            -bottom-1
            -right-[1px]
            w-8
            h-8
            bg-black
            border-l
            border-t
            border-[#B3031C]
            rounded-tl-full
            z-30
            "
                />

                {/* Top left ticket notch */}
                <div
                    className="
            absolute
            -top-1
            -left-[1px]
            w-8
            h-8
            bg-black
            border-r
            border-b
            border-[#B3031C]
            rounded-br-full
            z-30
            "
                />

                {/* Top right ticket notch */}
                <div
                    className="
            absolute
            -top-1
            -right-[1px]
            w-8
            h-8
            bg-black
            border-l
            border-b
            border-[#B3031C]
            rounded-bl-full
            z-30
            "
                />


                <div className="flex items-center justify-center gap-3 py-6 md:py-0 md:w-20 shrink-0 border-b md:border-b-0 md:border-r border-dashed border-white/40">
                    <div className="flex items-center justify-center gap-6 md:gap-10 md:[writing-mode:vertical-rl] md:rotate-180 md:mb-20">
                        <h1 className="uppercase tracking-widest text-xl md:text-2xl whitespace-nowrap text-[#FF0000] font-bebas">
                            EXP-2026-010

                        </h1>

                        <Image
                            src="/buyTickects1.svg"
                            alt="logo"
                            width={72}
                            height={72}
                            className="w-10 h-10 md:w-16 md:h-16"
                        />
                    </div>
                </div>

                <div className="relative flex-1 overflow-hidden border-t md:border-t-0 md:border-l-2 border-dashed border-white/40">
                    <Image
                        src="/buyTickectsBg.svg"
                        alt="bg"
                        fill
                        className="object-cover object-bottom pointer-events-none scale-175 translate-y-12 md:translate-y-20"
                    />
                    <div className="relative z-10 flex flex-col h-full px-6 py-8 gap-2">
                        <div
                            className="flex items-center justify-center"
                            style={{ width: "clamp(180px, 20vw, 384px)" }}
                        >
                            <Image
                                src="/logo png.svg"
                                alt="TEDxIIT Patna"
                                width={527}
                                height={108}
                                className="w-full h-auto"
                                style={{ height: "auto" }}
                            />
                        </div>
                        <h1 className="uppercase text-3xl md:text-4xl text-white font-bebas">
                            expedition access pass
                        </h1>
                        <h2 className="text-red-500 italic text-lg font-space">
                            Ideas Worth Spreading.
                        </h2>

                        <div className="mt-8 md:mt-16 text-center">
                            <h1 className="uppercase text-base md:text-2xl tracking-widest text-white font-bebas">
                                THEME : TERRA INCOGNITA
                            </h1>
                            <p className="text-md md:text-lg tracking-[0.3em] text-gray-400 mt-2 font-bebas">
                                DATE | TIME | VENUE
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-2 md:gap-3 px-6 md:px-10 py-6 md:py-0 md:w-72 shrink-0 text-center border-t md:border-t-0 md:border-l-2 border-dashed border-white/40">
                    <h2 className="uppercase tracking-widest text-sm md:text-lg text-gray-300 font-bebas">
                        Ticket price
                    </h2>
                    <span className="text-4xl md:text-6xl text-white font-['Bebas_Neue']">
                        ₹499
                    </span>
                    <div className="text-[16px] md:text-md tracking-widest text-gray-400 mb-2 md:mb-4 font-bebas">
                        <p>GENERAL ACCESS</p>
                        <p>LIMITED PASSES</p>
                    </div>
                    <Link href="/cart" className="
                mt-4
                md:mt-8
                px-4
                py-3
                rounded-full
                border
                border-[#B3031C]
                text-[#D7D0C5]
                text-lg
                font-large
                tracking-[0.5px]
                transition-all
                duration-300
                hover:bg-red-700/40
                font-inter
                cursor-pointer
                ">Get Tickects</Link>

                </div>

            </div>
        </div>
    )
}