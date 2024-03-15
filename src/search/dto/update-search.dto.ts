import { PartialType } from '@nestjs/mapped-types';
import { SummonerDto } from './summoner.dto';

export class UpdateSearchDto extends PartialType(SummonerDto) {}
