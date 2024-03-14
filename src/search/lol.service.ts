// lol.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { SummonerDto } from './dto/summoner.dto';

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
      console.log('findSummonerByName 데이터 조회', data.data);
      return data.data;
    } catch (error) {
      console.error('API 요청 중 에러 발생:', error);
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

      // const sortedMastery = data.data.sort(
      //   (a, b) => b.championPoints - a.championPoints,
      // );
      // return sortedMastery.slice(0, 20);

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

  //최근 경기 가져오기
  // async getRecentMatches(summonerPuuid: string) {
  //   const url = `${
  //     this.baseUrl
  //   }/lol/match/v5/matches/by-puuid/${encodeURIComponent(summonerPuuid)}`;
  //   const headers = this.createHeaders();
  //
  //   const response = this.httpService.get(url, { headers });
  //   const data = await lastValueFrom(response);
  //   console.log('getRecentMatches 데이터 조회', data.data);
  //   return data.data;
  // }

  private createHeaders() {
    return {
      'X-Riot-Token': this.configService.get<string>('X-Riot-Token'),
      'User-Agent': this.configService.get<string>('USER_AGENT'),
      'Accept-Language': this.configService.get<string>('ACCEPT_LANGUAGE'),
      'Accept-Charset': this.configService.get<string>('ACCEPT_CHARSET'),
      Origin: this.configService.get<string>('ORIGIN'),
    };
  }

  //챔피언 목록 ?
  // async getChampions() {
  //   const url = `http://ddragon.leagueoflegends.com/cdn/12.5.1/data/en_US/champion.json`;
  //   const headers = {
  //     'X-Riot-Token': this.configService.get<string>('X-Riot-Token'),
  //     'User-Agent': this.configService.get<string>('USER_AGENT'),
  //     'Accept-Language': this.configService.get<string>('ACCEPT_LANGUAGE'),
  //     'Accept-Charset': this.configService.get<string>('ACCEPT_CHARSET'),
  //     Origin: this.configService.get<string>('ORIGIN'),
  //   };
  //
  //   const response = this.httpService.get(url, { headers });
  //   const data = await lastValueFrom(response);
  //   console.log('getChampions 데이터 조회', data.data);
  //   return data.data;
  // }

  //소환사 티어
  // async getSummonerTier(summonerId: string) {
  //   const url = `${this.baseUrl}/lol/league/v4/entries/by-summoner/${summonerId}`;
  //   const headers = {
  //     'X-Riot-Token': this.configService.get<string>('X-Riot-Token'),
  //     'User-Agent': this.configService.get<string>('USER_AGENT'),
  //     'Accept-Language': this.configService.get<string>('ACCEPT_LANGUAGE'),
  //     'Accept-Charset': this.configService.get<string>('ACCEPT_CHARSET'),
  //     Origin: this.configService.get<string>('ORIGIN'),
  //   };
  //   const response = this.httpService.get(url, { headers });
  //   const data = await lastValueFrom(response);
  //   console.log('getSummonerTier 데이터 조회', data.data);
  //   return data.data;
  // }
}
