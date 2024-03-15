import { Controller, Get, Logger, Query, Render } from '@nestjs/common';
import { LolService } from './lol.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Riot API')
@Controller('/search')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private lolService: LolService) {}

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

      const summonerRank = await this.lolService.getSummonerRank(summoner.id);
      this.logger.log(`소환사 랭크 정보 조회됨 :`, summonerRank);

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
      console.log('리턴 전에 서머너 랭크 출력', summonerRank);
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

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
