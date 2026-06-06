import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comic, ComicDocument } from '../schemas/comic.schema';
import { CreateComicDto } from './dto/create-comic.dto';
import { UpdateComicDto } from './dto/update-comic.dto';
import { redisClient } from '../redis/redis.provider';
import { getChannel } from '../rabbitmq/rabbitmq.provider';

@Injectable()
export class ComicService {
  constructor(
    @InjectModel(Comic.name)
    private comicModel: Model<ComicDocument>,
  ) {}

  async create(createComicDto: CreateComicDto) {
    const comic = await this.comicModel.create(createComicDto);

    await redisClient.del('all_comics');
    const channel = getChannel();

    channel.sendToQueue(
      'comic.created',
      Buffer.from(
        JSON.stringify({
            comicId: comic._id,
            title: comic.title,
            author: comic.author,
            genres: comic.genres,
            description: comic.description,
            coverImage: comic.coverImage,
            status: comic.status,
        }),
      ),
    );

    console.log('Event published: comic.created');

    return {
      message: 'Comic created successfully',
      comic,
    };
  }

  async findAll() {
    const cachedComics = await redisClient.get('all_comics');

    if (cachedComics) {
      console.log('Data from Redis Cache');

      return JSON.parse(cachedComics);
    }

    console.log('Data from MongoDB');

    const comics = await this.comicModel
      .find()
      .sort({ createdAt: -1 });

    await redisClient.set(
      'all_comics',
      JSON.stringify(comics),
      {
        EX: 60,
      },
    );

    return comics;
  }

  async findOne(id: string) {
    const comic = await this.comicModel.findById(id);

    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    return comic;
  }

  async update(id: string, updateComicDto: UpdateComicDto) {
    const comic = await this.comicModel.findByIdAndUpdate(
      id,
      updateComicDto,
      {
        new: true,
      },
    );

    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    await redisClient.del('all_comics');

    return {
      message: 'Comic updated successfully',
      comic,
    };
  }

  async remove(id: string) {
    const comic = await this.comicModel.findByIdAndDelete(id);

    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    await redisClient.del('all_comics');

    return {
      message: 'Comic deleted successfully',
    };
  }
}