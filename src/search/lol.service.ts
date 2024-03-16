// lol.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { SummonerDto } from './dto/summoner.dto';
import { RankDto } from './dto/rank.dto';

@Injectable()
export class LolService {
  private apiKey: string;
  private baseUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    // Riot Games API의 기본 URL 설정
    this.baseUrl = 'https://kr.api.riotgames.com';

    // Riot Games API 키를 환경변수에서 가져오기
    this.apiKey = this.configService.get<string>('RIOT_API_KEY');
  }

  // 소환사 이름으로 소환사 정보 조회
  async findSummonerByName(summonerName: string): Promise<SummonerDto> {
    const region = 'kr';
    const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(
      summonerName,
    )}`;
    const headers = this.createHeaders();

    try {
      const response = this.httpService.get(url, { headers });
      const data = await lastValueFrom(response);
      //console.log('findSummonerByName 데이터 조회', data.data);
      return data.data;
    } catch (error) {
      console.error('API 요청 중 에러 발생:', error);
      throw error;
    }
  }

  async findSummonerById(summonerId: string): Promise<SummonerDto> {
    const region = 'kr'; // 또는 다른 리전
    const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/${encodeURIComponent(
      summonerId,
    )}`;
    const headers = this.createHeaders();

    try {
      const response = await lastValueFrom(
        this.httpService.get<SummonerDto>(url, { headers }),
      );
      return response.data;
    } catch (error) {
      console.error('findSummonerById API 요청 중 에러 발생:', error);
      throw error;
    }
  }

  //소환사 랭크
  async getSummonerRank(summonerId: string): Promise<RankDto[]> {
    const url = `${
      this.baseUrl
    }/lol/league/v4/entries/by-summoner/${encodeURIComponent(summonerId)}`;
    const headers = this.createHeaders();

    try {
      await this.delay(1000);
      const response = await lastValueFrom(
        this.httpService.get<RankDto[]>(url, { headers }),
      );

      const rank = response.data.map((entry) => {
        //console.log('엔트리 출력', entry.tier, entry.rank, entry.leaguePoints);

        console.error(entry);
        return {
          ...entry,
        };
      });
      return rank;
    } catch (error) {
      console.error('getSummonerRank 요청 중 에러 발생:', error);
      throw error;
    }
  }
  async getChallengerPlayers(queue: string): Promise<any[]> {
    const url = `${this.baseUrl}/lol/league/v4/challengerleagues/by-queue/${queue}`;
    const headers = this.createHeaders();

    try {
      const response = await lastValueFrom(
        this.httpService.get(url, { headers }),
      );
      const players = response.data.entries;

      // LP(리그 포인트)로 내림차순 정렬
      const sortedPlayers = players.sort(
        (a, b) => b.leaguePoints - a.leaguePoints,
      );

      // 상위 20명 플레이어만 반환
      return sortedPlayers.slice(0, 20);
    } catch (error) {
      console.error('getChallengerPlayers 요청 중 에러 발생:', error);
      throw error;
    }
  }

  // 소환사 ID를 통해 해당 소환사의 챔피언 숙련도 정보를 가져옴
  async getChampionMastery(summonerPuuid: string) {
    const url = `${
      this.baseUrl
    }/lol/champion-mastery/v4/champion-masteries/by-puuid/${encodeURIComponent(
      summonerPuuid,
    )}`;

    const headers = this.createHeaders();

    try {
      const response = this.httpService.get(url, { headers });
      const data = await lastValueFrom(response);

      return data.data;
    } catch (error) {
      console.error('getChampionMastery 요청 중 에러 발생:', error);
      throw error;
    }
  }

  async getChampionMap() {
    const url = `http://ddragon.leagueoflegends.com/cdn/14.5.1/data/ko_KR/champion.json`;

    const headers = this.createHeaders();

    try {
      const response = await lastValueFrom(
        this.httpService.get(url, { headers }),
      );
      const champions = response.data.data;
      const championMap = {};
      for (const key in champions) {
        const champion = champions[key];
        // 챔피언 ID를 키로 하고, 영문 이름과 한글 이름을 값으로 하는 객체를 저장
        championMap[champion.key] = {
          englishName: key, // 영문 이름 (Data Dragon의 key 사용)
          koreanName: champion.name, // 한글 이름
        };
      }
      return championMap;
    } catch (error) {
      console.error('getChampionMap 에러:', error);
      throw new Error('챔피언 정보 가져오기 실패');
    }
  }

  // //최근 경기 가져오기
  // async getRecentMatches(matchesPuuid: string) {
  //   const url = `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(
  //     matchesPuuid,
  //   )}/ids?start=0&count=20`;
  //   const headers = this.createHeaders();
  //
  //   const response = this.httpService.get(url, { headers });
  //   const data = await lastValueFrom(response);
  //   //console.log('getRecentMatches 데이터 조회', data.data);
  //   return data.data;
  // }

  // 가져온 최근 경기에서 KDA, 게임 , 결과 가져오기
  // async getMatchDetails(matchIds: string[]) {
  //   const matchesDetails = [];
  //   for (const matchId of matchIds) {
  //     const url = `https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  //     const headers = this.createHeaders();
  //
  //     try {
  //       await this.delay(1200 / matchIds.length); // API 속도 제한에 맞추어 요청 간 지연 추가
  //       const response = await lastValueFrom(
  //         this.httpService.get(url, { headers }),
  //       );
  //       const matchData = response.data;
  //
  //       const dataCZ = {
  //         info: {
  //           id: matchData.info.gameId,
  //           win: matchData.info.participants.win,
  //           participants: matchData.info.participants,
  //           time: {
  //             start: matchData.info.gameStartTimestamp,
  //             end: matchData.info.gameEndTimestamp,
  //             play:
  //               matchData.info.gameEndTimestamp -
  //               matchData.info.gameStartTimestamp,
  //           },
  //         },
  //       };
  //       console.log('dataCZ 출력용', dataCZ);
  //     } catch (error) {
  //       console.error(
  //         `매치 ID ${matchId}에 대한 상세 정보 조회 중 에러 발생:`,
  //         error,
  //       );
  //     }
  //   }
  //
  //   return matchesDetails;
  // }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private createHeaders() {
    return {
      'X-Riot-Token': this.configService.get<string>('X-Riot-Token'),
      'User-Agent': this.configService.get<string>('USER_AGENT'),
      'Accept-Language': this.configService.get<string>('ACCEPT_LANGUAGE'),
      'Accept-Charset': this.configService.get<string>('ACCEPT_CHARSET'),
      Origin: this.configService.get<string>('ORIGIN'),
    };
  }
}
