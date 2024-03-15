import { ParticipantDto } from './participant.dto';
import { TeamDto } from './team.dto';
import { MatchDto } from './match.dto';

export class InfoDto {
  gameCreation: number;
  gameDuration: number;
  gameEndTimestamp?: number;
  gameId: number;
  gameMode: string;
  gameName: string;
  gameStartTimestamp: number;
  gameType: string;
  gameVersion: string;
  mapId: number;
  participants: ParticipantDto[];
  platformId: string;
  queueId: number;
  teams: TeamDto[];
  tournamentCode?: string;
  id: string;
  match: MatchDto;
}
