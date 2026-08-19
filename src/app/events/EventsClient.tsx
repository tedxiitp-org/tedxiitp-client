"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, MessageSquareHeart } from "lucide-react";
import CountdownTimer from "./countDownTimer";

interface EventItem {
  title: string;
  dateTime: string;
  location: string;
  description: string;
  image?: string; // optional — falls back to placeholder block if omitted
}

const events: EventItem[] = [
  {
    title: "Orientation",
    dateTime: "TBD",
    location: "TBD",
    description:
      "More details about this upcoming event will be announced soon. Stay tuned for exciting speakers and ideas!",
  },
];

export default function EventsClient() {
  return (
    <main
      className="min-h-screen text-white pb-16 bg-black bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bg1.png')" }}
    >
      {/* Hero Section */}
      <section className="relative px-6 md:px-16 py-10 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold font-['Bebas_Neue'] tracking-wider mb-6">
            <span className="text-red-600">TED<sup className="text-3xl md:text-5xl -top-3 md:-top-4 relative">x</sup></span><span>IIT Patna</span> Events
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl">
            Explore the journey of TEDx from thought-provoking pre-events to the main stage, and revisit the conversations that continue to inspire long after the applause fades.
          </p>
        </motion.div>
      </section>

      {/* Community Wall CTA */}
      <section className="px-6 md:px-16 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-red-900/40 to-black border border-red-800/50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <MessageSquareHeart size={200} />
          </div>
          <div className="z-10 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-['Bebas_Neue'] tracking-wide">
              The Community Wall
            </h2>
            <p className="text-gray-300 mb-6 text-lg">
              Share your thoughts, read what others are excited about, and leave your mark on our digital sticky note board. Be a part of the conversation!
            </p>
            <Link href="/events/wall">
              <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-full flex items-center gap-2 transition-all hover:gap-4">
                Visit the Wall <ArrowRight size={20} />
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Upcoming Events */}
      <section className="px-6 md:px-16 py-12">
        <div className="flex items-center gap-3 mb-10">
          <Calendar className="text-red-500" size={32} />
          <h2 className="text-4xl font-bold font-['Bebas_Neue'] tracking-wide">Upcoming Events</h2>
        </div>

        {events.length === 0 ? (
          <p className="text-gray-500 text-lg">No upcoming events right now — check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, i) => (
              <div
                key={i}
                className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-900 transition-colors"
              >
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover rounded-xl mb-6"
                  />
                ) : (
                  <div className="w-full h-48 bg-zinc-800 rounded-xl mb-6 animate-pulse" />
                )}
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-sm text-gray-400 mb-4">
                  {event.dateTime} • {event.location}
                </p>
                <p className="text-gray-300 text-sm line-clamp-3">{event.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="px-6 md:px-16 py-16 border-t border-zinc-900">
        <div className="flex items-center gap-3 mb-10">
          <h2 className="text-4xl font-bold font-['Bebas_Neue'] tracking-wide">
            <span className="text-5xl text-red-600">TED<sup className="text-3xl -top-3 relative">x</sup></span><span className="text-5xl">IIT Patna</span>
            <span className="block text-6xl md:text-8xl">Coming Soon...</span>
          </h2>
        </div>
        <CountdownTimer />
      </section>
    </main>
  );
}
