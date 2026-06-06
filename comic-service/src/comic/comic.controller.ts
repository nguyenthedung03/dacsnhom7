import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { ComicService } from './comic.service';

import { CreateComicDto } from './dto/create-comic.dto';
import { UpdateComicDto } from './dto/update-comic.dto';

import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

@Controller('comics')
export class ComicController {
  constructor(
    private readonly comicService: ComicService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('coverImage', {
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
    @UploadedFile() file: Express.Multer.File,
    @Body() createComicDto: CreateComicDto,
  ) {
    if (file) {
      createComicDto.coverImage =
        `http://localhost:3002/uploads/${file.filename}`;
    }

    return this.comicService.create(
      createComicDto,
    );
  }

  @Get()
  findAll() {
    return this.comicService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comicService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateComicDto: UpdateComicDto,
  ) {
    return this.comicService.update(
      id,
      updateComicDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.comicService.remove(id);
  }
}