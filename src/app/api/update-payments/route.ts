// pages/api/update-payments.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow PUT requests.
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { playerTribes } = req.body;

    // Validate that playerTribes is an array.
    if (!playerTribes || !Array.isArray(playerTribes)) {
      return res.status(400).json({ error: 'Invalid request body.' });
    }

    // Update the 'paid' status for each player tribe.
    const updatedTribes = await Promise.all(
      playerTribes.map(async (tribe: { id: number; paid: boolean }) => {
        return await prisma.playerTribe.update({
          where: { id: tribe.id },
          data: { paid: tribe.paid },
        });
      })
    );

    return res
      .status(200)
      .json({ message: 'Payment statuses updated successfully.', updatedTribes });
  } catch (error) {
    console.error('Error updating payment statuses:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
