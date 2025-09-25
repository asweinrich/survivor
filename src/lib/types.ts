export type Contestant = {
  id: number;
  name: string;
  tribes: number[];
  inPlay: boolean;
  img: string;
  voteOutOrder: number;
  points: number;
  soleSurvivor: boolean;
  pastSeasons?: PastSeason[]; 
};

export type PastSeason = {
  seasonName: string;     
  color: string;          
  seasonNumber?: number;  
};

export type PlayerTribe = {
  id: number;
  tribeName: string;
  color: string;
  emoji: string;
  playerName: string;
  playerEmail: string;
  playerId: number;
  tribeArray: number[];
  createdAt: string;
  score?: number;
  pastScore: number;
  rank?: number;
  paid: boolean;
  season: number;
};

export type Tribe = {
  id: number;
  name: string;
  color: string;
};

export type RankedPlayerTribe = PlayerTribe & { rank: number };

export type UserBadge = {
  id: number;
  name: string;
  emoji: string;
  description: string;
  color: string;
  rank: number;
};

export type PickEmScoreBreakdown = {
  pickEmId: number;
  optionId: number;
  isCorrect: boolean;
  points: number;
  value: number;
  question: string;
  type: string;
  label?: string; // e.g. tribe or contestant name
};

