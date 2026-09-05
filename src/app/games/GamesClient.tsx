"use client";

import { useRouter } from "next/navigation";
import GlobalLeaderboard from "../../components/GlobalLeaderboard";

const games = [
  {
    id: "mario",
    title: "Super Mario",
    description: "Beyond the known kingdom, adventure calls - jump into the unmapped.",
    thumbnail: "/mario-thumbnail.png",
    href: "/games/mario",
    active: true,
  },
  {
    id: "snake",
    title: "TEDx Snake",
    description: "Grow with every bite. Navigate the grid and climb the leaderboard.",
    thumbnail: "/figgi.jpg", // Drop an image in your public folder, or use an existing placeholder
    href: "/games/snakes",
    active: true,
  },
  {
    id: "game3",
    title: "Endless Sail",
    description: "Ready to explore the unexplored!!",
    thumbnail: "/surf.png",
    href: "/games/surf",
    active: true,
  },
  {
    id: "game4",
    title: "Coming Soon",
    description: "Stay tuned for updates.",
    thumbnail: "/placeholder-game.jpg",
    href: "#",
    active: false,
  },
];

export default function GamesClient() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-12 md:px-8">
      <h1 className="mb-4 text-center text-4xl font-bold tracking-wider text-white md:text-6xl">
        TED<span className="text-[0.75em] lowercase">x</span>
        <span className="text-red-600">IIT Patna</span> Games
      </h1>
      <p className="mb-8 max-w-2xl text-center text-gray-400">
        Somewhere past the edge of the known world, adventure awaits.
      </p>
      <div className="grid w-full max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {games.map((game) => (
          <button
            key={game.id}
            type="button"
            disabled={!game.active}
            onClick={() => router.push(game.href)}
            className="overflow-hidden rounded-xl border border-gray-800 bg-black/60 text-left transition hover:-translate-y-1 hover:border-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <img src={game.thumbnail} alt={game.title} className="aspect-video w-full object-cover" />
            <div className="p-5">
              <h2 className="mb-2 text-xl font-bold text-white">{game.title}</h2>
              <p className="text-sm text-gray-400">{game.description}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-12 w-full max-w-5xl">
        <GlobalLeaderboard />
      </div>
    </main>
  );
}