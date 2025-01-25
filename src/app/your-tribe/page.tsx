'use client';

import { useState, useEffect } from 'react';
import { useWindowSize } from 'react-use'
import Confetti from 'react-confetti'
import { IdentificationIcon } from '@heroicons/react/24/outline';
import ContestantProfile from '../components/ContestantProfile';
import Image from "next/image";

type Contestant = {
  id: number;
  name: string;
  tribes: number[];
  img: string; // This should match the field in your database
};

type Tribe = {
  id: number;
  name: string;
  color: string;
};


export default function Draft() {
  const [draftPicks, setDraftPicks] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);
  const { width, height } = useWindowSize()

  useEffect(() => {
    // Indicate that the component has mounted
    setMounted(true);
  }, []);

  // Function to draw rectangular shapes
  const drawRectangle = (ctx) => {
    ctx.beginPath();
    ctx.rect(-5, -3, 10, 6); // Adjust these values for rectangle size
    ctx.closePath();
  };


  return (
    <div className="">
      {mounted && (
        <Confetti
          width={width}
          height={height}
          colors={['#fc8c03', '#2bcc3e', '#ab2fed']}
          recycle={false}
          numberOfPieces={800}
          wind={0.01}
          drawShape={ctx => {
            ctx.beginPath();
            // Define the dimensions of the rectangle
            const width = 18;  // Width of the rectangle
            const height = 9;  // Height of the rectangle
            // Center the rectangle around the origin
            ctx.rect(-width / 2, -height / 2, width, height);
            ctx.fill();
            ctx.closePath();
          }}
        />
      )}
      <h1>Your Tribe</h1>

    </div>

  );

}