"use client";

import Mist from "./Mist";
import Image from "next/image";
import HiddenTexts from "./HiddenTexts";


export default function ComingSoon() {
    return (
        <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#1a1712]">
            <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
                <Image
                    src="/bg1.png"
                    alt=""
                    fill
                    priority
                    className="object-cover"
                />
            </div>
            <HiddenTexts />
            {/* MIST LAYER — wipe-to-reveal, above bg, below note */}
            <div className="absolute inset-0 z-[5]">
                <Mist />
            </div>

            {/* ---------------------------------------------------------------
          PINNED NOTE  (hero)
      ---------------------------------------------------------------- */}
            <div className="relative z-10 w-[min(90vw,460px)] select-none">
                {/* the note image itself */}
                <Image
                    src="/pinpostt.png"
                    alt=""
                    width={460}
                    height={430}
                    priority
                    className="h-auto w-full drop-shadow-2xl"
                />

                {/* text sits inside the inner frame of the note.
            The frame is roughly centered but the note is tilted, so the
            two scraps get their own small opposing tilts. Percentages keep
            the text glued to the frame as the note scales. */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-[16%] pb-[10%]">
                    <h1
                        className="text-[#3a2c1e] font-bold tracking-tight"
                        style={{
                            transform: "rotate(-3deg)",
                            fontSize: "clamp(1.9rem, 6vw, 2.8rem)",

                            fontFamily: "'Bebas Neue', sans-serif",
                            letterSpacing: "0.02em",
                        }}
                    >
                        Coming Soon
                    </h1>

                    <p
                        className="mt-2 text-center text-[#5a4a37]"
                        style={{
                            transform: "rotate(2deg)",
                            fontSize: "clamp(0.75rem, 2.6vw, 0.95rem)",
                            maxWidth: "80%",
                        }}
                    >
                        Something is being charted. Check back soon.
                    </p>
                </div>
            </div>
        </main>
    );
}