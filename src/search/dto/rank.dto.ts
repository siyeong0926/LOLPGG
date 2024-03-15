export class RankDto {
  leagueId: string;
  summonerId: string;
  summonerName: string;
  queueType: string;
  tier: string;
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
