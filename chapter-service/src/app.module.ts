import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChapterModule } from './chapter/chapter.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://mongodb:27017/comic_chapter_db'),
    ChapterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}