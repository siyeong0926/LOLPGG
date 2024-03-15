export class RankDto {
  tier: string;
  rank: string;
  leaguePoints: bigint;

  queueType: 'RANKED_SOLO_5x5';
  wins: bigint;
  losses: bigint;
}
