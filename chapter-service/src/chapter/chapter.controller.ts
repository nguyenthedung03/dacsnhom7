import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';

import { ChapterService } from './chapter.service';

import { CreateChapterDto } from './dto/create-chapter.dto';

import { FilesInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

@Controller('chapters')
export class ChapterController {
  constructor(
    private readonly chapterService: ChapterService,
  ) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 100, {
      storage: diskStorage({
        destination: './uploads',

        filename: (req, file, callback) => {
          const uniqueName =
            Date.now() +
            '-' +
            file.originalname;

          callback(null, uniqueName);
        },
      }),
    }),
  )
  create(
    @UploadedFiles()
    files: Express.Multer.File[],

    @Body()
    createChapterDto: CreateChapterDto,
  ) {
    if (files?.length) {
      createChapterDto.images = files.map(
        (file) =>
          `http://localhost:3003/uploads/${file.filename}`,
      );
    }

    createChapterDto.chapterNumber =
      Number(createChapterDto.chapterNumber);

    return this.chapterService.create(
      createChapterDto,
    );
  }

  @Get('comic/:comicId')
  findByComic(
    @Param('comicId') comicId: string,
  ) {
    return this.chapterService.findByComic(
      comicId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chapterService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chapterService.remove(id);
  }
}