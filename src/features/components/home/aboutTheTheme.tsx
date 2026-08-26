"use client";

import Image from "next/image";

export default function AboutTheTheme() {
  return (
    <section className="w-full py-12 lg:py-19 overflow-x-hidden">
      <div className="px-4 sm:px-8 lg:pl-16 lg:pr-0 text-center lg:text-left mx-auto">
        <h1
          className="
            font-bebas
            uppercase
            text-white
            text-5xl
            md:text-6xl
            lg:text-7xl
            leading-none
          "
        >
          About The Theme
        </h1>

        <div className="flex flex-col lg:flex-row mt-4">
          <div className="w-full lg:w-[45%] lg:pr-12 flex flex-col items-center lg:items-start">
            <div
              className="
                mt-8
                font-space
                text-[#D7D0C5]
                font-light
                text-[15px]
                md:text-[18px]
                xl:text-[22px]
                tracking-[0.64px]
                leading-[1.4]
                space-y-8
              "
            >
              <p>
                This year&apos;s theme,{" "}
                <span className="text-white">
                  &ldquo;Terra Incognita&rdquo;
                </span>
                , explores how civilization constantly redraws the boundaries
                of the acceptable, where ideas once seen as impossible or
                unimaginable gradually become part of ordinary reality.
              </p>

              <p>
                Like the blank spaces on ancient maps, the unknown exists
                beyond the limits of inherited imagination, waiting to be
                understood. Spanning science, technology, philosophy, art,
                and human behavior, Terra Incognita celebrates the curiosity
                and courage to question established norms and venture into
                unexplored ways of thinking.
              </p>
            </div>

            <button
              className="
                mt-8
                px-4
                py-3
                rounded-full
                border
                border-[#B3031C]
                text-[#D7D0C5]
                bg-[#B3031C]
                text-lg
                font-large
                tracking-[0.5px]
                transition-all
                duration-300
                hover:bg-red-700/40
                font-inter
                uppercase
              "
              onClick={() => {
                window.open(
                  "https://www.instagram.com/reels/DceHAwlSg6s/",
                  "_blank"
                );
              }}
            >
              theme video
            </button>
          </div>

          <div className="hidden lg:flex lg:w-[55%] justify-end">
            <div className="relative w-[800px] h-[500px]">
              <Image
                src="/rectangle.svg"
                alt="shape"
                fill
                className="object-contain filter blur-md z-0 pointer-events-none"
              />

              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="w-[99%] h-[99%] relative">
                  <Image
                    src="/rectangle.svg"
                    alt="inner-shape-black"
                    fill
                    className="object-contain"
                    style={{ filter: "brightness(0) saturate(100%)" }}
                  />
                </div>
              </div>

              <div
                className="absolute inset-0 z-20 overflow-hidden"
                style={{
                  WebkitMaskImage: "url('/rectangle.svg')",
                  WebkitMaskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskImage: "url('/rectangle.svg')",
                  maskSize: "contain",
                  maskRepeat: "no-repeat",
                  maskPosition: "center",
                }}
              >
                <Image
                  src="/aboutTheThemeBG.svg"
                  alt="about the theme"
                  fill
                  className="object-cover"
                />

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Image
                    src="/terraIncognitaLogo.svg"
                    alt="terra incognita"
                    width={300}
                    height={300}
                    className="w-48 sm:w-64 md:w-72 lg:w-[300px] h-auto object-contain z-30"
                    style={{ height: "auto" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}