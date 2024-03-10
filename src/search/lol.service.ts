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
  private requestHeader: { [key: string]: string };

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    // Riot Games API의 기본 URL 설정
    this.baseUrl = 'https://kr.api.riotgames.com';

    // Riot Games API 키를 환경변수에서 가져오기
    this.apiKey = this.configService.get<string>('RIOT_API_KEY');

    this.requestHeader = {
      'User-Agent': this.configService.get<string>('USER_AGENT'),
      'Accept-Language': this.configService.get<string>('ACCEPT_LANGUAGE'),
      'Accept-Charset': this.configService.get<string>('ACCEPT_CHARSET'),
      Origin: this.configService.get<string>('ORIGIN'),
      'X-Riot-Token': this.configService.get<string>('RIOT_API_KEY'),
    };
  }

  // 소환사 이름으로 소환사 정보 조회
  async findSummonerByName(summonerName: string): Promise<SummonerDto> {
    const url = `${
      this.baseUrl
    }/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`;

    try {
      const response = await lastValueFrom(
        this.httpService.get<SummonerDto>(url, {
          headers: {
            'User-Agent': this.requestHeader['User-Agent'],
            'Accept-Language': this.requestHeader['Accept-Language'],
            'Accept-Charset': this.requestHeader['Accept-Charset'],
            Origin: this.requestHeader['Origin'],
            'X-Riot-Token': this.requestHeader['X-Riot-Token'],
          },
        }),
      );
      console.log('소환사 이름으로 소환사 정보 조회 ', response.data);

      return response.data;
    } catch (error) {
      console.error(
        `소환사 데이터를 가져오는 중 오류 발생 , 소환사 이름 : ${summonerName}:`,
        error.response?.data || error.message,
      );
      throw new Error('소환사 데이터를 가져오는 데 실패 했습니다.');
    }
  }

  // 소환사 ID를 통해 해당 소환사의 챔피언 숙련도 정보를 가져옴
  async getChampionMastery(summonerId: string) {
    const url = `${this.baseUrl}/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}`;
    const response = await lastValueFrom(
      this.httpService.get(url, {
        headers: {
          'User-Agent': this.requestHeader['User-Agent'],
          'Accept-Language': this.requestHeader['Accept-Language'],
          'Accept-Charset': this.requestHeader['Accept-Charset'],
          Origin: this.requestHeader['Origin'],
          'X-Riot-Token': this.requestHeader['X-Riot-Token'],
        },
      }),
    );
    console.log('소환사 id 를 통해 챔피언 숙련도 정보 데이터', response.data);
    return response.data;
  }

  //최근 경기 가져오기
  async getRecentMatches(accountId: string) {
    const url = `${this.baseUrl}/lol/match/v4/matchlists/by-account/${accountId}?endIndex=10`;
    const response = await lastValueFrom(
      this.httpService.get(url, {
        headers: {
          'User-Agent': this.requestHeader['User-Agent'],
          'Accept-Language': this.requestHeader['Accept-Language'],
          'Accept-Charset': this.requestHeader['Accept-Charset'],
          Origin: this.requestHeader['Origin'],
          'X-Riot-Token': this.requestHeader['X-Riot-Token'],
        },
      }),
    );
    console.log('최근 경기 데이터 ', response.data);
    return response.data;
  }

  //챔피언 목록 ?
  async getChampions() {
    const url = `http://ddragon.leagueoflegends.com/cdn/12.5.1/data/en_US/champion.json`;
    const response = await lastValueFrom(this.httpService.get(url));
    console.log('챔피언 목록 가져오기 ', response.data);
    return response.data;
  }

  //소환사 티어
  async getSummonerTier(summonerId: string) {
    const url = `${this.baseUrl}/lol/league/v4/entries/by-summoner/${summonerId}`;
    const response = await lastValueFrom(
      this.httpService.get(url, {
        headers: {
          'User-Agent': this.requestHeader['User-Agent'],
          'Accept-Language': this.requestHeader['Accept-Language'],
          'Accept-Charset': this.requestHeader['Accept-Charset'],
          Origin: this.requestHeader['Origin'],
          'X-Riot-Token': this.requestHeader['X-Riot-Token'],
        },
      }),
    );
    console.log('소환사 티어 데이터 ', response.data);
    return response.data;
  }
}
