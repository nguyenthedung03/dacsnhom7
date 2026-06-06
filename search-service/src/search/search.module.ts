import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import {
  SearchComic,
  SearchComicSchema,
} from '../schemas/search-comic.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SearchComic.name,
        schema: SearchComicSchema,
      },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}