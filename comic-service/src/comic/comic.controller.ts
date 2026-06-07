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
          const uniqueName = Date.now() + '-' + file.originalname;
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
      createComicDto.coverImage = `http://localhost:3002/uploads/${file.filename}`;
    }
    // Parse genres nếu là JSON string: '["Kỳ Ảo","Phiêu Lưu"]' → ['Kỳ Ảo','Phiêu Lưu']
    if (typeof (createComicDto as any).genres === 'string') {
      try {
        (createComicDto as any).genres = JSON.parse((createComicDto as any).genres);
      } catch {
        (createComicDto as any).genres = [(createComicDto as any).genres];
      }
    }
    return this.comicService.create(createComicDto);
  }

  @Get()
  findAll() {
    return this.comicService.findAll();
  }

  // Top 3 truyện hot nhất (mua nhiều nhất)
  @Get('top')
  getTopComics() {
    return this.comicService.getTopComics();
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
    if (typeof (updateComicDto as any).genres === 'string') {
      try {
        (updateComicDto as any).genres = JSON.parse((updateComicDto as any).genres);
      } catch {
        (updateComicDto as any).genres = [(updateComicDto as any).genres];
      }
    }
    return this.comicService.update(id, updateComicDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.comicService.remove(id);
  }

  // Đánh giá sao sau mua hàng: POST /comics/:id/review  { star: 1-5 }
  @Post(':id/review')
  submitReview(
    @Param('id') id: string,
    @Body('star') star: number,
  ) {
    return this.comicService.submitReview(id, Number(star));
  }

  // Tăng lượt mua: POST /comics/:id/increment-purchase  { quantity: number }
  @Post(':id/increment-purchase')
  incrementPurchase(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    return this.comicService.incrementPurchase(id, Number(quantity) || 1);
  }
}
