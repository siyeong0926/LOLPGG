import { BanDto } from './ban.dto';
import { ObjectivesDto } from './objectives.dto';

export class TeamDto {
  bans: BanDto[];
  objectives: ObjectivesDto;
  teamId: number;
  win: boolean;
}
