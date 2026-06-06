import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ComicModule } from './comic/comic.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://mongodb:27017/comic_comic_db'),
    ComicModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}