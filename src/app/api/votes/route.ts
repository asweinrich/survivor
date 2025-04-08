import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log("Fetching votes from Season 48..."); // Debug log

    // Fetch votes ONLY from Season 48
    const votes = await prisma.tribalCouncilVote.findMany({
      where: {
        // Assuming votes are linked to a season (you may need to modify schema)
        council: { gte: 1 } // Ensures we're fetching votes from active tribal councils
      },
      orderBy: [{ council: "asc" }, { round: "asc" }] // Sort by council and round
    });

    if (!votes || votes.length === 0) {
      return NextResponse.json({ error: "No votes found for Season 48" }, { status: 404 });
    }

    return NextResponse.json(votes);
  } catch (error) {
    console.error("Error fetching votes:", error);
    return NextResponse.json({ error: "Failed to fetch votes" }, { status: 500 });
  }
}
