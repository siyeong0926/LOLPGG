import { Controller, Get, Logger, Query, Render } from '@nestjs/common';
import { LolService } from './lol.service';

@Controller('/lolp.gg/search')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private lolService: LolService) {}
  // 상위 100위 소환사 랭킹을 조회하는 라우트

  @Get()
  @Render('summoner')
  async summonerSearch(@Query('summonerName') summonerName: string) {
    if (!summonerName) {
      throw new Error('소환사 이름이 필요합니다.');
    }

    this.logger.log(`소환사 이름 : ${summonerName}`);

    try {
      const summoner = await this.lolService.findSummonerByName(summonerName);
      this.logger.log(`소환사 정보 조회됨: ${summoner.name}`); // 간소화된 로깅
      await this.delay(1000); // 딜레이 추가

      const smId = await this.lolService.findSummonerById(summoner.id);
      this.logger.log(`소환사 정보 조회됨: ${smId}`); // 간소화된 로깅
      await this.delay(1000); // 딜레이 추가

      const summonerRank = await this.lolService.getSummonerRank(summoner.id);
      this.logger.log(`소환사 랭크 정보 조회됨 :`, summonerRank);
      await this.delay(1000); // 딜레이 추가

      const championMastery = await this.lolService.getChampionMastery(
        summoner.puuid,
      );
      this.logger.log(
        `챔피언 숙련도 조회 완료, 항목 수: ${championMastery.length}`,
      );
      await this.delay(1000); //딜레이 추가

      // const getRecentMatches = await this.lolService.getRecentMatches(
      //   summoner.puuid,
      // );
      // this.logger.log(
      //   `최근 경기 조회 완료, 경기 수: ${getRecentMatches.length}`,
      // );
      // await this.delay(1000); //딜레이 추가

      // const matchDetails =
      //   await this.lolService.getMatchDetails(getRecentMatches);
      // //this.logger.log(`경기 상세정보 조회 완료, 상세 정보 수: ${matchDetails}`);
      // await this.delay(1000); //딜레이 추가

      //------------------------------------------------------------------

      const championMap = await this.lolService.getChampionMap();

      const masteryWithNames = championMastery.map((mastery) => {
        const championInfo = championMap[mastery.championId.toString()] || {
          englishName: 'Unknown',
          koreanName: '알 수 없는 챔피언',
        };

        const timestamp = parseInt(mastery.lastPlayTime, 10);
        const lastPlayed = new Date(timestamp);
        const lastPlayedDate = lastPlayed.getTime()
          ? `${lastPlayed.toLocaleDateString(
              'ko-KR',
            )} ${lastPlayed.toLocaleTimeString('ko-KR')}`
          : '날짜 정보 없음';

        return {
          ...mastery,
          englishName: championInfo.englishName,
          championName: championInfo.koreanName,
          lastPlayedDate: lastPlayedDate,
        };
      });
      console.log('리턴 전에 출력', summoner);
      return {
        summoner,
        summonerRank,
        championMastery,
        masteryWithNames,
      };
    } catch (error) {
      this.logger.error(`오류 발생: ${error.message}`);
      throw new Error('사용자 정보를 가져 올 수 없음');
    }
  }
  @Get('/ranking')
  @Render('ranking')
  async getTopRanking(@Query('queue') queue: string) {
    if (!queue) {
      queue = 'RANKED_SOLO_5x5';
    }

    try {
      const topPlayers = await this.lolService.getChallengerPlayers(queue);
      // console.log('탑플레이어 출력', topPlayers);
      const detailedPlayers = [];

      for (const player of topPlayers) {
        const summonerDetails = await this.lolService.findSummonerById(
          player.summonerId,
        );

        detailedPlayers.push({
          rank: player.rank,
          summonerName: summonerDetails.name,
          profileIconId: summonerDetails.profileIconId,
          leaguePoints: player.leaguePoints,
          level: summonerDetails.summonerLevel, // 소환사 레벨 정보 추가
          wins: player.wins,
          losses: player.losses,
        });
      }
      // console.log('디테일 플레이어 출력', detailedPlayers);
      return {
        topPlayers: detailedPlayers,
      };
    } catch (error) {
      console.error(`오류 발생: ${error.message}`);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
