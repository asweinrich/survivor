'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export const AVAILABLE_SEASONS = ['50', '49', '48', '47'];
export const CURRENT_SEASON = '50';

type SeasonContextType = {
  season: string;
  setSeason: (season: string) => void;
  availableSeasons: string[];
};

const SeasonContext = createContext<SeasonContextType | undefined>(undefined);

export const SeasonProvider = ({ children }: { children: ReactNode }) => {
  const [season, setSeason] = useState(CURRENT_SEASON);

  return (
    <SeasonContext.Provider value={{ season, setSeason, availableSeasons: AVAILABLE_SEASONS }}>
      {children}
    </SeasonContext.Provider>
  );
};

export const useSeason = () => {
  const context = useContext(SeasonContext);
  if (context === undefined) {
    throw new Error('useSeason must be used within a SeasonProvider');
  }
  return context;
};