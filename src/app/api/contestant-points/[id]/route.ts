import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import scoringCategories from '../../../scoring/values.json'; // Adjust the path to your values.json

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {

    const {id} = await params;
    const contestantId = parseInt(id, 10);

    console.log(contestantId)

    if (isNaN(contestantId)) {
      return NextResponse.json({ error: 'Invalid contestant ID' }, { status: 400 });
    }

    // Fetch the contestant data
    const contestant = await prisma.contestant.findUnique({
      where: { id: contestantId },
    });

    if (!contestant) {
      return NextResponse.json({ error: 'Contestant not found' }, { status: 404 });
    }



    console.log(
      'Total Points Calculation:',
      scoringCategories.reduce((total, category) => {
        const value = contestant[category.schemaKey as keyof typeof contestant];
        console.log(`Category: ${category.schemaKey}, Value: ${value}, Points: ${category.points}`);
        if (value === null) return total;
        if (typeof value === 'boolean') {
          return total + (value ? category.points : 0);
        }
        if (typeof value === 'number') {
          return total + value * category.points;
        }
        return total;
      }, 0)
    );

    // Calculate total points
    const totalPoints = scoringCategories.reduce((total, category) => {
      // Safely access the value
      const value = contestant[category.schemaKey as keyof typeof contestant];

      // Log for debugging
      console.log(`Processing ${category.schemaKey}:`, value, ` : pointvalue: ${category.points}`);

      if (value === null || value === undefined) {
        return total; // Skip null or undefined values
      }

      if (typeof value === 'boolean') {
        return total + (value ? category.points : 0);
      }

      if (typeof value === 'number') {
        return total + value * category.points;
      }

      // If the value doesn't match expected types, log a warning
      console.warn(`Unhandled value type for ${category.schemaKey}:`, value);
      return total;
    }, 0);

    return NextResponse.json({ contestantId, totalPoints });
  } catch (error) {
    console.error('Error fetching contestant points:', error);
    return NextResponse.json({ error: 'Failed to calculate points' }, { status: 500 });
  }
}
