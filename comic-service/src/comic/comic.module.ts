import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ComicService } from './comic.service';
import { ComicController } from './comic.controller';
import { Comic, ComicSchema } from '../schemas/comic.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Comic.name,
        schema: ComicSchema,
      },
    ]),
  ],
  controllers: [ComicController],
  providers: [ComicService],
})
export class ComicModule {}