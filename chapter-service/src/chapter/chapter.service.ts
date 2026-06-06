import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chapter, ChapterDocument } from '../schemas/chapter.schema';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { getChannel } from '../rabbitmq/rabbitmq.provider';
import { redisClient } from '../redis/redis.provider';
import { ConflictException } from '@nestjs/common';

@Injectable()
export class ChapterService {
  constructor(
    @InjectModel(Chapter.name)
    private chapterModel: Model<ChapterDocument>,
  ) {}

  async create(createChapterDto: CreateChapterDto) {
  const lockKey = `chapter_lock:${createChapterDto.comicId}:${createChapterDto.chapterNumber}`;

  const lock = await redisClient.set(
    lockKey,
    'LOCKED',
    {
      NX: true,
      EX: 10,
    },
  );

  if (!lock) {
    throw new ConflictException(
      'Another request is creating this chapter',
    );
  }

  try {
    const existingChapter =
      await this.chapterModel.findOne({
        comicId: createChapterDto.comicId,
        chapterNumber:
          createChapterDto.chapterNumber,
      });

    if (existingChapter) {
      throw new ConflictException(
        'Chapter number already exists',
      );
    }

    const chapter =
      await this.chapterModel.create(
        createChapterDto,
      );

    const channel = getChannel();

    channel.sendToQueue(
      'chapter.created',
      Buffer.from(
        JSON.stringify({
          chapterId: chapter._id,
          comicId: chapter.comicId,
          title: chapter.title,
          chapterNumber:
            chapter.chapterNumber,
        }),
      ),
    );

    console.log(
      'Event published: chapter.created',
    );

    return {
      message:
        'Chapter created successfully',
      chapter,
    };
  } finally {
    await redisClient.del(lockKey);
  }
}

  async findByComic(comicId: string) {
    return this.chapterModel
      .find({ comicId })
      .sort({ chapterNumber: 1 });
  }

  async findOne(id: string) {
    const chapter = await this.chapterModel.findById(id);

    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    return chapter;
  }

  async remove(id: string) {
    const chapter = await this.chapterModel.findByIdAndDelete(id);

    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    return {
      message: 'Chapter deleted successfully',
    };
  }
}