'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type SpoilerContextType = {
  revealSpoilers: boolean;
  toggleSpoilers: () => void;
};

const SpoilerContext = createContext<SpoilerContextType | undefined>(undefined);

export const SpoilerProvider = ({ children }: { children: ReactNode }) => {
  const [revealSpoilers, setRevealSpoilers] = useState(false);

  const toggleSpoilers = () => setRevealSpoilers((prev) => !prev);

  return (
    <SpoilerContext.Provider value={{ revealSpoilers, toggleSpoilers }}>
      {children}
    </SpoilerContext.Provider>
  );
};

export const useSpoiler = () => {
  const context = useContext(SpoilerContext);
  if (context === undefined) {
    throw new Error("useSpoiler must be used within a SpoilerProvider");
  }
  return context;
};
