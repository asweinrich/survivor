import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log("Fetching contestants from Season 48..."); // Debug log

    // Fetch contestants ONLY from Season 48
    const contestants = await prisma.contestant.findMany({
      where: {
        season: 48, // Ensure your database schema includes a 'season' field
      }
    });

    if (!contestants || contestants.length === 0) {
      return NextResponse.json({ error: "No contestants found for Season 48" }, { status: 404 });
    }

    return NextResponse.json(contestants);
  } catch (error) {
    console.error("Error fetching contestants:", error);
    return NextResponse.json({ error: "Failed to fetch contestants" }, { status: 500 });
  }
}
