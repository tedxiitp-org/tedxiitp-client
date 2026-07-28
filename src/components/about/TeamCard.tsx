"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaLinkedinIn } from "react-icons/fa6";

interface TeamCardProps {
    name: string;
    img: string;
    role?: string;
    linkedin?: string;
    featured?: boolean;
}

export default function TeamCard({ name, img, role, linkedin, featured = false }: TeamCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="w-full"
        >
            <div
                className={`relative aspect-square rounded-2xl border-[2px] sm:border-[2.5px] border-[#EB0028] overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg shadow-red-600 bg-black group ${
                    featured
                        ? "h-[220px] sm:h-[320px] md:h-[400px] lg:h-[480px] xl:h-[500px]"
                        : "h-[140px] sm:h-[200px] md:h-[240px] lg:h-[260px] xl:h-[280px]"
                }`}
            >
                {/* Background texture matching about page */}
                <Image
                    src="/bg2.png"
                    alt="background"
                    fill
                    className="object-cover opacity-60 group-hover:opacity-75 transition-opacity duration-300"
                />

                <div className="absolute inset-0 bg-black/40" />

                {/* LinkedIn Profile Button */}
                <a
                    href={linkedin && linkedin !== "#" ? linkedin : "#"}
                    target={linkedin && linkedin !== "#" ? "_blank" : undefined}
                    rel={linkedin && linkedin !== "#" ? "noopener noreferrer" : undefined}
                    onClick={(e) => {
                        if (!linkedin || linkedin === "#") {
                            e.preventDefault();
                        }
                    }}
                    className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-30 size-7 sm:size-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-[#0077b5] hover:border-[#0077b5] hover:scale-110 transition-all duration-300"
                    title={linkedin && linkedin !== "#" ? `Connect with ${name} on LinkedIn` : "LinkedIn link coming soon"}
                    aria-label={`LinkedIn profile for ${name}`}
                >
                    <FaLinkedinIn className="size-3.5 sm:size-4" />
                </a>

                {/* Portrait Image */}
               // Change h-[78%] to h-full (or top-0 bottom-0)
<div className="absolute inset-0 z-20 flex justify-center w-full">
    <div className="relative w-full h-full">
        <Image
            src={img || "/pic.png"}
            alt={name}
            fill
            sizes="(max-width: 640px) 160px, (max-width: 768px) 240px, 300px"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
    </div>
</div>

                {/* Name & Role Typography matching exact site fonts */}
                <div
                    className={`absolute bottom-0.5 left-2 sm:left-3 z-30 flex flex-col select-none pointer-events-none max-w-[85%] ${
                        featured ? "left-3" : "left-2 sm:left-3"
                    }`}
                >
                    {role && (
                        <span
                            className={`text-white font-space font-light tracking-wide mb-0.5 ${
                                featured
                                    ? "text-[15px] sm:text-[20px] md:text-[25px] lg:text-[30px]"
                                    : "text-[10px] sm:text-[13px] md:text-[15px]"
                            }`}
                        >
                            {role}
                        </span>
                    )}

                    <h3
                        className={`text-white font-bebas tracking-wider uppercase leading-none drop-shadow-lg ${
                            featured
                                ? "text-[18px] sm:text-[40px] md:text-[50px] lg:text-[70px]"
                                : "text-[14px] sm:text-[20px] md:text-[25px] lg:text-[30px]"
                        }`}
                    >
                        {name}
                    </h3>
                </div>
            </div>
        </motion.div>
    );
}
