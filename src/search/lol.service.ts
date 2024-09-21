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

  //소환사 NAME을 이용하여 소환사 정보를 조회. ( 0919 기준 앞으로 폐기 예정이라함 )
  // async findSummonerByName(summonerName: string): Promise<SummonerDto> {
  //   const region = 'kr';
  //   const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(
  //     summonerName,
  //   )}`;
  //   const headers = this.createHeaders();
  //
  //   try {
  //     const response = this.httpService.get(url, { headers });
  //     const data = await lastValueFrom(response);
  //     return data.data;
  //   } catch (error) {
  //     console.error('API 요청 중 에러 발생:', error);
  //     throw error;
  //   }
  // }

  // Riot ID로 소환사 검색 할 수 있는 정보 가져오기
  async getSummonerInfoByRiotId(
    gameName: string,
    tagLine: string,
  ): Promise<SummonerDto> {
    try {
      // Riot ID로 PUUID 조회
      const riotIdUrl = `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;

      console.error('riotIdUrl 출력', riotIdUrl);

      const riotIdResponse = await lastValueFrom(
        this.httpService.get(riotIdUrl, {
          headers: this.createHeaders(),
        }),
      );

      const puuid = riotIdResponse.data.puuid;
      console.error('puuid 출력 : ', puuid);
      if (!puuid) {
        throw new Error(
          'PUUID 조회 실패: Riot API에서 PUUID가 반환되지 않았습니다.',
        );
      }

      // PUUID를 이용해 소환사 정보 조회
      const summonerInfoUrl = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;

      const summonerInfoResponse = await lastValueFrom(
        this.httpService.get(summonerInfoUrl, {
          headers: this.createHeaders(),
        }),
      );

      return summonerInfoResponse.data;
    } catch (error) {
      // HTTP 오류인 경우 상태 코드와 응답 데이터를 로그로 출력
      if (error.response) {
        console.error(`HTTP 오류 발생 - 상태 코드: ${error.response.status}`);
        console.error(`오류 데이터:`, error.response.data);

        // 상태 코드에 따른 메시지 추가
        if (error.response.status === 404) {
          console.error(
            '소환사 정보를 찾을 수 없습니다. 잘못된 Riot ID일 수 있습니다.',
          );
        } else if (error.response.status === 403) {
          console.error(
            'API 인증 실패: API Key가 유효하지 않거나 권한이 없습니다.',
          );
        } else if (error.response.status === 429) {
          console.error('Rate Limit 초과: 너무 많은 요청을 보냈습니다.');
        }
      } else {
        // 일반적인 오류 처리 (네트워크 문제 등)
        console.error(
          'API 요청 중 네트워크 또는 서버 오류 발생:',
          error.message,
        );
      }

      throw error; // 예외를 다시 던져서 상위 호출자가 처리할 수 있도록 함
    }
  }

  // Riot ID로 소환사 조회
  async findSummonerByRiotId(puuid: string): Promise<SummonerDto> {
    const url = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(
      puuid,
    )}`;

    const headers = this.createHeaders();

    try {
      const response = await lastValueFrom(
        this.httpService.get(url, { headers }),
      );
      return response.data;
    } catch (error) {
      console.error('findSummonerByRiotId 요청 중 에러 발생:', error);
      throw error;
    }
  }

  //소환사 ID를 이용하여 소환사 정보를 조회
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
      //console.error('소환사 정보 조회 출력 : ', response);
      return response.data;
    } catch (error) {
      console.error('findSummonerById API 요청 중 에러 발생:', error);
      throw error;
    }
  }

  //소환사 ID를 이용해서 검색하는 소환사 랭크정보 조회
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

  // 큐 타입(랭크)에 대한 챌린저 플레이어 목록 검색
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
      // 소환사 이름을 추가로 조회
      const detailedPlayers = await Promise.all(
        sortedPlayers.slice(0, 10).map(async (player) => {
          await this.delay(1000); // API 요청 간에 1초 간격을 추가

          console.log('player 출력 : ', player);
          // 소환사 ID로 소환사 이름을 조회
          const summonerDetails = await this.findSummonerById(
            player.summonerId,
          );
          // const summonerDetailsPuuid = await this.findSummonerByRiotId(
          //   summonerDetails.puuid,
          // );
          console.error('summonerDetails 출력', summonerDetails);
          // console.error('summonerDetailsPuuid 출력', summonerDetailsPuuid);

          return {
            ...player,
            summonerName: summonerDetails.name, // 소환사 이름 추가
            profileIconId: summonerDetails.profileIconId, // 소환사 아이콘 추가
          };
        }),
      );

      // 상위 20명 플레이어만 반환
      return detailedPlayers;
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

  // 리그오브레전드 소환사 모든 챔피언 정보를 불러온 후 챔피언 id, 영어 이름 ,한글 이름 매핑
  async getChampionMap() {
    const url = `http://ddragon.leagueoflegends.com/cdn/14.18.1/data/ko_KR/champion.json`;
    //https://ddragon.leagueoflegends.com/api/versions.json 여기서 최신 버전 확인
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

  // 한 주(현재) 챔피언 로테이션 검색
  async getFreeChampionRotation(): Promise<any> {
    const url = `${this.baseUrl}/lol/platform/v3/champion-rotations`;
    const headers = this.createHeaders();

    try {
      const response = await lastValueFrom(
        this.httpService.get(url, { headers }),
      );
      const championIds = response.data.freeChampionIds;

      // 챔피언 ID를 사용하여 챔피언 이름 및 기타 정보 조회
      const champions = championIds.map(async (id) => {
        return await this.getChampionDetailsById(id);
      });

      return Promise.all(champions);
    } catch (error) {
      console.error('getFreeChampionRotation 요청 중 에러 발생:', error);
      throw error;
    }
  }

  //챔피언 ID를 사용하여 챔피언의 상세 정보를 검색합니다.
  async getChampionDetailsById(championId: number): Promise<any> {
    const championMap = await this.getChampionMap();
    return (
      championMap[championId.toString()] || { name: 'Unknown', id: championId }
    );
  }

  //최근 경기 가져오기
  async getRecentMatches(matchesPuuid: string) {
    const url = `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${encodeURIComponent(
      matchesPuuid,
    )}/ids?start=0&count=20`;
    const headers = this.createHeaders();

    const response = this.httpService.get(url, { headers });
    const data = await lastValueFrom(response);
    //console.log('getRecentMatches 데이터 조회', data.data);
    return data.data;
  }

  // 최근 경기 상세 조회
  async getMatchDetails(matchIds: string[]) {
    const matchesDetails = [];
    for (const matchId of matchIds) {
      const url = `https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}`;
      const headers = this.createHeaders();

      try {
        await this.delay(1200 / matchIds.length); // API 속도 제한에 맞추어 요청 간 지연 추가
        const response = await lastValueFrom(
          this.httpService.get(url, { headers }),
        );
        const matchData = response.data;

        const testData = {
          info: {
            id: matchData.info.gameId,
            win: matchData.info.participants.win,
            participants: matchData.info.participants,
            time: {
              start: matchData.info.gameStartTimestamp,
              end: matchData.info.gameEndTimestamp,
              play:
                matchData.info.gameEndTimestamp -
                matchData.info.gameStartTimestamp,
            },
          },
        };
        matchesDetails.push(testData);
        // console.log('testData 출력용', testData);
      } catch (error) {
        console.error(
          `매치 ID ${matchId}에 대한 상세 정보 조회 중 에러 발생:`,
          error,
        );
      }
    }

    return matchesDetails;
  }

  // 소환사의 PUUID를 사용하여 해당 소환사의 챔피언별 경기 성능을 분석
  async getChampionPerformance(summonerPuuid) {
    const matchIds = await this.getRecentMatches(summonerPuuid);
    const matchDetails = await this.getMatchDetails(matchIds);
    // 챔피언 맵을 가져옵니다.
    const championMap = await this.getChampionMap();

    const championPerformance = matchDetails.reduce((performance, match) => {
      const participant = match.info.participants.find(
        (p) => p.puuid === summonerPuuid,
      );
      if (participant) {
        const { championId, win } = participant; // championName 대신 championId 사용
        const championInfo = championMap[championId]; // 챔피언 ID를 사용하여 맵에서 정보를 가져옵니다.

        if (championInfo && !performance[championInfo.englishName]) {
          performance[championInfo.englishName] = {
            wins: 0,
            losses: 0,
            championName: championInfo.englishName, // 영문 이름
            championKoreanName: championInfo.koreanName, // 한글 이름 추가
          };
        }

        if (win) {
          performance[championInfo.englishName].wins += 1;
        } else {
          performance[championInfo.englishName].losses += 1;
        }
      }
      return performance;
    }, {});

    const performanceArray = Object.keys(championPerformance).map(
      (champion) => {
        const { wins, losses, championName, championKoreanName } =
          championPerformance[champion];
        const winrate = ((wins / (wins + losses)) * 100).toFixed(2);
        return {
          championName,
          championKoreanName,
          wins,
          losses,
          winrate,
        };
      },
    );

    return performanceArray;
  }

  //API 요청 속도에 지장이 없도록 요청간 딜레이 추가
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  //API 사용을 위한 헤더
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
