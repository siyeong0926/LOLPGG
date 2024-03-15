import { PerkStyleSelectionDto } from './perkStyleSelection.dto';

export class PerkStyleDto {
  description: string;
  selections: PerkStyleSelectionDto[];
  style: number;
}
