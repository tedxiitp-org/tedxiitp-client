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
import { ArrowRight, X, Sparkles, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const LAST_VISIT_KEY = "tedx_last_visit_tickets";
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
          {/* Left Section: Ticket Poster */}
          <div className="relative min-h-[340px] w-full bg-black md:min-h-full">
            <Image
              src="/WhatsApp Image 2026-09-02 at 11.44.57.jpeg" // Replace with your image filename
              alt="TEDxIITPatna Terra Incognita Tickets"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-2"
              priority
            />
          </div>

          {/* Right Section: Details & Action */}
          <div className="flex flex-col justify-between p-6 sm:p-8">
            <div>
              <DialogHeader className="p-0 text-left">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-red-400">
                    Passes Live
                  </span>
                </div>
                <DialogTitle className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Tickets Are Out!
                </DialogTitle>
                <DialogDescription className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                  Join us at <span className="font-semibold text-white">Terra Incognita</span> on 13th Sept in the Auditorium. Passes are strictly limited.
                </DialogDescription>
              </DialogHeader>

              {/* Pricing breakdown */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2">
                  <p className="text-[11px] uppercase tracking-wide text-zinc-400">Session 1</p>
                  <p className="mt-0.5 text-base font-bold text-white">₹149</p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2">
                  <p className="text-[11px] uppercase tracking-wide text-zinc-400">Session 2</p>
                  <p className="mt-0.5 text-base font-bold text-white">₹129</p>
                </div>
                <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-2">
                  <p className="text-[11px] uppercase tracking-wide text-red-400">Combined</p>
                  <p className="mt-0.5 text-base font-bold text-red-200">₹249</p>
                </div>
              </div>

              {/* Perks Note */}
              <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-xs leading-snug text-zinc-300">
                  <span className="font-semibold text-white">Goodie bag & refreshments</span> included with every ticket.
                </p>
              </div>

              <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-zinc-400">
                <Sparkles className="h-3 w-3 text-red-400" />
                Combo offers available in the registration form!
              </p>
            </div>

            <div className="mt-6">
              <Link
                href={"https://docs.google.com/forms/d/e/1FAIpQLSeYTcGSyTL_ZmfKIYUblmwIPLgHqRLXJufWVvGCPlgSq07o-g/viewform?usp=send_form"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleClose(false)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 hover:shadow-red-600/30 active:scale-[0.99]"
              >
                <span>Book Tickets Now</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}