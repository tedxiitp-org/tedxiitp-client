"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/src/components/ui/dialog";
import { ArrowRight, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const LAST_VISIT_KEY = "tedx_last_visit";
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeL1GKR58T-Amp8m1HBQcMEvyA-FsAFRA2-ZY0Zv70EmvV_jw/viewform";

export default function UpdateDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
      const now = Date.now();

      if (!lastVisit || now - Number(lastVisit) >= TWO_DAYS_MS) {
        const timer = setTimeout(() => setOpen(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable (SSR / privacy mode)
    }
  }, []);

  function handleClose(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) {
      try {
        localStorage.setItem(LAST_VISIT_KEY, String(Date.now()));
      } catch {
        // ignore
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-xl overflow-hidden border-red-600/30 bg-[#0e0e0e] p-0 text-white sm:max-w-4xl"
        showCloseButton={false}
      >
        {/* Close Button */}
        <DialogClose
          onClick={() => handleClose(false)}
          className="absolute right-4 top-4 z-50 rounded-full bg-white/5 p-1.5 text-zinc-400 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white focus:outline-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        {/* Glow effect */}
        <div className="pointer-events-none absolute -top-16 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-red-600/20 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 md:items-stretch">
          {/* Left Section: Full stretch cover to eliminate all surrounding black background */}
          <div className="relative min-h-[300px] w-full bg-white md:min-h-full">
            <Image
              src="/T Shirt Both side copy.png"
              alt="Official Merchandise"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-fill"
              priority
            />
          </div>

          {/* Right Section: Details & Action */}
          <div className="flex flex-col justify-between p-6 sm:p-8">
            <div>
              <DialogHeader className="p-0 text-left">
                <DialogTitle className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Exclusive Merch Drop
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Grab the official edition t-shirts and exclusive merchandise before stocks run out.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-3.5">
                <p className="text-xs font-medium text-red-200">
                  ⚡ Early bird live now. Fill the form to reserve yours.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href={FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleClose(false)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 hover:shadow-red-600/30 active:scale-[0.99]"
              >
                <span>Buy Merchandise</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}