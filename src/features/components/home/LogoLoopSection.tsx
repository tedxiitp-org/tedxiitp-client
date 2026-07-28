"use client";

import LogoGrid from "@/src/components/block/LogoGrid";
import LogoLoop from "../../../components/block/LogoLoop";
import Image from "next/image";

const expeditionPatrons = [
  { image: "/SponsorsLogo.svg", alt: "Sponsor 1" },
  { image: "/SponsorsLogo.svg", alt: "Sponsor 2" },
  { image: "/SponsorsLogo.svg", alt: "Sponsor 3" },
  { image: "/SponsorsLogo.svg", alt: "Sponsor 4" },
];

const legacyPatrons1=[
  { image: "/SponsorsLogo.svg", alt: "Sponsor 1" },
  { image: "/SponsorsLogo.svg", alt: "Sponsor 2" },
  { image: "/SponsorsLogo.svg", alt: "Sponsor 3" },
  { image: "/SponsorsLogo.svg", alt: "Sponsor 4" },
]
const legacyPatrons2=[
  { image: "/SponsorsLogo.svg", alt: "Sponsor 1" },
  { image: "/SponsorsLogo.svg", alt: "Sponsor 2" },
  { image: "/SponsorsLogo.svg", alt: "Sponsor 3" },
  { image: "/SponsorsLogo.svg", alt: "Sponsor 4" },
]

export default function SponsorsSection() {
  return (
    <div>
       <div className="flex text-center justify-center items-center">
            <h1 className="uppercase font-bebas text-5xl text-center">expedition Patrons</h1>
            <Image src="/expeditionLogo.svg" alt="expedition patrons" width={126} height={126}/>
        </div>
        <LogoGrid
        logos={expeditionPatrons}
        logoHeight={{ mobile: 80, tablet: 156, desktop: 180 }}
        gap={ { mobile: 10, tablet: 24, desktop: 32 }}
        scaleOnHover
        ariaLabel="Our sponsors"
        />
      
       <div className="flex text-center justify-center items-center mt-4 md:mt-6 lg:mt-8">
            <h1 className="uppercase font-bebas text-5xl text-center">legacy patrons</h1>
            <Image src="/legacyLogo.svg" alt="expedition patrons" width={126} height={126}/>
        </div>
        <br />
        <LogoLoop
        logos={legacyPatrons1}
        speed={80}
        direction="left"
        stripHeight={{ mobile: 80, tablet: 120, desktop: 160 }}
        logoHeight={{ mobile: 80, tablet: 156, desktop: 180 }}
        gap={{ mobile: 24, tablet: 32, desktop: 20 }}
        fadeOut
        fadeOutColor="#000000"
        scaleOnHover
        ariaLabel="Our sponsors"
        />
        <LogoLoop
        logos={legacyPatrons2}
        speed={80}
        direction="left"
        stripHeight={{ mobile: 80, tablet: 120, desktop: 160 }}
        logoHeight={{ mobile: 80, tablet: 156, desktop: 180 }}
        gap={{ mobile: 24, tablet: 32, desktop: 20 }}
        fadeOut
        fadeOutColor="#000000"
        scaleOnHover
        ariaLabel="Our sponsors"
        />
    </div>
  );
}