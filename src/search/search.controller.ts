import { Controller, Get, Logger, Query, Render } from '@nestjs/common';
import { LolService } from './lol.service';

@Controller('/lolp.gg/search')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private lolService: LolService) {}
  // 상위 100위 소환사 랭킹을 조회하는 라우트

  /**
   * 소환사 이름으로 소환사 정보를 검색하고 결과를 반환
   *
   * @returns 검색된 소환사 정보, 랭크, 숙련도, 최근 성능 등을 포함하는 객체.
   * @param gameName
   * @param tagLine
   */
  @Get('')
  @Render('summoner')
  async summonerSearch(@Query('summonerName') summonerName: string) {
    try {
      // summonerName을 로그로 출력하여 확인
      this.logger.log(`입력된 summonerName: ${summonerName}`);

      // summonerName에서 gameName과 tagLine을 분리
      const [gameName, tagLine] = summonerName.split('#');

      // gameName과 tagLine이 제대로 분리되었는지 확인
      this.logger.log(`gameName: ${gameName}, tagLine: ${tagLine}`);

      // 로그로 확인
      console.log('gameName 출력 : ', summonerName);

      // 소환사 이름으로 소환사 정보 조회
      const summoner = await this.lolService.getSummonerInfoByRiotId(
        gameName,
        tagLine,
      );

      this.logger.log(`소환사 정보 조회됨: ${summoner.name}`);
      await this.delay(500); // 딜레이 추가

      // 소환사 ID로 랭크 정보 조회
      const summonerRank = await this.lolService.getSummonerRank(summoner.id);
      this.logger.log(`소환사 랭크 정보 조회됨 :`, summonerRank);
      await this.delay(500); // 딜레이 추가

      //소환사 PUUID 사용해서 챔피언 숙련도 조회
      const championMastery = await this.lolService.getChampionMastery(
        summoner.puuid,
      );
      this.logger.log(
        `챔피언 숙련도 조회 완료, 항목 수: ${championMastery.length}`,
      );
      await this.delay(500); //딜레이 추가

      // 소환사 챔피언별 성능 조회
      const championPerformance = await this.lolService.getChampionPerformance(
        summoner.puuid,
      );
      this.logger.log(`챔피언 성능 정보 조회 완료`);

      // 소환사 이름(영어,한글) 정보 조회
      const championMap = await this.lolService.getChampionMap();

      // const matchDetails =
      //   await this.lolService.getMatchDetails(getRecentMatches);
      // //this.logger.log(`경기 상세정보 조회 완료, 상세 정보 수: ${matchDetails}`);
      // await this.delay(1000); //딜레이 추가

      //------------------------------------------------------------------

      // 숙련도 정보와 매핑된 챔피언 이름 결합
      const masteryWithNames = championMastery.map((mastery) => {
        const championInfo = championMap[mastery.championId.toString()] || {
          englishName: 'Unknown',
          koreanName: '알 수 없는 챔피언',
        };

        //챔피언을 사용한 마지막 시간 체크
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
      // console.log('리턴 전에 출력', championRotation);
      return {
        summoner,
        summonerRank,
        championMastery,
        masteryWithNames,
        championPerformance,
      };
    } catch (error) {
      this.logger.error(`오류 발생: ${error.message}`);
      throw new Error('사용자 정보를 가져 올 수 없음');
    }
  }

  // 솔로랭크 상위 TOP20 소환사
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
      // 오류 출력 시 전체 에러 객체를 출력하도록 수정
      this.logger.error(`오류 발생: ${error.message}`);
      this.logger.error(error); // 전체 오류 객체를 출력
      throw new Error('사용자 정보를 가져 올 수 없음');
    }
  }

  //현재 챔피언 로테이션
  @Get('/rotation')
  @Render('rotation')
  async getChampionRotation() {
    try {
      const champions = await this.lolService.getFreeChampionRotation();
      return { champions };
    } catch (error) {
      this.logger.error(`로테이션 챔피언 조회 오류: ${error.message}`);
      throw new Error('로테이션 챔피언 정보를 가져올 수 없습니다.');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
