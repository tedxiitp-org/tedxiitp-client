"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { submitScore } from "../../../lib/api";
import { useRouter } from "next/navigation";

export default function WaterTossPage() {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const router = useRouter();

    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const userId = localStorage.getItem("tedx_userid");

        if (!userId) {
            router.push("/games");
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (
                event.data?.type === "GAME_OVER" &&
                event.data.game === "water-toss"
            ) {
                const score = event.data.score;
                const userId = localStorage.getItem("tedx_userid");

                if (userId) {
                    try {
                        await submitScore('watertoss', userId, score);
                        console.log(`Water Toss score submitted: ${score}`);
                    } catch (error) {
                        console.error(
                            "Failed to submit Water Toss score:",
                            error
                        );
                    }
                } else {
                    console.error(
                        "Missing userId"
                    );
                }
            }

            if (
                event.data?.type === "EXIT_GAME" &&
                event.data.game === "water-toss"
            ) {
                router.push("/games");
            }
        };

        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, [router]);

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-start min-h-screen py-8 px-4">
            <div className="w-full max-w-5xl mb-6 flex items-center justify-between">
                <Link
                    href="/games"
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    ← Back to Games
                </Link>

                <h1 className="text-2xl font-bold text-white">
                    Water Toss
                </h1>

                <div />
            </div>

            <div className="w-full max-w-5xl bg-black border border-gray-800 rounded-xl overflow-hidden h-[500px] sm:h-[600px]">
                <iframe
                    ref={iframeRef}
                    src="/games/watertoss/index.html"
                    className="w-full h-full border-none"
                    title="Water Toss"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                />
            </div>
        </div>
    );
}