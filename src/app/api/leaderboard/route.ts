import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET /api/leaderboard?game=snakes (Fetches Top 10)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const game = searchParams.get("game") || "snakes";

    const client = await clientPromise;
    const db = client.db("tedx_games");
    const scores = db.collection("scores");

    const topScores = await scores
      .find({ game })
      .sort({ score: -1, createdAt: 1 })
      .limit(10)
      .toArray();

    return NextResponse.json({
      data: topScores.map((s) => ({
        id: s._id.toString(),
        username: s.username,
        score: s.score,
        game: s.game,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/leaderboard (Saves or updates high score)
export async function POST(req: Request) {
  try {
    const { userId, username, game, score } = await req.json();

    if (!username || typeof score !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("tedx_games");
    const scores = db.collection("scores");

    // Only update if the new score is higher than their past score
    const existing = await scores.findOne({ username, game: game || "snakes" });

    if (!existing) {
      await scores.insertOne({
        userId,
        username,
        game: game || "snakes",
        score,
        createdAt: new Date(),
      });
    } else if (score > existing.score) {
      await scores.updateOne(
        { _id: existing._id },
        { $set: { score, updatedAt: new Date() } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}