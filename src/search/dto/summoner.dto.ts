/** 2023/06/28 - [소환사id로 소환사 정보 얻기]
 * (https://developer.riotgames.com/apis#league-v4/GET_getLeagueEntriesForSummoner) by 1-blue */

export class SummonerDto {
  accountId: string;
  /** "RANKED_SOLO_5x5" | "RANKED_FLEX_SR" */
  queueType: RiotQueueType;
  /** "CHALLENGER" | "GRANDMASTER" | "MASTER" | "DIAMOND" | "EMERALD" | "PLATINUM" | "GOLD" | "SILVER" | "BRONZE" | "IRON" */
  tier: RiotTier;
  /** "I" | "II" | "III" | "IV" */
  rank: RiotRank;
  /** 암호화된 소환사 ID */
  id: string;
  /** 소환사 이름 */
  puuid: string;
  /** 소환사 이름 */
  summonerName: string;

  name: string;

  summonerLevel: string;
  /** 리그 점수 */
  leaguePoints: number;
  /** 승리 횟수 */
  wins: number;
  /** 패배 횟수 */
  losses: number;
  /** 비활성화 여부 */
  inactive: boolean;
  /** 이전 시즌 기록 있는지 여부 ? */
  veteran: boolean;
  /** 이전 시즌 기록 있는지 여부 ? */
  freshBlood: boolean;
  /** 연승 연패 여부 ? */
  hotStreak: boolean;

  matadata: string;

  info: string;

  profileIconId: string;
}
//게임타입
type RiotQueueType = 'RANKED_SOLO_5x5' | 'RANKED_FLEX_SR';

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

// 티어 별 랭크단계
type RiotRank = 'I' | 'II' | 'III' | 'IV';
