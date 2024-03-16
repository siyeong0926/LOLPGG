export class RankDto {
  leagueId: string;
  summonerId: string;
  summonerName: string;
  queueType: string;
  tier: RiotTier;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  hotStreak: boolean;
  veteran: boolean;
  freshBlood: boolean;
  inactive: boolean;
  miniSeries?: MiniSeriesDto; // Optional, depending on whether the summoner is in a series
}

export class MiniSeriesDto {
  losses: number;
  progress: string;
  target: number;
  wins: number;
}

//소환사 티어
type RiotTier =
  | 'CHALLENGER'
  | 'GRANDMASTER'
  | 'MASTER'
  | 'DIAMOND'
  | 'EMERALD'
  | 'PLATINUM'
  | 'GOLD'
  | 'SILVER'
  | 'BRONZE'
  | 'IRON';
