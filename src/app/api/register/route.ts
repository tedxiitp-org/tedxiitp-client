import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { username } = await req.json();
    const cleanUsername = username?.trim();

    if (!cleanUsername) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("tedx_games");
    const users = db.collection("users");

    // Look for existing user or create a new entry
    let user = await users.findOne({ username: cleanUsername });

    if (!user) {
      const result = await users.insertOne({
        username: cleanUsername,
        createdAt: new Date(),
      });
      user = { _id: result.insertedId, username: cleanUsername };
    }

    return NextResponse.json({
      data: {
        userId: user._id.toString(),
        username: user.username,
      },
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to register user" },
      { status: 500 }
    );
  }
}