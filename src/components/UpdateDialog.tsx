"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { ShoppingBag, CalendarDays, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

const LAST_VISIT_KEY = "tedx_last_visit";
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

interface Update {
  id: string;
  type: "merch" | "event";
  title: string;
  description: string;
  href: string;
  cta: string;
}

const updates: Update[] = [
  {
    id: "merch-live",
    type: "merch",
    title: "Exclusive Merch Drop!",
    description:
      "New TEDxIIT Patna merchandise is here — limited edition tees, hoodies, and more.",
    href: "/cart",
    cta: "Shop Now",
  },
  {
    id: "event-oct",
    type: "event",
    title: "Event on 12 Oct 2026",
    description:
      "Registrations are open! Secure your spot for TEDxIIT Patna's flagship event.",
    href: "/events",
    cta: "Register",
  },
];

export default function UpdateDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
      const now = Date.now();

      if (!lastVisit || now - Number(lastVisit) >= TWO_DAYS_MS) {
        // Small delay so the page loads first before the dialog pops in
        const timer = setTimeout(() => setOpen(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable (SSR / privacy mode) — silently skip
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

  const iconMap = {
    merch: ShoppingBag,
    event: CalendarDays,
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-md border-red-600/30 bg-[#0e0e0e] text-white sm:max-w-lg"
        showCloseButton
      >
        {/* Top decorative glow */}
        <div className="pointer-events-none absolute -top-16 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-red-600/20 blur-3xl" />

        <DialogHeader className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-600/20">
              <Sparkles className="h-4 w-4 text-red-500" />
            </span>
            <DialogTitle className="text-lg font-bold text-white sm:text-xl">
              What&rsquo;s New at TEDx
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-zinc-400">
            You&rsquo;ve been away — here&rsquo;s what you missed!
          </DialogDescription>
        </DialogHeader>

        {/* Update cards */}
        <div className="relative z-10 mt-2 flex flex-col gap-3">
          {updates.map((update) => {
            const Icon = iconMap[update.type];
            return (
              <div
                key={update.id}
                className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.03] p-4 transition-colors duration-200 hover:border-red-600/30 hover:bg-white/[0.06]"
              >
                {/* Accent bar */}
                <div className="absolute left-0 top-0 h-full w-[3px] rounded-l-xl bg-red-600 opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600/10">
                    <Icon className="h-4 w-4 text-red-500" />
                  </span>

                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">
                      {update.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                      {update.description}
                    </p>

                    <Link
                      href={update.href}
                      onClick={() => handleClose(false)}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-red-500"
                    >
                      {update.cta}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom subtle branding */}
        <p className="relative z-10 mt-1 text-center text-[10px] uppercase tracking-[0.25em] text-zinc-600">
          TEDxIIT Patna
        </p>
      </DialogContent>
    </Dialog>
  );
}
