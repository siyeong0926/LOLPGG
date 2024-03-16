import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { LolService } from './lol.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [SearchController],
  providers: [SearchService, LolService],
  exports: [LolService],
})
export class SearchModule {}
